// types.ts

export interface DailyLog {
  date: string;
  firstEntry?: string;
  lastExit?: string;
  workDuration?: string;
  isLate: boolean;
  isEarly: boolean;
  status: 'perfect' | 'late' | 'early' | 'late_and_early' | 'incomplete';
}

export interface EmployeeAnalysis {
  employeeName: string;
  company: string;
  totalLate: number;
  totalEarly: number;
  daysWorked: number;
  incompleteDays: number;
  totalWorkHours: string;
  averageWorkDuration: string;
  violationRate: number; // Percentage
  dailyLogs: DailyLog[];
}

export type EmployeeSortKey = 'employeeName' | 'totalLate' | 'totalEarly' | 'violationRate' | 'averageWorkDuration';
export type DailyLogSortKey = 'date' | 'firstEntry' | 'lastExit' | 'workDuration' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DirectoryEntry {
  employeeName: string;
  company: string;
  position: string;
  hireDate: string;
  status: string;
}

export type DirectorySortKey = 'employeeName' | 'company' | 'position' | 'hireDate' | 'status';


// Fix: Add index signatures to the chart data types below.
// This makes them compatible with the generic `ChartData` type used in `BaseChart.tsx`,
// resolving TypeScript errors about missing index signatures when passing data to the charts.
export interface DailyViolationsTrendData {
    name: string; // "DD.MM"
    'Нарушения': number;
    [key: string]: string | number;
}
  
export interface ViolationsByDayData {
    name: string; // "Пн", "Вт", ...
    'Опоздания': number;
    'Ранние уходы': number;
    [key: string]: string | number;
}
  
export interface WorkDurationDistributionData {
    name: string; // "0-2ч", "2-4ч", ...
    'Количество дней': number;
    [key: string]: string | number;
}

export interface OverallStats {
    totalEmployees: number;
    totalLates: number;
    totalEarlies: number;
    averageViolationRate: number;
    averageWorkDuration: string;
    dailyViolationsTrend: DailyViolationsTrendData[];
    violationsByDay: ViolationsByDayData[];
    workDurationDistribution: WorkDurationDistributionData[];
}
// Fix: Add CompanyStats and CompanySortKey types to resolve import errors.
// These types are used for aggregated statistics per company.
export interface CompanyStats {
    companyName: string;
    employeeCount: number;
    totalLates: number;
    totalEarlies: number;
    averageViolationRate: number;
    averageWorkDuration: string;
}

export type CompanySortKey = keyof CompanyStats;
