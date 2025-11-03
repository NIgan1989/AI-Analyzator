import React, { useMemo } from 'react';
import { EmployeeAnalysis } from '../types';

interface CompanyStats {
    companyName: string;
    employeeCount: number;
    totalLates: number;
    totalEarlies: number;
    averageViolationRate: number;
}

const CompanyStatsTable: React.FC<{ analysis: EmployeeAnalysis[] }> = ({ analysis }) => {
    const companyStats = useMemo<CompanyStats[]>(() => {
        const statsMap = new Map<string, {
            employeeCount: number;
            totalLates: number;
            totalEarlies: number;
            violationRateSum: number;
        }>();

        analysis.forEach(emp => {
            if (!statsMap.has(emp.company)) {
                statsMap.set(emp.company, { employeeCount: 0, totalLates: 0, totalEarlies: 0, violationRateSum: 0 });
            }
            const stats = statsMap.get(emp.company)!;
            stats.employeeCount++;
            stats.totalLates += emp.totalLate;
            stats.totalEarlies += emp.totalEarly;
            stats.violationRateSum += emp.violationRate;
        });

        return Array.from(statsMap.entries()).map(([companyName, stats]) => ({
            companyName,
            employeeCount: stats.employeeCount,
            totalLates: stats.totalLates,
            totalEarlies: stats.totalEarlies,
            averageViolationRate: stats.employeeCount > 0 ? stats.violationRateSum / stats.employeeCount : 0,
        })).sort((a,b) => b.averageViolationRate - a.averageViolationRate); // Sort by violation rate desc
    }, [analysis]);

    if (companyStats.length <= 1) {
        return null; // Don't show the table if there's only one or zero companies
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Сводка по компаниям</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">Компания</th>
                            <th scope="col" className="px-4 py-3 text-center">Сотрудников</th>
                            <th scope="col" className="px-4 py-3 text-center">Опозданий</th>
                            <th scope="col" className="px-4 py-3 text-center">Ранних уходов</th>
                            <th scope="col" className="px-4 py-3 text-center">Средний коэф. нарушений</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyStats.map(stats => (
                            <tr key={stats.companyName} className="border-b dark:border-slate-700 last:border-b-0">
                                <td className="px-4 py-3 font-medium">{stats.companyName}</td>
                                <td className="px-4 py-3 text-center">{stats.employeeCount}</td>
                                <td className="px-4 py-3 text-center">{stats.totalLates}</td>
                                <td className="px-4 py-3 text-center">{stats.totalEarlies}</td>
                                <td className="px-4 py-3 text-center font-semibold">{stats.averageViolationRate.toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { CompanyStatsTable };
