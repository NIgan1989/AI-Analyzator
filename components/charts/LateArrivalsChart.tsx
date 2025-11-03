// Implementing the full content of LateArrivalsChart.tsx to resolve errors.
import React, { useMemo } from 'react';
import { EmployeeAnalysis } from '../../types';
// Fix: Import BaseBarChart as BaseChart is not an exported member.
import { BaseBarChart } from './BaseChart';
import { shortenName } from '../../utils/formatters';

interface LateArrivalsChartProps {
  analysis: EmployeeAnalysis[];
}

export const LateArrivalsChart: React.FC<LateArrivalsChartProps> = ({ analysis }) => {
  const chartData = useMemo(() => {
    return analysis
      .filter(emp => emp.totalLate > 0)
      .sort((a, b) => b.totalLate - a.totalLate)
      .slice(0, 10) // Show top 10 for readability
      .map(emp => ({
        name: shortenName(emp.employeeName),
        'Опоздания': emp.totalLate,
      }));
  }, [analysis]);

  if (chartData.length === 0) {
    return (
        <div id="late-arrivals-chart-container" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-96 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Топ 10 по опозданиям</h3>
            <p className="text-slate-500 dark:text-slate-400">Нет данных для отображения.</p>
        </div>
    );
  }

  return (
    // Fix: Removed invalid 'containerId' prop and wrapped BaseChart in a div with the required ID.
    <div id="late-arrivals-chart-container">
      {/* Fix: Use BaseBarChart component and 'bars' prop instead of 'lines' */}
      <BaseBarChart
        data={chartData}
        bars={[{ dataKey: 'Опоздания', fill: '#f59e0b', name: 'Кол-во опозданий' }]}
        title="Топ 10 по опозданиям"
      />
    </div>
  );
};