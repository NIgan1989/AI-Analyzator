// Implementing the full content of EarlyDeparturesChart.tsx to resolve errors.
import React, { useMemo } from 'react';
import { EmployeeAnalysis } from '../../types';
// Fix: Import BaseBarChart as BaseChart is not an exported member.
import { BaseBarChart } from './BaseChart';
import { shortenName } from '../../utils/formatters';

interface EarlyDeparturesChartProps {
  analysis: EmployeeAnalysis[];
}

export const EarlyDeparturesChart: React.FC<EarlyDeparturesChartProps> = ({ analysis }) => {
  const chartData = useMemo(() => {
    return analysis
      .filter(emp => emp.totalEarly > 0)
      .sort((a, b) => b.totalEarly - a.totalEarly)
      .slice(0, 10) // Show top 10 for readability
      .map(emp => ({
        name: shortenName(emp.employeeName),
        'Ранние уходы': emp.totalEarly,
      }));
  }, [analysis]);

   if (chartData.length === 0) {
    return (
        <div id="early-departures-chart-container" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-96 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Топ 10 по ранним уходам</h3>
            <p className="text-slate-500 dark:text-slate-400">Нет данных для отображения.</p>
        </div>
    );
  }

  return (
    // Fix: Removed invalid 'containerId' prop and wrapped BaseChart in a div with the required ID.
    <div id="early-departures-chart-container">
      {/* Fix: Use BaseBarChart component and 'bars' prop instead of 'lines' */}
      <BaseBarChart
        data={chartData}
        bars={[{ dataKey: 'Ранние уходы', fill: '#f97316', name: 'Кол-во ранних уходов' }]}
        title="Топ 10 по ранним уходам"
      />
    </div>
  );
};