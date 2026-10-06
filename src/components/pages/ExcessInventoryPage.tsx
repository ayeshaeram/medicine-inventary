import React, { useMemo, useState } from 'react';
import {
  Boxes,
  DollarSign,
  AlertCircle,
  Archive,
  RefreshCw,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { MedicineAnalytics } from '../../types/inventory';
import { DataTable, Column } from '../common/DataTable';
import { MetricTooltip } from '../common/MetricTooltip';

interface ExcessInventoryPageProps {
  medicineAnalytics: MedicineAnalytics[];
  onSelectMedicine?: (med: MedicineAnalytics) => void;
}

export const ExcessInventoryPage: React.FC<ExcessInventoryPageProps> = ({
  medicineAnalytics,
  onSelectMedicine
}) => {
  const [filterType, setFilterType] = useState<'all' | 'overstocked' | 'dead_stock'>('all');

  // Overstocked medicines (cover > 90 days)
  const overstockedMedicines = useMemo(() => {
    return medicineAnalytics
      .filter(m => m.is_overstocked)
      .sort((a, b) => b.excess_stock_value - a.excess_stock_value);
  }, [medicineAnalytics]);

  // Dead stock medicines (0 consumption in last 90 days)
  const deadStockMedicines = useMemo(() => {
    return medicineAnalytics
      .filter(m => m.is_dead_stock)
      .sort((a, b) => b.stock_value - a.stock_value);
  }, [medicineAnalytics]);

  // Filtered dataset for table
  const displayedMedicines = useMemo(() => {
    if (filterType === 'overstocked') return overstockedMedicines;
    if (filterType === 'dead_stock') return deadStockMedicines;
    return medicineAnalytics.filter(m => m.is_overstocked || m.is_dead_stock);
  }, [filterType, overstockedMedicines, deadStockMedicines, medicineAnalytics]);

  // Total Excess Metrics
  const totalExcessValue = overstockedMedicines.reduce((acc, m) => acc + m.excess_stock_value, 0);
  const totalDeadStockValue = deadStockMedicines.reduce((acc, m) => acc + m.stock_value, 0);
  const averageTurnoverRatio = +(
    medicineAnalytics.reduce((acc, m) => acc + m.inventory_turnover_ratio, 0) / (medicineAnalytics.length || 1)
  ).toFixed(2);

  // Top 8 Overstocked Chart Data
  const chartData = useMemo(() => {
    return overstockedMedicines.slice(0, 8).map(m => ({
      name: m.name.length > 15 ? m.name.slice(0, 13) + '...' : m.name,
      excessValue: Math.round(m.excess_stock_value),
      daysCover: Math.round(m.days_of_stock_cover)
    }));
  }, [overstockedMedicines]);

  const columns: Column<MedicineAnalytics>[] = [
    { key: 'name', header: 'Medicine Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'total_stock',
      header: 'Current Stock',
      align: 'right',
      render: (row) => `${row.total_stock.toLocaleString()} units`
    },
    {
      key: 'days_of_stock_cover',
      header: 'Days of Cover',
      align: 'right',
      render: (row) => (
        <span className={`font-mono font-bold ${row.days_of_stock_cover > 180 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {row.days_of_stock_cover > 365 ? '>365 days' : `${Math.round(row.days_of_stock_cover)} days`}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Classification',
      align: 'center',
      render: (row) => {
        if (row.is_dead_stock) {
          return (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              Dead Stock
            </span>
          );
        }
        if (row.is_overstocked) {
          return (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
              Overstocked (&gt;90d)
            </span>
          );
        }
        return <span className="text-slate-400 text-xs">Optimal</span>;
      }
    },
    {
      key: 'excess_quantity',
      header: 'Excess Quantity',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {row.excess_quantity.toLocaleString()} units
        </span>
      )
    },
    {
      key: 'excess_stock_value',
      header: 'Excess Value (₹)',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
          ₹{row.excess_stock_value.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'inventory_turnover_ratio',
      header: 'Turnover Ratio',
      align: 'right',
      render: (row) => `${row.inventory_turnover_ratio}x`
    },
    {
      key: 'recommendation',
      header: 'Recommended Intervention',
      render: (row) => {
        if (row.is_dead_stock) {
          return <span className="text-slate-600 dark:text-slate-300 font-medium">Return to supplier or initiate disposal</span>;
        }
        if (row.days_of_stock_cover > 180) {
          return <span className="text-rose-600 dark:text-rose-400 font-medium">Halt purchase orders; redistribute to sister hospital</span>;
        }
        return <span className="text-amber-600 dark:text-amber-400 font-medium">Defer upcoming replenishment orders</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Module 3: Excess Inventory & Capital Optimization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Identification of trapped working capital, slow-velocity overstock (&gt;90 days cover), and inactive dead stock.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trapped Excess Capital</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              ₹{totalExcessValue.toLocaleString('en-IN')}
            </div>
            <MetricTooltip
              title="Trapped Excess Value"
              formula="SUM(max(0, current_stock - (ADC * 60)) * unit_cost)"
              clinicalSignificance="Inventory exceeding a safe 60-day operational buffer, freezing hospital cash flow."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {overstockedMedicines.length} overstocked medicines</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dead Stock Valuation</span>
            <Archive className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              ₹{totalDeadStockValue.toLocaleString('en-IN')}
            </div>
            <MetricTooltip
              title="Dead Stock Valuation"
              formula="Total valuation of SKUs with 0 recorded consumption during past 90 consecutive days"
              clinicalSignificance="Inactive stock risking full expiration write-off without immediate intervention."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{deadStockMedicines.length} non-moving items identified</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Inventory Turnover</span>
            <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
              {averageTurnoverRatio}x / yr
            </div>
            <MetricTooltip
              title="Inventory Turnover Ratio (ITR)"
              formula="Annual Total Consumption Value / Current Total Stock Value"
              clinicalSignificance="Hospital industry benchmark: 8x to 12x annually. Lower turnover indicates over-purchasing."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Annualized replenishment velocity</div>
        </div>
      </div>

      {/* Top Overstocked Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
          Top Overstocked Medicines by Locked Capital
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Rupee value of inventory sitting beyond the 60-day operational safety threshold
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <RechartsTooltip
                formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Excess Capital']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="excessValue" name="Locked Capital (₹)" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overstocked & Dead Stock Register */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Excess Inventory & Dead Stock Register
            </h2>
            <p className="text-[11px] text-slate-500">
              Detailed list of surplus stock with days of cover and capital recovery actions
            </p>
          </div>

          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Surplus ({overstockedMedicines.length + deadStockMedicines.length})
            </button>
            <button
              onClick={() => setFilterType('overstocked')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'overstocked'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Overstocked ({overstockedMedicines.length})
            </button>
            <button
              onClick={() => setFilterType('dead_stock')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'dead_stock'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Dead Stock ({deadStockMedicines.length})
            </button>
          </div>
        </div>

        <DataTable
          data={displayedMedicines}
          columns={columns}
          searchPlaceholder="Search surplus medicines..."
          exportFilename="excess_inventory_register"
          onRowClick={onSelectMedicine}
        />
      </div>
    </div>
  );
};
