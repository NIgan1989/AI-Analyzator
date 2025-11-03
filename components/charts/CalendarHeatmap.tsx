import React, { useMemo } from 'react';
import { DailyViolationsTrendData } from '../../types';

interface CalendarHeatmapProps {
  dailyData: DailyViolationsTrendData[];
}

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => (
    <div className="relative group flex justify-center">
        {children}
        <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {content}
        </span>
    </div>
);

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ dailyData }) => {
    const { year, month, daysInMonth, firstDayOfMonth, violationsMap, maxViolations } = useMemo(() => {
        if (!dailyData || dailyData.length === 0) {
            return { year: 0, month: 0, daysInMonth: 0, firstDayOfMonth: 0, violationsMap: new Map(), maxViolations: 0 };
        }
        
        // Use the first date to determine the month and year
        const [dayStr, monthStr] = dailyData[0].name.split('.');
        const month = parseInt(monthStr, 10) - 1; // JS month index
        const sampleDate = new Date();
        const year = sampleDate.getFullYear(); // Assume current year as it's not in the data
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Monday is 0

        const violationsMap = new Map<number, number>();
        let maxViolations = 0;
        
        dailyData.forEach(item => {
            const day = parseInt(item.name.split('.')[0], 10);
            const violations = item['Нарушения'];
            violationsMap.set(day, violations);
            if (violations > maxViolations) {
                maxViolations = violations;
            }
        });
        
        return { year, month, daysInMonth, firstDayOfMonth, violationsMap, maxViolations };
    }, [dailyData]);

    const getColor = (violations: number) => {
        if (violations === 0) return 'bg-green-200 dark:bg-green-800';
        if (maxViolations === 0) return 'bg-slate-100 dark:bg-slate-700'; // Should not happen if violations > 0

        const intensity = Math.min(violations / (maxViolations * 0.8), 1); // Scale to red faster
        if (intensity < 0.25) return 'bg-yellow-200 dark:bg-yellow-800';
        if (intensity < 0.5) return 'bg-yellow-400 dark:bg-yellow-600';
        if (intensity < 0.75) return 'bg-orange-500 dark:bg-orange-600';
        return 'bg-red-600 dark:bg-red-500';
    };

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const calendarDays = [];

    // Add empty cells for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="w-full h-12"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const violations = violationsMap.get(day);
        const colorClass = violations !== undefined ? getColor(violations) : 'bg-slate-100 dark:bg-slate-700';
        
        calendarDays.push(
             <Tooltip key={day} content={`${day}.${String(month + 1).padStart(2, '0')}: ${violations ?? 0} нарушений`}>
                <div className={`w-full h-12 flex items-center justify-center rounded-md ${colorClass} transition-transform hover:scale-110`}>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{day}</span>
                </div>
            </Tooltip>
        );
    }

    if (daysInMonth === 0) {
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Тепловая карта нарушений</h3>
                <p className="text-slate-500 dark:text-slate-400">Нет данных для отображения в выбранном диапазоне.</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Тепловая карта нарушений ({new Date(year, month).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })})</h3>
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-bold text-sm text-slate-500 dark:text-slate-400">{day}</div>
                ))}
                {calendarDays}
            </div>
        </div>
    );
};
