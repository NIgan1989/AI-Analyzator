import React, { useMemo } from 'react';
import { EmployeeAnalysis, OverallStats } from '../../types';
import { BaseLineChart, BaseBarChart } from './BaseChart';
import { shortenName } from '../../utils/formatters';
import { CalendarHeatmap } from './CalendarHeatmap';

interface ChartsProps {
  analysis: EmployeeAnalysis[];
  overallStats: OverallStats | null;
}

interface OverviewChartsProps extends ChartsProps {
    onEmployeeSelect: (employeeName: string) => void;
}

// --- Charts for the Overview Tab ---
export const OverviewCharts: React.FC<OverviewChartsProps> = ({ analysis, overallStats, onEmployeeSelect }) => {
  const topLateData = useMemo(() => {
    // We need the full name for the click handler, but only show the shortened name
    return analysis
      .filter(emp => emp.totalLate > 0)
      .sort((a, b) => b.totalLate - a.totalLate)
      .slice(0, 5)
      .map(emp => ({ 
          name: shortenName(emp.employeeName), 
          fullName: emp.employeeName, // Keep original name for payload
          'Опоздания': emp.totalLate 
      }));
  }, [analysis]);

  const topEarlyData = useMemo(() => {
    return analysis
      .filter(emp => emp.totalEarly > 0)
      .sort((a, b) => b.totalEarly - a.totalEarly)
      .slice(0, 5)
      .map(emp => ({ 
          name: shortenName(emp.employeeName),
          fullName: emp.employeeName,
          'Ранние уходы': emp.totalEarly 
      }));
  }, [analysis]);
  
  const handleBarClick = (payload: any) => {
      if (payload && payload.fullName) {
          onEmployeeSelect(payload.fullName);
      }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {overallStats?.dailyViolationsTrend && overallStats.dailyViolationsTrend.length > 1 && (
          <div id="daily-violations-trend-chart-container" className="lg:col-span-2">
              <BaseLineChart
                data={overallStats.dailyViolationsTrend}
                lines={[{ dataKey: 'Нарушения', stroke: '#ef4444', name: 'Кол-во нарушений' }]}
                title="Динамика нарушений по дням"
              />
          </div>
      )}

      {topLateData.length > 0 && (
          <div id="top-late-chart">
            <BaseBarChart
                title="Топ 5 по опозданиям"
                data={topLateData}
                bars={[{ dataKey: "Опоздания", fill: "#f59e0b", name: "Кол-во опозданий" }]}
                averageLine={{ dataKey: 'Опоздания', color: '#6b7280', label: 'Среднее' }}
                onBarClick={handleBarClick}
            />
          </div>
      )}

      {topEarlyData.length > 0 && (
          <div id="top-early-chart">
              <BaseBarChart
                title="Топ 5 по ранним уходам"
                data={topEarlyData}
                bars={[{ dataKey: "Ранние уходы", fill: "#f97316", name: "Кол-во ранних уходов" }]}
                averageLine={{ dataKey: 'Ранние уходы', color: '#6b7280', label: 'Среднее' }}
                onBarClick={handleBarClick}
              />
          </div>
      )}
    </div>
  );
};


// --- Charts for the dedicated "Charts" Tab ---
export const DetailedCharts: React.FC<ChartsProps> = ({ analysis, overallStats }) => {
  return (
    <div className="space-y-8">
      {overallStats?.dailyViolationsTrend && (
         <CalendarHeatmap dailyData={overallStats.dailyViolationsTrend} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {overallStats?.violationsByDay && overallStats.violationsByDay.length > 0 && (
          <div id="violations-by-day-chart-container">
              <BaseBarChart
                  title="Нарушения по дням недели"
                  data={overallStats.violationsByDay}
                  bars={[
                      { dataKey: "Опоздания", stackId: "a", fill: "#f59e0b", name: "Опоздания" },
                      { dataKey: "Ранние уходы", stackId: "a", fill: "#f97316", name: "Ранние уходы" }
                  ]}
              />
          </div>
      )}
        
        {overallStats?.workDurationDistribution && overallStats.workDurationDistribution.some(d => d['Количество дней'] > 0) && (
            <div id="work-duration-chart-container">
                <BaseBarChart
                  title="Распределение рабочего времени"
                  data={overallStats.workDurationDistribution}
                  bars={[{ dataKey: "Количество дней", fill: "#3b82f6", name: "Кол-во рабочих дней" }]}
                />
            </div>
        )}
      </div>
    </div>
  );
};