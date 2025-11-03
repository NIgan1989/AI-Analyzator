import React from 'react';
import { RefreshCwIcon } from './Icons';

interface DateRangeFilterProps {
  range: {
    start: string;
    end: string;
    min: string;
    max: string;
  };
  onRangeChange: (newRange: { start: string; end: string; min: string; max: string; }) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ range, onRangeChange }) => {
  
  const clampToBounds = (d: Date) => {
    const min = new Date(range.min);
    const max = new Date(range.max);
    if (d < min) return min;
    if (d > max) return max;
    return d;
  };

  const setPresetDays = (days: number) => {
    if (!range.max) return;
    const end = new Date(range.end || range.max);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    const s = clampToBounds(start).toISOString().slice(0, 10);
    const e = clampToBounds(end).toISOString().slice(0, 10);
    onRangeChange({ ...range, start: s, end: e });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRangeChange({ ...range, start: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRangeChange({ ...range, end: e.target.value });
  };
  
  const handleReset = () => {
    onRangeChange({ ...range, start: range.min, end: range.max });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
        <label htmlFor="start-date" className="text-slate-500 dark:text-slate-400">От:</label>
        <input 
            type="date"
            id="start-date"
            value={range.start}
            min={range.min}
            max={range.max}
            onChange={handleStartDateChange}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="end-date" className="text-slate-500 dark:text-slate-400">До:</label>
        <input 
            type="date"
            id="end-date"
            value={range.end}
            min={range.min}
            max={range.max}
            onChange={handleEndDateChange}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
            onClick={handleReset}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            title="Сбросить даты"
        >
          <RefreshCwIcon className="w-4 h-4"/>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            onClick={() => setPresetDays(7)} title="Последняя неделя">Неделя</button>
          <button type="button" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            onClick={() => setPresetDays(30)} title="Последний месяц">Месяц</button>
          <button type="button" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            onClick={() => setPresetDays(90)} title="Последний квартал">Квартал</button>
          <button type="button" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            onClick={handleReset} title="Весь период">Всё</button>
        </div>
    </div>
  );
};