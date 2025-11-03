import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ViolationsPieChartProps {
    totalLate: number;
    totalEarly: number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-md shadow-lg text-sm">
          <p className="font-bold text-slate-800 dark:text-slate-100">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

export const ViolationsPieChart: React.FC<ViolationsPieChartProps> = ({ totalLate, totalEarly }) => {
    
    const data = [
        { name: 'Опоздания', value: totalLate },
        { name: 'Ранние уходы', value: totalEarly },
    ];

    const COLORS = ['#f59e0b', '#f97316'];

    if (totalLate === 0 && totalEarly === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
                 <h3 className="text-sm font-semibold mb-2 text-center text-slate-800 dark:text-slate-100">Соотношение нарушений</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Нарушений нет</p>
            </div>
        )
    }

    return (
        <div className="h-64">
            <h3 className="text-sm font-semibold mb-2 text-center text-slate-800 dark:text-slate-100">Соотношение нарушений</h3>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}