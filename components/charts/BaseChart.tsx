// Implementing the full content of BaseChart.tsx to resolve errors.
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine
} from 'recharts';

// --- Reusable Tooltip for all charts ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
        <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.color || pld.fill }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Base Chart Data Structure ---
interface ChartData {
  name: string;
  [key: string]: string | number;
}

// --- Base Line Chart Component ---
interface LineInfo {
  dataKey: string;
  stroke: string;
  name: string;
}

interface BaseLineChartProps {
  data: ChartData[];
  lines: LineInfo[];
  title: string;
}

export const BaseLineChart: React.FC<BaseLineChartProps> = ({ data, lines, title }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-96">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{
            top: 5, right: 20, left: -10, bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            dataKey="name" angle={-45} textAnchor="end" height={60} interval={0}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-slate-600 dark:text-slate-400"
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-slate-600 dark:text-slate-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
          {lines.map(line => (
            <Line 
                key={line.dataKey} type="monotone" dataKey={line.dataKey} 
                stroke={line.stroke} name={line.name} strokeWidth={2}
                dot={{ r: 4 }} activeDot={{ r: 6 }}
                isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Base Bar Chart Component ---
interface BarInfo {
  dataKey: string;
  fill: string;
  name: string;
  stackId?: string;
}

interface BaseBarChartProps {
  data: ChartData[];
  bars: BarInfo[];
  title: string;
  onBarClick?: (payload: any) => void;
  averageLine?: { dataKey: string; color?: string; label?: string };
}

export const BaseBarChart: React.FC<BaseBarChartProps> = ({ data, bars, title, onBarClick, averageLine }) => {
    const handleBarClick = (data: any) => {
        if (onBarClick && data && data.activePayload && data.activePayload.length > 0) {
            onBarClick(data.activePayload[0].payload);
        }
    };
    
    const cursorStyle = onBarClick ? { cursor: 'pointer' } : {};

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-96">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">{title}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick} style={cursorStyle}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} className="text-slate-600 dark:text-slate-400"/>
                    <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} className="text-slate-600 dark:text-slate-400"/>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {bars.map(bar => (
                        <Bar key={bar.dataKey} {...bar} isAnimationActive={false} />
                    ))}
                    {averageLine && (() => {
                      const key = averageLine.dataKey;
                      const values = data.map(d => Number(d[key]) || 0);
                      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                      return <ReferenceLine y={avg} stroke={averageLine.color || '#374151'} strokeDasharray="3 3" label={averageLine.label || 'Среднее'} />;
                    })()}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};