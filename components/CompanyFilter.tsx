import React from 'react';

interface CompanyFilterProps {
  companies: string[];
  selected: string;
  onChange: (company: string) => void;
}

export const CompanyFilter: React.FC<CompanyFilterProps> = ({ companies, selected, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="company-filter" className="text-sm text-slate-700 dark:text-slate-300">Компания:</label>
      <select
        id="company-filter"
        className="px-2 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Все</option>
        {companies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
};