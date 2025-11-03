
import React, { useState, useMemo, useEffect } from 'react';
import { EmployeeAnalysis, DirectoryEntry, EmployeeSortKey, DirectorySortKey, SortDirection } from '../types';
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon } from './Icons';
import { parseDurationToSortable, parseDateToSortable, normalizeCompanyName } from '../utils/formatters';

type MergedEmployeeData = DirectoryEntry & Partial<Pick<EmployeeAnalysis, 'totalLate' | 'totalEarly' | 'violationRate' | 'averageWorkDuration'>>;
type SortKey = keyof MergedEmployeeData;

interface EmployeeListProps {
  directory: DirectoryEntry[];
  analysis?: EmployeeAnalysis[] | null;
  onEmployeeSelect: (employeeName: string) => void;
}

interface SortableThProps {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentSortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}

const SortableTh: React.FC<SortableThProps> = ({ label, sortKey, currentSortKey, currentSortDirection, onSort, className }) => (
  <th
    scope="col"
    className={`px-4 py-3 cursor-pointer select-none transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 ${className}`}
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center gap-1.5">
      {label}
      {currentSortKey === sortKey && (
        currentSortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
      )}
    </div>
  </th>
);

export const EmployeeList: React.FC<EmployeeListProps> = ({ directory, analysis, onEmployeeSelect }) => {
  const hasAnalysis = !!analysis && analysis.length > 0;

  const mergedData = useMemo<MergedEmployeeData[]>(() => {
    const allEmployees = new Map<string, MergedEmployeeData>();

    // 1. Add all directory employees first to establish the master list
    directory.forEach(dir => {
        const key = `${dir.company.toLowerCase()}|${dir.employeeName.toLowerCase()}`;
        if (!allEmployees.has(key)) {
            allEmployees.set(key, { ...dir, company: normalizeCompanyName(dir.company) });
        }
    });

    // 2. Add/merge analysis employees
    if (hasAnalysis) {
        analysis.forEach(an => {
            const key = `${an.company.toLowerCase()}|${an.employeeName.toLowerCase()}`;
            const existing = allEmployees.get(key);
            if (existing) {
                // Merge analysis data into existing directory entry
                existing.totalLate = an.totalLate;
                existing.totalEarly = an.totalEarly;
                existing.violationRate = an.violationRate;
                existing.averageWorkDuration = an.averageWorkDuration;
                existing.company = normalizeCompanyName(existing.company);
            } else {
                // Add new employee found only in analysis data
                allEmployees.set(key, {
                    employeeName: an.employeeName,
                    company: normalizeCompanyName(an.company),
                    position: '–',
                    hireDate: '–',
                    status: 'Работа', // Assume active if in attendance log
                    totalLate: an.totalLate,
                    totalEarly: an.totalEarly,
                    violationRate: an.violationRate,
                    averageWorkDuration: an.averageWorkDuration,
                });
            }
        });
    }

    return Array.from(allEmployees.values());
  }, [directory, analysis, hasAnalysis]);

  const [sortKey, setSortKey] = useState<SortKey>('employeeName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  
  const allCompanies = useMemo(() => Array.from(new Set(mergedData.map(e => normalizeCompanyName(e.company)))).sort(), [mergedData]);
  
  // Positions available based on the selected company
  const availablePositions = useMemo(() => {
    const relevantData = companyFilter === 'all' 
      ? mergedData 
      : mergedData.filter(emp => emp.company === companyFilter);
    return Array.from(new Set(relevantData.map(e => e.position))).sort();
  }, [mergedData, companyFilter]);

  // Reset position filter if it becomes invalid after changing the company
  useEffect(() => {
    if (positionFilter !== 'all' && !availablePositions.includes(positionFilter)) {
      setPositionFilter('all');
    }
  }, [availablePositions, positionFilter]);


  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set(allCompanies));

   useEffect(() => {
    setExpandedCompanies(new Set(allCompanies));
  }, [allCompanies]);

  const toggleCompany = (companyName: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyName)) newSet.delete(companyName);
      else newSet.add(companyName);
      return newSet;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredData = useMemo(() => {
    const filteredData = mergedData.filter(emp => {
        const nameMatch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const companyMatch = companyFilter === 'all' || emp.company === companyFilter;
        const positionMatch = positionFilter === 'all' || emp.position === positionFilter;
        return nameMatch && companyMatch && positionMatch;
    });

    return [...filteredData].sort((a, b) => {
      let valA: string | number | undefined;
      let valB: string | number | undefined;

      switch (sortKey) {
        case 'employeeName':
        case 'company':
        case 'position':
        case 'status':
          valA = a[sortKey];
          valB = b[sortKey];
          break;
        case 'hireDate':
            valA = parseDateToSortable(a.hireDate);
            valB = parseDateToSortable(b.hireDate);
            break;
        case 'averageWorkDuration':
          valA = parseDurationToSortable(a.averageWorkDuration);
          valB = parseDurationToSortable(b.averageWorkDuration);
          break;
        case 'totalLate':
        case 'totalEarly':
        case 'violationRate':
          valA = a[sortKey];
          valB = b[sortKey];
          break;
        default:
          valA = a.employeeName;
          valB = b.employeeName;
      }
      
      const aValue = valA === undefined || valA === null || valA === -1 || (typeof valA === 'number' && isNaN(valA)) ? (sortDirection === 'asc' ? Infinity : -Infinity) : valA;
      const bValue = valB === undefined || valB === null || valB === -1 || (typeof valB === 'number' && isNaN(valB)) ? (sortDirection === 'asc' ? Infinity : -Infinity) : valB;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [mergedData, sortKey, sortDirection, searchTerm, companyFilter, positionFilter]);

  const dataByCompany = useMemo(() => {
    return sortedAndFilteredData.reduce((acc, emp) => {
        (acc[emp.company] = acc[emp.company] || []).push(emp);
        return acc;
    }, {} as Record<string, MergedEmployeeData[]>);
  }, [sortedAndFilteredData]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-semibold">Список сотрудников ({sortedAndFilteredData.length})</h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div>
                <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Фильтр по компании"
                >
                    <option value="all">Все компании</option>
                    {allCompanies.map(company => (
                        <option key={company} value={company}>{company}</option>
                    ))}
                </select>
            </div>
             <div>
                <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Фильтр по должности"
                >
                    <option value="all">Все должности</option>
                    {availablePositions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </div>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Поиск по имени"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 p-2">
        {/* Fix: Explicitly cast dataByCompany to its Record type to help TypeScript infer correctly for Object.entries */}
        {Object.entries(dataByCompany as Record<string, MergedEmployeeData[]>).map(([company, employees]) => (
            <div key={company} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button 
                    onClick={() => toggleCompany(company)}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <h3 className="font-semibold text-md">{company} ({employees.length})</h3>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${expandedCompanies.has(company) ? 'rotate-180' : ''}`} />
                </button>
                {expandedCompanies.has(company) && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400">
                              <tr>
                                <SortableTh label="ФИО" sortKey="employeeName" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                <SortableTh label="Должность" sortKey="position" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                <SortableTh label="Компания" sortKey="company" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                {hasAnalysis && (
                                    <>
                                        <SortableTh label="Опоздания" sortKey="totalLate" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                        <SortableTh label="Ранние уходы" sortKey="totalEarly" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                        <SortableTh label="Коэф. нарушений" sortKey="violationRate" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                        <SortableTh label="Среднее время" sortKey="averageWorkDuration" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
                                    </>
                                )}
                                
                              </tr>
                          </thead>
                          <tbody>
                            {employees.map(emp => (
                                <tr 
                                    key={emp.employeeName + emp.company} 
                                    className={`border-b dark:border-slate-700 last:border-b-0 ${hasAnalysis ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer' : ''}`}
                                    onClick={() => hasAnalysis && onEmployeeSelect(emp.employeeName)}
                                >
                                    <td className="px-4 py-3 font-medium">{emp.employeeName}</td>
                                    <td className="px-4 py-3">{emp.position}</td>
                                    <td className="px-4 py-3">{emp.company}</td>
                                    {hasAnalysis && (
                                        <>
                                            <td className="px-4 py-3 text-center">{emp.totalLate ?? '–'}</td>
                                            <td className="px-4 py-3 text-center">{emp.totalEarly ?? '–'}</td>
                                            <td className="px-4 py-3 text-center">{emp.violationRate !== undefined ? `${emp.violationRate.toFixed(1)}%` : '–'}</td>
                                            <td className="px-4 py-3">{emp.averageWorkDuration ?? '–'}</td>
                                        </>
                                    )}
                                    
                                </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                )}
            </div>
        ))}
        {/* Fix: Explicitly cast dataByCompany to its Record type to help TypeScript infer correctly for Object.keys */}
        {Object.keys(dataByCompany as Record<string, MergedEmployeeData[]>).length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Сотрудники не найдены.
            </div>
        )}
      </div>
    </div>
  );
};
