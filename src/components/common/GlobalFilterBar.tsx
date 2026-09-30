import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { GlobalFilterState, Category, Department } from '../../types/inventory';
import { MEDICINE_CATALOG } from '../../data/sampleGenerator';

interface GlobalFilterBarProps {
  filters: GlobalFilterState;
  onFilterChange: (filters: Partial<GlobalFilterState>) => void;
  onReset: () => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const categories: Category[] = [
    'Antibiotics',
    'Analgesics',
    'Cardiac',
    'Diabetic',
    'Antacids',
    'Vitamins',
    'Emergency Drugs',
    'IV Fluids'
  ];

  const departments: Department[] = ['OPD', 'ICU', 'Emergency', 'Pharmacy'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          {/* Time Window Tabs */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            {(['30d', '90d', '180d', '365d'] as const).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => onFilterChange({ dateRange: range })}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filters.dateRange === range
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : range === '180d' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={filters.category}
            onChange={e => onFilterChange({ category: e.target.value })}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Department Dropdown */}
          <select
            value={filters.department}
            onChange={e => onFilterChange({ department: e.target.value })}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Specific Medicine Dropdown */}
          <select
            value={filters.medicineId}
            onChange={e => onFilterChange({ medicineId: e.target.value })}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 max-w-[190px] truncate"
          >
            <option value="all">All Medicines</option>
            {MEDICINE_CATALOG.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-md transition-colors"
            title="Reset filters to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
