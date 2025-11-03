
import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { start: string; end:string; }) => void;
  currentSettings: {
    start: string;
    end: string;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [start, setStart] = useState(currentSettings.start);
  const [end, setEnd] = useState(currentSettings.end);

  useEffect(() => {
    setStart(currentSettings.start);
    setEnd(currentSettings.end);
  }, [currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ start, end });
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center transition-opacity"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold">Настройки анализа</h2>
            <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Закрыть">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="workday-start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Начало рабочего дня
                </label>
                <input 
                    type="time"
                    id="workday-start"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label htmlFor="workday-end" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Конец рабочего дня
                </label>
                <input 
                    type="time"
                    id="workday-end"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
                Отмена
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Сохранить
            </button>
        </div>
      </div>
    </div>
  );
};
