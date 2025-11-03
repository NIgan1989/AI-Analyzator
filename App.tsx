
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { FileUpload } from './components/FileUpload';
import { Header } from './components/Header';
import { ChatCard } from './components/SummaryCard';
import { AnalysisTabs, Tab } from './components/AnalysisTabs';
import { AnalysisResults } from './components/AnalysisResults';
import { KPICards } from './components/KPICards';
import { EmployeeList } from './components/EmployeeList';
import { OverviewCharts, DetailedCharts } from './components/charts/ViolationsChart';
import { SettingsModal } from './components/SettingsModal';
import { DateRangeFilter } from './components/DateRangeFilter';
import { CompanyFilter } from './components/CompanyFilter';
import { PositionFilter } from './components/PositionFilter';
import { normalizeEmployeeName } from './utils/formatters';
import { CompanyStatsTable } from './components/CompanyStatsTable';

import { processAttendanceFile, processDirectoryFile, calculateOverallStats, mergeEmployeeAnalyses } from './services/dataProcessor';
import { startChatSessionAndGetSummary, ChatSession } from './services/openaiService';
import { generateWordReport } from './utils/wordGenerator';

import { EmployeeAnalysis, ChatMessage, DirectoryEntry, OverallStats } from './types';
import { initialDirectoryData } from './initialData';
import { formatDateForInput } from './utils/formatters';
import { loadBuiltInDirectory } from './services/builtInDirectory';

const App: React.FC = () => {
    // State management
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [analysis, setAnalysis] = useState<EmployeeAnalysis[] | null>(null);
    const [filteredAnalysis, setFilteredAnalysis] = useState<EmployeeAnalysis[] | null>(null);
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [directory, setDirectory] = useState<DirectoryEntry[]>(initialDirectoryData);
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatRef = useRef<ChatSession | null>(null);
    
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [focusedEmployee, setFocusedEmployee] = useState<string | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState({ start: '09:00', end: '18:00' });
    
    const [dateRange, setDateRange] = useState({ start: '', end: '', min: '', max: '' });
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedPosition, setSelectedPosition] = useState<string>('');
    const [dataType, setDataType] = useState<'attendance' | 'directory' | null>(null);

    // --- Effects ---

    // Постоянный список сотрудников из файла в корне
    useEffect(() => {
        try {
            const builtIn = loadBuiltInDirectory();
            if (builtIn && builtIn.length > 0) {
                setDirectory(builtIn);
                setDataType('directory');
            }
            // Восстанавливаем фильтры из localStorage
            const savedCompany = localStorage.getItem('selectedCompany') || '';
            const savedStart = localStorage.getItem('dateRange.start') || '';
            const savedEnd = localStorage.getItem('dateRange.end') || '';
            setSelectedCompany(savedCompany);
            if (savedStart && savedEnd) {
                setDateRange(prev => ({ ...prev, start: savedStart, end: savedEnd }));
            }
        } catch (e) {
            console.error('Не удалось загрузить список сотрудников из файла:', e);
        }
    }, []);
    
    // Effect to calculate overall stats and set date range when analysis data changes
    useEffect(() => {
        if (analysis) {
            const stats = calculateOverallStats(analysis);
            setOverallStats(stats);
            
            // Determine min/max dates from all logs for the filter
            let minDate = new Date('2999-12-31');
            let maxDate = new Date('1900-01-01');
            analysis.forEach(emp => {
                emp.dailyLogs.forEach(log => {
                    const logDate = new Date(log.date.split('.').reverse().join('-'));
                    if (logDate < minDate) minDate = logDate;
                    if (logDate > maxDate) maxDate = logDate;
                });
            });

            if (minDate.getFullYear() < 2999) {
                 const min = formatDateForInput(minDate);
                 const max = formatDateForInput(maxDate);
                 setDateRange({ start: min, end: max, min, max });
            }
            setFilteredAnalysis(analysis);
        }
    }, [analysis]);
    
    // Effect to filter analysis data based on date range
    useEffect(() => {
        if (!analysis || !dateRange.start || !dateRange.end) {
            setFilteredAnalysis(analysis);
            return;
        };

        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        const newFilteredAnalysis = analysis.map(emp => {
            const filteredLogs = emp.dailyLogs.filter(log => {
                const logDate = new Date(log.date.split('.').reverse().join('-'));
                return logDate >= startDate && logDate <= endDate;
            });
            // Пересчитываем метрики сотрудника на основе отфильтрованных логов
            const totalLate = filteredLogs.filter(l => l.isLate).length;
            const totalEarly = filteredLogs.filter(l => l.isEarly).length;
            const incompleteDays = filteredLogs.filter(l => l.status === 'incomplete').length;
            const daysWorked = filteredLogs.length - incompleteDays;
            // Суммарная продолжительность работы по дням (минуты)
            const totalWorkMinutes = filteredLogs.reduce((sum, l) => {
                if (!l.workDuration) return sum;
                const parts = l.workDuration.match(/(\d+)ч\s*(\d+)м/);
                if (!parts) return sum;
                const h = parseInt(parts[1], 10) || 0;
                const m = parseInt(parts[2], 10) || 0;
                return sum + h * 60 + m;
            }, 0);
            const avgWorkMinutes = daysWorked > 0 ? totalWorkMinutes / daysWorked : 0;
            const violationRate = daysWorked > 0 ? ((totalLate + totalEarly) / daysWorked) * 100 : 0;

            const formatDuration = (mins: number) => {
                const h = Math.floor(mins / 60);
                const m = Math.round(mins % 60);
                return `${h}ч ${m}м`;
            };

            return {
                ...emp,
                dailyLogs: filteredLogs,
                totalLate,
                totalEarly,
                daysWorked,
                incompleteDays,
                totalWorkHours: formatDuration(totalWorkMinutes),
                averageWorkDuration: formatDuration(avgWorkMinutes),
                violationRate,
            };
        }).filter(emp => emp.dailyLogs.length > 0);

        // Применяем фильтр по компании, если выбран
        const companyApplied = selectedCompany
            ? newFilteredAnalysis.filter(emp => (emp.company || '').trim() === selectedCompany.trim())
            : newFilteredAnalysis;

        // Фильтр по должности: сопоставляем с директорией по ФИО
        const nameToPosition = new Map<string, string>();
        directory.forEach(d => nameToPosition.set(normalizeEmployeeName(d.employeeName), d.position));
        const positionApplied = selectedPosition
            ? companyApplied.filter(emp => (nameToPosition.get(normalizeEmployeeName(emp.employeeName)) || '').trim() === selectedPosition.trim())
            : companyApplied;

        setFilteredAnalysis(positionApplied);
        setOverallStats(calculateOverallStats(positionApplied));

    }, [analysis, dateRange, selectedCompany, selectedPosition, directory]);

    // Сохраняем фильтры в localStorage
    useEffect(() => {
        localStorage.setItem('selectedCompany', selectedCompany || '');
    }, [selectedCompany]);

    useEffect(() => {
        if (dateRange.start) localStorage.setItem('dateRange.start', dateRange.start);
        if (dateRange.end) localStorage.setItem('dateRange.end', dateRange.end);
    }, [dateRange.start, dateRange.end]);

    // Компании для селекта
    const companyOptions: string[] = React.useMemo(() => {
        const src = analysis || [];
        const set = new Set<string>();
        src.forEach(emp => { if (emp.company) set.add(emp.company); });
        return Array.from(set).sort();
    }, [analysis]);

    const positionOptions: string[] = React.useMemo(() => {
        const set = new Set<string>();
        directory.forEach(d => {
            // Если выбрана компания — ограничиваем позиции её сотрудниками
            if (!selectedCompany || normalizeEmployeeName(d.company) === normalizeEmployeeName(selectedCompany)) {
                if (d.position) set.add(d.position);
            }
        });
        return Array.from(set).sort();
    }, [directory, selectedCompany]);


    // --- Handlers ---
    
    const handleFileSelect = async (file: File) => {
        setIsLoading(true);
        setError(null);

        try {
            // A simple heuristic to guess file type based on name.
            if (file.name.toLowerCase().includes('справочник') || file.name.toLowerCase().includes('directory')) {
                const dirData = await processDirectoryFile(file);
                setDirectory(dirData);
                setDataType('directory');
                setActiveTab('employees');
            } else {
                const newAnalysis = await processAttendanceFile(file, settings, directory);
                const combined = analysis && analysis.length > 0 
                    ? mergeEmployeeAnalyses(analysis, newAnalysis)
                    : newAnalysis;

                setAnalysis(combined);
                setDataType('attendance');

                // Обновляем AI-сводку с объединенными данными, не теряя историю
                setIsStreaming(true);
                const { chat, initialSummary } = await startChatSessionAndGetSummary(combined);
                chatRef.current = chat;
                setChatHistory(prev => prev.length === 0 
                    ? [{ role: 'model', content: initialSummary }] 
                    : [...prev, { role: 'model', content: initialSummary }]
                );
            }
        } catch (err: any) {
            setError(err.message || 'Произошла неизвестная ошибка.');
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!chatRef.current || isStreaming) return;
        
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        setIsStreaming(true);
        setError(null);
        
        try {
            const response = await chatRef.current.sendMessage(message);
            
            setChatHistory(prev => [...prev, { role: 'model', content: response }]);
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось получить ответ от AI.';
            setError(errorMessage);
        } finally {
            setIsStreaming(false);
        }
    };
    
    const handleEmployeeSelect = useCallback((employeeName: string) => {
        setActiveTab('detailed');
        setFocusedEmployee(employeeName);
    }, []);

    const handleClearFocus = useCallback(() => {
        setFocusedEmployee(null);
    }, []);

    const handleReset = () => {
        setIsLoading(false);
        setIsStreaming(false);
        setError(null);
        setAnalysis(null);
        setFilteredAnalysis(null);
        setOverallStats(null);
        setChatHistory([]);
        chatRef.current = null;
        setActiveTab('overview');
        setDataType(null);
        setDirectory(initialDirectoryData); // Reset to default directory
    };
    
    const handleSaveSettings = (newSettings: { start: string; end: string; }) => {
        setSettings(newSettings);
        setIsSettingsOpen(false);
        // If data is already loaded, re-process it with new settings
        if (analysis) {
            // This would require re-reading the file. For simplicity, we'll just inform the user.
            alert("Настройки сохранены. Чтобы применить их, пожалуйста, загрузите файл отчета заново.");
            handleReset();
        }
    };
    
    const handleDownloadReport = async () => {
        if (!filteredAnalysis || !overallStats || chatHistory.length === 0) {
            alert("Нет данных для генерации отчета.");
            return;
        }
        setIsDownloadingReport(true);
        try {
            // Переключаем вкладки, чтобы графики загрузились с корректными размерами
            const prevTab = activeTab;
            // Сначала «Сводка» для топ-графиков
            setActiveTab('overview');
            await new Promise(resolve => setTimeout(resolve, 300));
            // Grab base64 images from the charts
            const getChartAsBase64 = async (containerId: string): Promise<string> => {
                const container = document.getElementById(containerId);
                if (!container) return '';

                // Попытка 1: прямой снимок контейнера через html2canvas — максимально похож на экран
                try {
                    const mod: any = await import('html2canvas');
                    const html2canvas = mod.default || mod;
                    if (html2canvas) {
                        const canvas: HTMLCanvasElement = await html2canvas(container, { backgroundColor: '#ffffff', scale: 3, useCORS: true });
                        return canvas.toDataURL('image/png');
                    }
                } catch {}

                // Попытка 2: сериализуем SVG и рисуем в canvas
                const svg = container.querySelector('svg');
                if (svg) {
                    try {
                        const bbox = svg.getBoundingClientRect();
                        const viewBox = (svg as any).viewBox?.baseVal;
                        const width = Math.max(bbox.width || viewBox?.width || 800, 300);
                        const height = Math.max(bbox.height || viewBox?.height || 400, 200);

                        const cloned = svg.cloneNode(true) as SVGSVGElement;
                        if (!cloned.getAttribute('xmlns')) {
                            cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        }
                        if (!cloned.getAttribute('xmlns:xlink')) {
                            cloned.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                        }
                        // Явно задаём размеры и viewBox, чтобы избежать пустых областей
                        cloned.setAttribute('width', String(width));
                        cloned.setAttribute('height', String(height));
                        if (!(cloned as any).viewBox || !cloned.getAttribute('viewBox')) {
                            cloned.setAttribute('viewBox', `0 0 ${Math.round(width)} ${Math.round(height)}`);
                        }

                        // Инлайн стилей для всех элементов SVG (сохранение осей/текстов)
                        const PROPS = ['fill','stroke','stroke-width','font-family','font-size','font-weight','opacity','text-anchor','shape-rendering','color'];
                        const inlineElementStyles = (el: Element) => {
                            const cs = window.getComputedStyle(el as HTMLElement);
                            let styleStr = '';
                            PROPS.forEach(p => {
                                const v = cs.getPropertyValue(p);
                                if (v) styleStr += `${p}: ${v};`;
                            });
                            if (styleStr) (el as HTMLElement).setAttribute('style', styleStr);
                            // Если fill равен currentColor или не задан, проставим фактический цвет
                            const fillAttr = (el as HTMLElement).getAttribute('fill');
                            const color = cs.getPropertyValue('color');
                            if (!fillAttr || fillAttr === 'currentColor') {
                                (el as HTMLElement).setAttribute('fill', color || '#000000');
                            }
                            Array.from(el.children).forEach(child => inlineElementStyles(child));
                        };
                        inlineElementStyles(cloned);

                        const svgData = new XMLSerializer().serializeToString(cloned);
                        // Рендер через <img> → canvas
                        const canvas = document.createElement('canvas');
                        const scale = 3; // повышаем четкость (~300 DPI)
                        canvas.width = Math.round(width * scale);
                            canvas.height = Math.round(height * scale);
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return '';
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            // @ts-ignore
                            ctx.imageSmoothingEnabled = true;
                            // @ts-ignore
                            ctx.imageSmoothingQuality = 'high';
                        const img = new Image();
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(svgBlob);

                        await new Promise<void>((resolve, reject) => {
                            img.onload = () => {
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                URL.revokeObjectURL(url);
                                resolve();
                            };
                            img.onerror = (err) => {
                                URL.revokeObjectURL(url);
                                reject(err);
                            };
                            img.src = url;
                        });
                        return canvas.toDataURL('image/png');
                    } catch (e) {
                        console.warn('SVG export failed, falling back to html2canvas:', e);
                    }
                }

                // Fallback: если ничего не получилось
                return '';
            };
            
            // We use the overview charts for the report
            const lateChartImg = await getChartAsBase64('top-late-chart');
            const earlyChartImg = await getChartAsBase64('top-early-chart');
            // Затем «Статистика» для остальных
            setActiveTab('charts');
            await new Promise(resolve => setTimeout(resolve, 300));
            const trendChartImg = await getChartAsBase64('daily-violations-trend-chart-container');
            const violationsByDayImg = await getChartAsBase64('violations-by-day-chart-container');
            const workDurationChartImg = await getChartAsBase64('work-duration-chart-container');
            
            const aiSummary = chatHistory[0]?.content || "Сводка не была сгенерирована.";
            const reportPeriod = (dateRange.start && dateRange.end) ? { start: dateRange.start, end: dateRange.end } : undefined;
            await generateWordReport(filteredAnalysis, aiSummary, lateChartImg, earlyChartImg, trendChartImg, violationsByDayImg, workDurationChartImg, reportPeriod, selectedCompany, selectedPosition);
            // Возврат на прежнюю вкладку
            setActiveTab(prevTab);
            
        } catch (err: any) {
            console.error("Failed to generate report:", err);
            alert(`Не удалось сгенерировать отчет: ${err.message}`);
        } finally {
            setIsDownloadingReport(false);
        }
    };

    // --- Render Logic ---

    const hasData = !!filteredAnalysis;
    const showControls = hasData || (directory && directory.length > 0);

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
            <Header
                onReset={handleReset}
                showControls={showControls}
                onDownloadReport={handleDownloadReport}
                isDownloadingReport={isDownloadingReport}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onUploadAttendance={async (file: File) => {
                    // отдельный обработчик: добавление проходов без сброса
                    setIsLoading(true);
                    setError(null);
                    try {
                        const newAnalysis = await processAttendanceFile(file, settings, directory);
                        const combined = analysis && analysis.length > 0 
                            ? mergeEmployeeAnalyses(analysis, newAnalysis)
                            : newAnalysis;
                        setAnalysis(combined);
                        setDataType('attendance');
                        setIsStreaming(true);
                        const { chat, initialSummary } = await startChatSessionAndGetSummary(combined);
                        chatRef.current = chat;
                        setChatHistory(prev => prev.length === 0 
                            ? [{ role: 'model', content: initialSummary }] 
                            : [...prev, { role: 'model', content: initialSummary }]
                        );
                    } catch (err: any) {
                        setError(err.message || 'Не удалось добавить файл проходов.');
                    } finally {
                        setIsLoading(false);
                        setIsStreaming(false);
                    }
                }}
                isReportDisabled={!hasData || dataType !== 'attendance'}
                filterComponent={hasData ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <DateRangeFilter range={dateRange} onRangeChange={setDateRange} />
                        <CompanyFilter companies={companyOptions} selected={selectedCompany} onChange={(c) => { setSelectedCompany(c); setSelectedPosition(''); }} />
                        <PositionFilter positions={positionOptions} selected={selectedPosition} onChange={setSelectedPosition} />
                    </div>
                ) : undefined}
            />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
                {!showControls && (
                    <div className="text-center">
                        <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                        {isLoading && <p className="mt-4 text-slate-600 dark:text-slate-400">Анализ данных... Это может занять до минуты.</p>}
                        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
                    </div>
                )}
                {showControls && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8 min-w-0">
                            {!hasData && (
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
                                    <h3 className="font-semibold mb-2">Загрузите файл проходов</h3>
                                    <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                                    {error && <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>}
                                </div>
                            )}
                             <AnalysisTabs 
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                disabledTabs={dataType === 'directory' ? ['overview', 'detailed', 'charts'] : []}
                                overviewContent={
                                    <div className="space-y-6">
                                        {filteredAnalysis && <KPICards analysis={filteredAnalysis} />}
                                        {filteredAnalysis && overallStats && <OverviewCharts analysis={filteredAnalysis} overallStats={overallStats} onEmployeeSelect={handleEmployeeSelect} />}
                                    </div>
                                }
                                employeesContent={<EmployeeList directory={directory} analysis={analysis} onEmployeeSelect={handleEmployeeSelect}/>}
                                detailedContent={
                                    filteredAnalysis ? 
                                        <AnalysisResults analysis={filteredAnalysis} focusedEmployee={focusedEmployee} onClearFocus={handleClearFocus} overallStats={overallStats} />
                                        : <p>Нет данных для отображения.</p>
                                }
                                chartsContent={
                                    <div className="space-y-6">
                                        {filteredAnalysis && <CompanyStatsTable analysis={filteredAnalysis} />}
                                        {filteredAnalysis && overallStats && <DetailedCharts analysis={filteredAnalysis} overallStats={overallStats} />}
                                    </div>
                                }
                            />
                        </div>
                        <div className="lg:col-span-1 min-w-0">
                             <ChatCard 
                                chatHistory={chatHistory} 
                                isStreaming={isStreaming} 
                                error={error} 
                                onSendMessage={handleSendMessage}
                                hasData={hasData}
                                dataType={dataType}
                            />
                        </div>
                    </div>
                )}
            </main>
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                onSave={handleSaveSettings} 
                currentSettings={settings}
            />
        </div>
    );
};

export default App;
