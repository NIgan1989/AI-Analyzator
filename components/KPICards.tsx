import React, { useMemo } from 'react';
import { EmployeeAnalysis } from '../types';
import { AlertTriangleIcon, ClockIcon, PercentIcon, UsersIcon } from './Icons';

interface KPICardsProps {
  analysis: EmployeeAnalysis[];
}

const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        </div>
    </div>
);

const KPISummary: React.FC<KPICardsProps> = ({ analysis }) => {
    const stats = useMemo(() => {
        const totalEmployees = analysis.length;
        const totalLates = analysis.reduce((sum, emp) => sum + emp.totalLate, 0);
        const totalEarlies = analysis.reduce((sum, emp) => sum + emp.totalEarly, 0);
        const totalViolationRate = analysis.reduce((sum, emp) => sum + emp.violationRate, 0);
        const avgViolationRate = totalEmployees > 0 ? (totalViolationRate / totalEmployees).toFixed(1) : 0;
        
        return { totalEmployees, totalLates, totalEarlies, avgViolationRate };
    }, [analysis]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
                title="Всего сотрудников"
                value={stats.totalEmployees}
                icon={<UsersIcon className="w-6 h-6 text-white"/>}
                color="bg-blue-500"
            />
            <KPICard
                title="Средний % нарушений"
                value={`${stats.avgViolationRate}%`}
                icon={<PercentIcon className="w-6 h-6 text-white"/>}
                color="bg-red-500"
            />
            <KPICard
                title="Всего опозданий"
                value={stats.totalLates}
                icon={<ClockIcon className="w-6 h-6 text-white"/>}
                color="bg-yellow-500"
            />
            <KPICard
                title="Всего ранних уходов"
                value={stats.totalEarlies}
                icon={<AlertTriangleIcon className="w-6 h-6 text-white"/>}
                color="bg-orange-500"
            />
        </div>
    );
};

export const KPICards: React.FC<KPICardsProps> = ({ analysis }) => {
    return (
        <div className="space-y-6">
            <KPISummary analysis={analysis} />
        </div>
    );
};