import React, { useState, useMemo, useEffect, useRef } from 'react';
import { EmployeeAnalysis, EmployeeSortKey, DailyLogSortKey, SortDirection, OverallStats } from '../types';
import { ChevronDownIcon, ClockIcon, AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon, CalendarDaysIcon, SigmaIcon, TrendingUpIcon, AlertCircleIcon, TrendingDownIcon } from './Icons';
import { parseDateToSortable, parseDurationToSortable } from '../utils/formatters';
import { ViolationsPieChart } from './charts/ViolationsPieChart';
import { parseDurationToMs } from '../services/dataProcessor';

// --- Sub-components for UI elements ---

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass?: string, children?: React.ReactNode }> = ({ icon, label, value, colorClass = 'text-slate-500 dark:text-slate-400', children }) => (
    <div className="flex items-center gap-2">
        <div className={`flex-shrink-0 ${colorClass}`}>{icon}</div>
        <div>
            <div className="flex items-baseline">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
              {children}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);

const Comparison: React.FC<{ value: number; average: number; higherIsBetter: boolean; }> = ({ value, average, higherIsBetter }) => {
    if (average === 0 || value < 0) return null;
    const diff = value - average;
    const percentDiff = (diff / average) * 100;
    
    if (Math.abs(percentDiff) < 1) return null; // Ignore negligible differences

    const isBetter = higherIsBetter ? diff > 0 : diff < 0;
    const color = isBetter ? 'text-green-500' : 'text-red-500';
    const Icon = isBetter ? TrendingUpIcon : TrendingDownIcon;
    const sign = percentDiff > 0 ? '+' : '';

    return (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ml-2 ${color}`} title={`В сравнении со средним`}>
            <Icon className="w-3 h-3" />
            {`${sign}${percentDiff.toFixed(0)}%`}
        </span>
    );
};


const StatusBadge: React.FC<{ status: 'perfect' | 'late' | 'early' | 'late_and_early' | 'incomplete' }> = ({ status }) => {
    const statusMap = {
        perfect: { text: 'Всё в порядке', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        late: { text: 'Опоздание', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        early: { text: 'Ранний уход', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
        late_and_early: { text: 'Опоздание и ранний уход', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
        incomplete: { text: 'Нет данных', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
    };
    const { text, color } = statusMap[status];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>{text}</span>;
};

interface SortableThProps {
  label: string;
  sortKey: DailyLogSortKey;
  currentSortKey: DailyLogSortKey;
  currentSortDirection: SortDirection;
  onSort: (key: DailyLogSortKey) => void;
}

const SortableTh: React.FC<SortableThProps> = ({ label, sortKey, currentSortKey, currentSortDirection, onSort }) => (
    <th scope="col" className="px-4 py-3 cursor-pointer select-none" onClick={() => onSort(sortKey)}>
        <div className="flex items-center gap-1.5">
            {label}
            {currentSortKey === sortKey && (
                currentSortDirection === 'asc' 
                    ? <ArrowUpIcon className="w-4 h-4" /> 
                    : <ArrowDownIcon className="w-4 h-4" />
            )}
        </div>
    </th>
);

interface SortButtonProps {
  label: string;
  sortKey: EmployeeSortKey;
  currentSortKey: EmployeeSortKey;
  currentSortDirection: SortDirection;
  onSort: (key: EmployeeSortKey) => void;
}

const SortButton: React.FC<SortButtonProps> = ({ label, sortKey, currentSortKey, currentSortDirection, onSort }) => (
    <button 
        onClick={() => onSort(sortKey)} 
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
            currentSortKey === sortKey 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
    >
        {label}
        {currentSortKey === sortKey && (
            currentSortDirection === 'asc' 
                ? <ArrowUpIcon className="w-4 h-4" /> 
                : <ArrowDownIcon className="w-4 h-4" />
        )}
    </button>
);


// --- Main Row Component for Each Employee ---

interface EmployeeRowProps {
    employeeData: EmployeeAnalysis;
    isFocused: boolean;
    onClearFocus: () => void;
    overallStats: OverallStats | null;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({ employeeData, isFocused, onClearFocus, overallStats }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dailySortKey, setDailySortKey] = useState<DailyLogSortKey>('date');
    const [dailySortDirection, setDailySortDirection] = useState<SortDirection>('asc');
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isFocused) {
            setIsOpen(true);
            rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Automatically clear focus after animation
            const timer = setTimeout(() => onClearFocus(), 2500); 
            return () => clearTimeout(timer);
        }
    }, [isFocused, onClearFocus]);


    const handleDailySort = (key: DailyLogSortKey) => {
        if (dailySortKey === key) {
            setDailySortDirection(dailySortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setDailySortKey(key);
            setDailySortDirection('asc');
        }
    };
    
    const sortedDailyLogs = useMemo(() => {
        return [...employeeData.dailyLogs].sort((a, b) => {
            let valA: string | number | undefined;
            let valB: string | number | undefined;

            switch (dailySortKey) {
                case 'date':
                    valA = parseDateToSortable(a.date);
                    valB = parseDateToSortable(b.date);
                    break;
                case 'workDuration':
                    valA = parseDurationToSortable(a.workDuration);
                    valB = parseDurationToSortable(b.workDuration);
                    break;
                case 'firstEntry':
                case 'lastExit':
                case 'status':
                    valA = a[dailySortKey];
                    valB = b[dailySortKey];
                    break;
            }

            const aValue = valA === undefined || valA === null || valA === -1 ? (dailySortDirection === 'asc' ? Infinity : -Infinity) : valA;
            const bValue = valB === undefined || valB === null || valB === -1 ? (dailySortDirection === 'asc' ? Infinity : -Infinity) : valB;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return dailySortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return dailySortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [employeeData.dailyLogs, dailySortKey, dailySortDirection]);

    const focusClass = isFocused ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900' : '';

    return (
        <div ref={rowRef} className={`border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-all duration-1000 ${focusClass}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">{employeeData.employeeName}</p>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-y-4 gap-x-2 mt-3">
                         <Stat 
                            icon={<TrendingUpIcon className="w-5 h-5"/>} 
                            label="Коэф. нарушений" 
                            value={`${employeeData.violationRate.toFixed(1)}%`}
                            colorClass={employeeData.violationRate > 20 ? "text-red-500" : "text-slate-500 dark:text-slate-400"}
                         >
                            {overallStats && <Comparison value={employeeData.violationRate} average={overallStats.averageViolationRate} higherIsBetter={false} />}
                         </Stat>
                         <Stat 
                            icon={<ClockIcon className="w-5 h-5"/>} 
                            label="Среднее время" 
                            value={employeeData.averageWorkDuration}
                        >
                             {overallStats && <Comparison value={parseDurationToMs(employeeData.averageWorkDuration)} average={parseDurationToMs(overallStats.averageWorkDuration)} higherIsBetter={true} />}
                        </Stat>
                        <Stat 
                            icon={<SigmaIcon className="w-5 h-5"/>} 
                            label="Всего часов" 
                            value={employeeData.totalWorkHours}
                        />
                        <Stat 
                            icon={<CalendarDaysIcon className="w-5 h-5"/>}
                            label="Рабочих дней"
                            value={employeeData.daysWorked}
                        />
                        <Stat 
                            icon={<AlertCircleIcon className="w-5 h-5"/>}
                            label="Дней с ошибками"
                            value={employeeData.incompleteDays}
                            colorClass={employeeData.incompleteDays > 0 ? "text-purple-500 dark:text-purple-400" : "text-slate-500 dark:text-slate-400"}
                        />
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-grow lg:w-2/3 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400">
                                    <tr>
                                        <SortableTh label="Дата" sortKey="date" currentSortKey={dailySortKey} currentSortDirection={dailySortDirection} onSort={handleDailySort} />
                                        <SortableTh label="Первый вход" sortKey="firstEntry" currentSortKey={dailySortKey} currentSortDirection={dailySortDirection} onSort={handleDailySort} />
                                        <SortableTh label="Последний выход" sortKey="lastExit" currentSortKey={dailySortKey} currentSortDirection={dailySortDirection} onSort={handleDailySort} />
                                        <SortableTh label="Время на работе" sortKey="workDuration" currentSortKey={dailySortKey} currentSortDirection={dailySortDirection} onSort={handleDailySort} />
                                        <SortableTh label="Статус" sortKey="status" currentSortKey={dailySortKey} currentSortDirection={dailySortDirection} onSort={handleDailySort} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDailyLogs.map(log => (
                                        <tr key={log.date} className="border-b dark:border-slate-700 last:border-b-0">
                                            <td className="px-4 py-3 font-medium">{log.date}</td>
                                            <td className={`px-4 py-3 ${log.isLate ? 'text-yellow-600 dark:text-yellow-400 font-bold' : ''}`}>{log.firstEntry || '–'}</td>
                                            <td className={`px-4 py-3 ${log.isEarly ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}`}>{log.lastExit || '–'}</td>
                                            <td className="px-4 py-3">{log.workDuration || '–'}</td>
                                            <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                                        </tr>
                                    ))}
                                    {sortedDailyLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-slate-500 dark:text-slate-400">Нет данных для отображения.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 lg:w-1/3">
                            <ViolationsPieChart 
                                totalLate={employeeData.totalLate}
                                totalEarly={employeeData.totalEarly}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Analysis Results Component ---
interface AnalysisResultsProps {
    analysis: EmployeeAnalysis[];
    focusedEmployee: string | null;
    onClearFocus: () => void;
    overallStats: OverallStats | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, focusedEmployee, onClearFocus, overallStats }) => {
    const [sortKey, setSortKey] = useState<EmployeeSortKey>('employeeName');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if(focusedEmployee) {
            setSearchTerm(focusedEmployee);
        } else {
            setSearchTerm('');
        }
    }, [focusedEmployee]);

    const handleSort = (key: EmployeeSortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedAnalysis = useMemo(() => {
        const filtered = analysis.filter(emp =>
          emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            let valA: string | number;
            let valB: string | number;

            switch (sortKey) {
                case 'employeeName':
                    valA = a.employeeName;
                    valB = b.employeeName;
                    break;
                case 'totalLate':
                    valA = a.totalLate;
                    valB = b.totalLate;
                    break;
                case 'totalEarly':
                    valA = a.totalEarly;
                    valB = b.totalEarly;
                    break;
                case 'violationRate':
                    valA = a.violationRate;
                    valB = b.violationRate;
                    break;
                case 'averageWorkDuration':
                    valA = parseDurationToSortable(a.averageWorkDuration);
                    valB = parseDurationToSortable(b.averageWorkDuration);
                    break;
            }
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });
    }, [analysis, sortKey, sortDirection, searchTerm]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
             <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-lg font-semibold">Детальный отчет по сотрудникам</h2>
                   <div className="flex-grow max-w-xs">
                        <input 
                            type="text"
                            placeholder="Поиск по имени..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm flex-wrap">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Сортировать по:</span>
                    <SortButton label="Имени" sortKey="employeeName" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                    <SortButton label="Опозданиям" sortKey="totalLate" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                    <SortButton label="Ранним уходам" sortKey="totalEarly" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                    <SortButton label="Коэф. нарушений" sortKey="violationRate" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                </div>
            </div>
            <div>
                {sortedAnalysis.map(employeeData => (
                    <EmployeeRow 
                        key={employeeData.employeeName} 
                        employeeData={employeeData} 
                        isFocused={focusedEmployee === employeeData.employeeName}
                        onClearFocus={onClearFocus}
                        overallStats={overallStats}
                    />
                ))}
            </div>
        </div>
    );
};
