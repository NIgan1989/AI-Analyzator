// services/dataProcessor.ts
import * as XLSX from 'xlsx';
import { DailyLog, EmployeeAnalysis, DirectoryEntry, OverallStats, DailyViolationsTrendData, ViolationsByDayData, WorkDurationDistributionData, CompanyStats, CompanySortKey } from '../types';
import { formatExcelDate, parseDateToSortable, normalizeCompanyName, normalizeEmployeeName } from '../utils/formatters';

// Helper to parse time strings like "HH:mm" or "HH:mm:ss" into total minutes from midnight
const timeToMinutes = (time: string): number => {
    if (!time || typeof time !== 'string' || !time.includes(':')) return 0;
    const parts = time.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    const [hours, minutes] = parts;
    return hours * 60 + minutes;
};

// Helper to format total minutes into "HHч MMм"
export const formatDuration = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return '0ч 0м';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}ч ${minutes}м`;
};

// Helper to parse duration string like "HHч MMм" into milliseconds for comparison
export const parseDurationToMs = (durationStr?: string): number => {
    if (!durationStr) return 0;
    const parts = durationStr.match(/(\d+)ч\s*(\d+)м/);
    if (!parts) return 0;
    const hours = parseInt(parts[1], 10) || 0;
    const minutes = parseInt(parts[2], 10) || 0;
    return (hours * 60 + minutes) * 60 * 1000;
};

// Merge multiple EmployeeAnalysis arrays into a unified one
export const mergeEmployeeAnalyses = (base: EmployeeAnalysis[], incoming: EmployeeAnalysis[]): EmployeeAnalysis[] => {
    const byKey = new Map<string, EmployeeAnalysis>();

    const makeKey = (emp: EmployeeAnalysis) => `${normalizeCompanyName(emp.company).toLowerCase()}|${normalizeEmployeeName(emp.employeeName)}`;

    const addOrMerge = (emp: EmployeeAnalysis) => {
        const key = makeKey(emp);
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, {
                ...emp,
                company: normalizeCompanyName(emp.company),
                employeeName: emp.employeeName,
                dailyLogs: [...emp.dailyLogs],
            });
            return;
        }

        // Merge totals
        const mergedDailyLogs = [...existing.dailyLogs, ...emp.dailyLogs]
            .sort((a, b) => parseDateToSortable(a.date) - parseDateToSortable(b.date));

        const totalLate = mergedDailyLogs.filter(l => l.isLate).length;
        const totalEarly = mergedDailyLogs.filter(l => l.isEarly).length;
        const incompleteDays = mergedDailyLogs.filter(l => l.status === 'incomplete').length;
        const daysWorked = mergedDailyLogs.length - incompleteDays;

        const totalWorkMinutes = mergedDailyLogs.reduce((sum, l) => {
            if (!l.workDuration) return sum;
            const parts = l.workDuration.match(/(\d+)ч\s*(\d+)м/);
            if (!parts) return sum;
            const h = parseInt(parts[1], 10) || 0;
            const m = parseInt(parts[2], 10) || 0;
            return sum + h * 60 + m;
        }, 0);

        const avgWorkMinutes = daysWorked > 0 ? totalWorkMinutes / daysWorked : 0;
        const violationRate = daysWorked > 0 ? ((totalLate + totalEarly) / daysWorked) * 100 : 0;

        byKey.set(key, {
            employeeName: existing.employeeName,
            company: normalizeCompanyName(existing.company),
            totalLate,
            totalEarly,
            daysWorked,
            incompleteDays,
            totalWorkHours: formatDuration(totalWorkMinutes),
            averageWorkDuration: formatDuration(avgWorkMinutes),
            violationRate,
            dailyLogs: mergedDailyLogs,
        });
    };

    base.forEach(addOrMerge);
    incoming.forEach(addOrMerge);

    return Array.from(byKey.values()).sort((a,b) => a.employeeName.localeCompare(b.employeeName));
};

function formatExcelTime(timeValue: any): string {
    if (timeValue instanceof Date) {
      return timeValue.toTimeString().split(' ')[0]; // HH:mm:ss
    }
    // Handle Excel's time format (fraction of a day)
    if (typeof timeValue === 'number' && timeValue >= 0 && timeValue < 1) {
      const totalSeconds = Math.round(timeValue * 86400);
      const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    if (typeof timeValue === 'string') {
        // Already a string, return as is
        return timeValue;
    }
    // Fallback for other unexpected types
    return '';
}

// Main function to process the new attendance file format (event log)
export const processAttendanceFile = async (file: File, settings: { start: string; end: string }, directory?: DirectoryEntry[]): Promise<EmployeeAnalysis[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!e.target?.result) {
                    return reject(new Error("Не удалось прочитать файл."));
                }
                const data = new Uint8Array(e.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

                // 1. Find header row and map columns dynamically
                const REQUIRED_KEYWORDS = ['сотрудник', 'дата', 'время', 'событие'];
                let headerRowIndex = -1;
                let headers: string[] = [];

                for (let i = 0; i < Math.min(20, jsonData.length); i++) {
                    const row = jsonData[i];
                    if (!Array.isArray(row)) continue;

                    const lowerCaseRow = row.map(cell => String(cell || '').toLowerCase().trim());
                    
                    const hasAllKeywords = REQUIRED_KEYWORDS.every(keyword => 
                        lowerCaseRow.some(cell => cell.includes(keyword))
                    );

                    if (hasAllKeywords) {
                        headerRowIndex = i;
                        headers = lowerCaseRow;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    throw new Error('Не удалось найти строку с заголовками. Убедитесь, что файл содержит обязательные колонки: "ФИО", "Дата", "Время", "Событие".');
                }

                const nameIndex = headers.findIndex(h => h.includes('сотрудник') || h.includes('фио'));
                const dateIndex = headers.findIndex(h => h.includes('дата'));
                const timeIndex = headers.findIndex(h => h.includes('время'));
                const eventIndex = headers.findIndex(h => h.includes('событие'));

                let currentCompany = 'Неизвестная компания';
                const match = file.name.match(/^(.*?)(_|\s)\d{2}\.\d{2}\.\d{4}/);
                if (match && match[1]) {
                    currentCompany = normalizeCompanyName(match[1].replace(/_/g, ' '));
                }

                // Сопоставление ФИО -> компания из справочника
                const nameToCompany = new Map<string, string>();
                if (directory && directory.length > 0) {
                    directory.forEach(d => {
                        nameToCompany.set(normalizeEmployeeName(d.employeeName), normalizeCompanyName(d.company));
                    });
                }

                // 2. Group raw logs by employee and day
                const rawLogsByEmployeeDay: { [key: string]: { [date: string]: { entries: string[]; exits: string[] } } } = {};
                
                for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const employeeName = row[nameIndex]?.trim();
                    const eventType = String(row[eventIndex] || '').toLowerCase();

                    if (!employeeName || !row[dateIndex] || !row[timeIndex] || !eventType) continue;

                    // Если справочник передан, сверяем ФИО и пропускаем неизвестных сотрудников
                    const normalizedEmpName = normalizeEmployeeName(employeeName);
                    if (directory && directory.length > 0 && !nameToCompany.has(normalizedEmpName)) {
                        continue;
                    }

                    const dateStr = formatExcelDate(row[dateIndex]);
                    const timeStr = formatExcelTime(row[timeIndex] || row[dateIndex]); // Use date object for time if time column is empty

                    if (!dateStr || !timeStr) continue;

                    rawLogsByEmployeeDay[employeeName] = rawLogsByEmployeeDay[employeeName] || {};
                    rawLogsByEmployeeDay[employeeName][dateStr] = rawLogsByEmployeeDay[employeeName][dateStr] || { entries: [], exits: [] };
                    
                    if (eventType.includes('вход')) {
                        rawLogsByEmployeeDay[employeeName][dateStr].entries.push(timeStr);
                    } else if (eventType.includes('выход')) {
                        rawLogsByEmployeeDay[employeeName][dateStr].exits.push(timeStr);
                    }
                }

                // 3. Process grouped logs into EmployeeAnalysis
                const analysisResult: EmployeeAnalysis[] = [];
                const workStartTime = timeToMinutes(settings.start);
                const workEndTime = timeToMinutes(settings.end);

                for (const employeeName in rawLogsByEmployeeDay) {
                    const dailyLogs: DailyLog[] = [];
                    let totalWorkMinutes = 0;

                    const employeeDays = rawLogsByEmployeeDay[employeeName];
                    for (const date in employeeDays) {
                        const { entries, exits } = employeeDays[date];

                        const firstEntry = entries.length > 0 ? entries.reduce((min, t) => t < min ? t : min) : undefined;
                        const lastExit = exits.length > 0 ? exits.reduce((max, t) => t > max ? t : max) : undefined;
                        
                        let workDuration: string | undefined = undefined;
                        let workMinutes = 0;
                        if (firstEntry && lastExit) {
                            workMinutes = timeToMinutes(lastExit) - timeToMinutes(firstEntry);
                            if (workMinutes < 0) workMinutes = 0;
                            workDuration = formatDuration(workMinutes);
                            totalWorkMinutes += workMinutes;
                        }

                        const firstEntryMinutes = firstEntry ? timeToMinutes(firstEntry) : 0;
                        const lastExitMinutes = lastExit ? timeToMinutes(lastExit) : 0;

                        const isLate = !!firstEntry && firstEntryMinutes > workStartTime;
                        const isEarly = !!lastExit && lastExitMinutes > 0 && lastExitMinutes < workEndTime;

                        let status: DailyLog['status'] = 'perfect';
                        if (isLate && isEarly) status = 'late_and_early';
                        else if (isLate) status = 'late';
                        else if (isEarly) status = 'early';
                        
                        if (!firstEntry || !lastExit) {
                            status = 'incomplete';
                        }
                        
                        dailyLogs.push({ date, firstEntry, lastExit, workDuration, isLate, isEarly, status });
                    }
                    
                    const totalLate = dailyLogs.filter(log => log.isLate).length;
                    const totalEarly = dailyLogs.filter(log => log.isEarly).length;
                    const incompleteDays = dailyLogs.filter(log => log.status === 'incomplete').length;
                    const daysWorked = dailyLogs.length - incompleteDays;
                    const averageWorkMinutes = daysWorked > 0 ? totalWorkMinutes / daysWorked : 0;
                    const violationRate = daysWorked > 0 ? ((totalLate + totalEarly) / daysWorked) * 100 : 0;

                    analysisResult.push({
                        employeeName,
                        company: nameToCompany.get(normalizeEmployeeName(employeeName)) || currentCompany,
                        totalLate,
                        totalEarly,
                        daysWorked,
                        incompleteDays,
                        totalWorkHours: formatDuration(totalWorkMinutes),
                        averageWorkDuration: formatDuration(averageWorkMinutes),
                        violationRate,
                        dailyLogs: dailyLogs.sort((a,b) => parseDateToSortable(a.date) - parseDateToSortable(b.date)),
                    });
                }
                
                if (analysisResult.length === 0) {
                     throw new Error('В файле не найдено корректных данных для анализа после обработки.');
                }
                
                resolve(analysisResult.sort((a,b) => a.employeeName.localeCompare(b.employeeName)));

            } catch (error: any) {
                 reject(new Error(`Ошибка обработки файла: ${error.message}`));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

// Function to find the header row in a directory file
const findDirectoryHeaderRow = (jsonData: any[][]): { headerRowIndex: number, headers: string[] } => {
    const REQUIRED_KEYWORDS = ['фио', 'должность', 'дата приема', 'состояние'];
    for (let i = 0; i < Math.min(20, jsonData.length); i++) {
        const row = jsonData[i];
        if (!Array.isArray(row)) continue;
        const lowerCaseRow = row.map(cell => String(cell || '').toLowerCase().trim());
        const hasAllKeywords = REQUIRED_KEYWORDS.every(keyword =>
            lowerCaseRow.some(cell => cell.includes(keyword))
        );
        if (hasAllKeywords) {
            return { headerRowIndex: i, headers: lowerCaseRow };
        }
    }
    return { headerRowIndex: -1, headers: [] };
};


// Main function to process the directory file with multiple tables
export const processDirectoryFile = async (file: File): Promise<DirectoryEntry[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!e.target?.result) {
                    return reject(new Error("Не удалось прочитать файл."));
                }
                const data = new Uint8Array(e.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

                const allEntries: DirectoryEntry[] = [];
                let currentCompany: string = "Неизвестная компания";
                let headerMap: { [key: string]: number } = {};
                let headerFound = false;

                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!Array.isArray(row) || row.every(cell => cell === null)) continue;
                    
                    const firstCell = String(row[0] || '').trim();

                    if (firstCell.toLowerCase().startsWith('организация')) {
                         currentCompany = firstCell.replace(/организация/i, '').trim();
                         if (!currentCompany && row[1]) {
                             currentCompany = String(row[1] || '').trim();
                         }
                         headerFound = false;
                         continue;
                    }

                    if (!headerFound) {
                        const lowerCaseRow = row.map(cell => String(cell || '').toLowerCase().trim());
                        const requiredKeywords = ['сотрудник', 'фио', 'должность'];
                        if (requiredKeywords.some(kw => lowerCaseRow.some(cell => cell.includes(kw)))) {
                            headerMap = {
                                name: lowerCaseRow.findIndex(h => h.includes('сотрудник') || h.includes('фио')),
                                position: lowerCaseRow.findIndex(h => h.includes('должность')),
                                hireDate: lowerCaseRow.findIndex(h => h.includes('дата приема')),
                                status: lowerCaseRow.findIndex(h => h.includes('состояние'))
                            };
                            if (headerMap.name !== -1 && headerMap.position !== -1) {
                                headerFound = true;
                            }
                            continue;
                        }
                    }

                    if (headerFound) {
                        const employeeName = row[headerMap.name]?.trim();
                        if (employeeName && isNaN(parseInt(employeeName, 10))) {
                             allEntries.push({
                                employeeName,
                                company: currentCompany,
                                position: row[headerMap.position] || '–',
                                hireDate: formatExcelDate(row[headerMap.hireDate] || ''),
                                status: row[headerMap.status] || '–',
                            });
                        }
                    }
                }
                
                if (allEntries.length === 0) {
                    throw new Error('В файле не найдено корректных данных для анализа после обработки.');
                }
                
                resolve(allEntries);
            } catch (error: any) {
                reject(new Error(`Ошибка обработки файла: ${error.message}`));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};



// Function to calculate overall statistics
export const calculateOverallStats = (analysis: EmployeeAnalysis[]): OverallStats => {
    if (!analysis || analysis.length === 0) {
        return {
            totalEmployees: 0,
            totalLates: 0,
            totalEarlies: 0,
            averageViolationRate: 0,
            averageWorkDuration: '0ч 0м',
            dailyViolationsTrend: [],
            violationsByDay: [],
            workDurationDistribution: [],
        };
    }

    const totalEmployees = analysis.length;
    const totalLates = analysis.reduce((sum, emp) => sum + emp.totalLate, 0);
    const totalEarlies = analysis.reduce((sum, emp) => sum + emp.totalEarly, 0);
    const totalViolationRateSum = analysis.reduce((sum, emp) => sum + emp.violationRate, 0);
    const averageViolationRate = totalEmployees > 0 ? totalViolationRateSum / totalEmployees : 0;
    
    const totalWorkMinutesSum = analysis.reduce((sum, emp) => {
        const ms = parseDurationToMs(emp.totalWorkHours);
        return sum + (ms / 60000);
    }, 0);
    const totalDaysWorkedSum = analysis.reduce((sum, emp) => sum + emp.daysWorked, 0);
    const averageWorkDuration = formatDuration(totalDaysWorkedSum > 0 ? totalWorkMinutesSum / totalDaysWorkedSum : 0);
    
    const violationsByDate = new Map<string, number>();
    analysis.forEach(emp => {
        emp.dailyLogs.forEach(log => {
            if (log.isLate || log.isEarly) {
                const dateKey = log.date;
                violationsByDate.set(dateKey, (violationsByDate.get(dateKey) || 0) + 1);
            }
        });
    });

    const dailyViolationsTrend: DailyViolationsTrendData[] = Array.from(violationsByDate.entries())
        .map(([date, violations]) => ({ name: date.substring(0, 5), 'Нарушения': violations, fullDate: date }))
        .sort((a, b) => parseDateToSortable(a.fullDate) - parseDateToSortable(b.fullDate))
        .map(({name, 'Нарушения': violations}) => ({name, 'Нарушения': violations}));

    const violationsByDayOfWeek = [
        { name: 'Пн', 'Опоздания': 0, 'Ранние уходы': 0 }, { name: 'Вт', 'Опоздания': 0, 'Ранние уходы': 0 },
        { name: 'Ср', 'Опоздания': 0, 'Ранние уходы': 0 }, { name: 'Чт', 'Опоздания': 0, 'Ранние уходы': 0 },
        { name: 'Пт', 'Опоздания': 0, 'Ранние уходы': 0 }, { name: 'Сб', 'Опоздания': 0, 'Ранние уходы': 0 },
        { name: 'Вс', 'Опоздания': 0, 'Ранние уходы': 0 },
    ];
    analysis.forEach(emp => {
        emp.dailyLogs.forEach(log => {
            try {
                const date = new Date(log.date.split('.').reverse().join('-'));
                const dayIndex = (date.getDay() + 6) % 7; // Monday is 0
                if (log.isLate) violationsByDayOfWeek[dayIndex]['Опоздания']++;
                if (log.isEarly) violationsByDayOfWeek[dayIndex]['Ранние уходы']++;
            } catch(e) {}
        });
    });
    
    const durationBins = [
        { name: '0-2ч', count: 0 }, { name: '2-4ч', count: 0 }, { name: '4-6ч', count: 0 },
        { name: '6-8ч', count: 0 }, { name: '8-10ч', count: 0 }, { name: '10ч+', count: 0 },
    ];
    analysis.forEach(emp => {
        emp.dailyLogs.forEach(log => {
            if (log.workDuration) {
                const minutes = timeToMinutes(log.workDuration);
                const hours = minutes / 60;
                if (hours >= 0 && hours < 2) durationBins[0].count++;
                else if (hours >= 2 && hours < 4) durationBins[1].count++;
                else if (hours >= 4 && hours < 6) durationBins[2].count++;
                else if (hours >= 6 && hours < 8) durationBins[3].count++;
                else if (hours >= 8 && hours < 10) durationBins[4].count++;
                else if (hours >= 10) durationBins[5].count++;
            }
        });
    });
    const workDurationDistribution: WorkDurationDistributionData[] = durationBins.map(bin => ({
        name: bin.name,
        'Количество дней': bin.count
    }));

    return {
        totalEmployees,
        totalLates,
        totalEarlies,
        averageViolationRate,
        averageWorkDuration,
        dailyViolationsTrend,
        violationsByDay: violationsByDayOfWeek,
        workDurationDistribution,
    };
};

export const calculateCompanyStats = (analysis: EmployeeAnalysis[]): CompanyStats[] => {
    const statsMap = new Map<string, {
        employeeCount: number;
        totalLates: number;
        totalEarlies: number;
        violationRateSum: number;
        totalWorkMinutes: number;
        totalDaysWorked: number;
    }>();

    analysis.forEach(emp => {
        if (!statsMap.has(emp.company)) {
            statsMap.set(emp.company, {
                employeeCount: 0,
                totalLates: 0,
                totalEarlies: 0,
                violationRateSum: 0,
                totalWorkMinutes: 0,
                totalDaysWorked: 0,
            });
        }
        const stats = statsMap.get(emp.company)!;
        stats.employeeCount++;
        stats.totalLates += emp.totalLate;
        stats.totalEarlies += emp.totalEarly;
        stats.violationRateSum += emp.violationRate;
        stats.totalDaysWorked += emp.daysWorked;
        stats.totalWorkMinutes += emp.dailyLogs.reduce((sum, log) => sum + (log.workDuration ? timeToMinutes(log.workDuration) : 0), 0);
    });

    return Array.from(statsMap.entries()).map(([companyName, stats]) => ({
        companyName,
        employeeCount: stats.employeeCount,
        totalLates: stats.totalLates,
        totalEarlies: stats.totalEarlies,
        averageViolationRate: stats.employeeCount > 0 ? stats.violationRateSum / stats.employeeCount : 0,
        averageWorkDuration: formatDuration(stats.totalDaysWorked > 0 ? stats.totalWorkMinutes / stats.totalDaysWorked : 0),
    }));
};