import React from 'react';

interface PositionFilterProps {
  positions: string[];
  selected: string;
  onChange: (position: string) => void;
}

export const PositionFilter: React.FC<PositionFilterProps> = ({ positions, selected, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="position-filter" className="text-sm text-slate-700 dark:text-slate-300">Должность:</label>
      <select
        id="position-filter"
        className="px-2 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Все</option>
        {positions.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
};