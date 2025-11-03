import React, { CSSProperties } from 'react';

export type Tab = 'overview' | 'employees' | 'detailed' | 'charts';

interface AnalysisTabsProps {
  overviewContent: React.ReactNode;
  employeesContent: React.ReactNode;
  chartsContent: React.ReactNode;
  detailedContent: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  disabledTabs?: Tab[];
}

const getTabContentStyle = (isActive: boolean): CSSProperties => ({
  display: isActive ? 'block' : 'none',
});

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ overviewContent, employeesContent, chartsContent, detailedContent, activeTab, onTabChange, disabledTabs = [] }) => {

  const TabButton: React.FC<{ tabId: Tab; children: React.ReactNode }> = ({ tabId, children }) => {
    const isDisabled = disabledTabs.includes(tabId);
    return (
      <button
        onClick={() => !isDisabled && onTabChange(tabId)}
        disabled={isDisabled}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
          activeTab === tabId
            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-slate-500 dark:text-slate-400'
        } ${
          isDisabled 
            ? 'cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800' 
            : 'hover:text-slate-700 dark:hover:text-slate-200'
        }`}
        aria-current={activeTab === tabId ? 'page' : undefined}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <TabButton tabId="overview">Сводка</TabButton>
        <TabButton tabId="employees">Сотрудники</TabButton>
        <TabButton tabId="detailed">Детальный отчет</TabButton>
        <TabButton tabId="charts">Статистика</TabButton>
      </div>
      <div className="p-4">
        <div id="tab-content-overview" style={getTabContentStyle(activeTab === 'overview')}>
          {overviewContent}
        </div>
        <div id="tab-content-employees" style={getTabContentStyle(activeTab === 'employees')}>
          {employeesContent}
        </div>
        <div 
          id="tab-content-charts"
          style={getTabContentStyle(activeTab === 'charts')}
        >
          {chartsContent}
        </div>
        <div id="tab-content-detailed" style={getTabContentStyle(activeTab === 'detailed')}>
          {detailedContent}
        </div>
      </div>
    </div>
  );
};
