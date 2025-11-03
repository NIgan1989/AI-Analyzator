import React from 'react';
import { FileDownloadIcon, RefreshCwIcon, SettingsIcon, SpinnerIcon, UploadIcon } from './Icons';

interface HeaderProps {
    onReset: () => void;
    showControls: boolean;
    onDownloadReport: () => void;
    isDownloadingReport: boolean;
    onOpenSettings: () => void;
    onUploadAttendance?: (file: File) => void;
    isUploadingAttendance?: boolean;
    filterComponent?: React.ReactNode;
    isReportDisabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, showControls, onDownloadReport, isDownloadingReport, onOpenSettings, onUploadAttendance, isUploadingAttendance = false, filterComponent, isReportDisabled = false }) => {
    return (
        <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Анализатор посещаемости
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Загрузите отчет для анализа или просмотра списка сотрудников.
                        </p>
                    </div>
                    {showControls && (
                        <div className="flex flex-wrap items-center gap-4 justify-end w-full">
                             {filterComponent}
                            <div className="flex flex-wrap items-center gap-2">
                                {onUploadAttendance && (
                                    <>
                                        <input
                                            id="header-upload-attendance"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) onUploadAttendance(f);
                                            }}
                                            accept=".xlsx, .xls"
                                            disabled={isUploadingAttendance}
                                        />
                                        <label
                                            htmlFor="header-upload-attendance"
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isUploadingAttendance ? (
                                                <>
                                                    <SpinnerIcon className="animate-spin w-5 h-5" />
                                                    Загрузка...
                                                </>
                                            ) : (
                                                <>
                                                    <UploadIcon className="w-5 h-5" />
                                                    Добавить проходы
                                                </>
                                            )}
                                        </label>
                                    </>
                                )}
                                <button
                                    onClick={onDownloadReport}
                                    disabled={isDownloadingReport || isReportDisabled}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDownloadingReport ? (
                                        <>
                                            <SpinnerIcon className="animate-spin w-5 h-5" />
                                            Генерация...
                                        </>
                                    ) : (
                                        <>
                                            <FileDownloadIcon className="w-5 h-5" />
                                            Word-отчет
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onOpenSettings}
                                    className="p-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                                    aria-label="Открыть настройки"
                                >
                                    <SettingsIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onReset}
                                    className="p-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                                     aria-label="Сбросить и загрузить новый файл"
                                >
                                    <RefreshCwIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
