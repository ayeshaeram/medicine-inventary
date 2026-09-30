import React from 'react';
import {
  AlertTriangle,
  Boxes,
  Clock,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MedicineAnalytics, BatchExpiryDetail, CriticalAlert, RawDataset } from '../../types/inventory';
import { MetricTooltip } from '../common/MetricTooltip';
import { PageId } from '../layout/Sidebar';

interface OverviewPageProps {
  analytics: {
    medicineAnalytics: MedicineAnalytics[];
    batchExpiryDetails: BatchExpiryDetail[];
    criticalAlerts: CriticalAlert[];
    kpis: {
      totalMedicines: number;
      totalStockValue: number;
      stockoutCount: number;
      highRiskCount: number;
      overstockedCount: number;
      expiring30DaysCount: number;
      potentialWastageValue: number;
      overallFillRate: number;
    };
  };
  rawDataset: RawDataset;
  onNavigate: (page: PageId) => void;
}

const CATEGORY_COLORS = ['#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#10b981'];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  analytics,
  rawDataset,
  onNavigate
}) => {
  const { kpis, criticalAlerts, medicineAnalytics, batchExpiryDetails } = analytics;

  // Monthly Consumption Trend Data
  const monthlyConsumptionData = React.useMemo(() => {
    const monthMap = new Map<string, number>();
    rawDataset.consumption.forEach(c => {
      const monthKey = c.date.slice(0, 7); // YYYY-MM
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + c.quantity_used);
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => {
        const [y, m] = month.split('-');
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
        const label = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        return { month: label, consumption: total };
      });
  }, [rawDataset.consumption]);

  // Top 6 Consumed Medicines
  const topConsumedData = React.useMemo(() => {
    return [...medicineAnalytics]
      .sort((a, b) => b.total_consumed - a.total_consumed)
      .slice(0, 6)
      .map(m => ({
        name: m.name.length > 18 ? m.name.slice(0, 16) + '...' : m.name,
        consumed: m.total_consumed,
        stock: m.total_stock
      }));
  }, [medicineAnalytics]);

  // Stock vs Reorder Level comparison (Top items with tightest cover)
  const stockVsReorderData = React.useMemo(() => {
    return [...medicineAnalytics]
      .sort((a, b) => a.days_of_stock_cover - b.days_of_stock_cover)
      .slice(0, 6)
      .map(m => ({
        name: m.name.length > 16 ? m.name.slice(0, 14) + '...' : m.name,
        currentStock: m.total_stock,
        reorderLevel: m.reorder_level,
        safetyStock: m.safety_stock
      }));
  }, [medicineAnalytics]);

  // Expiry Timeline Buckets
  const expiryTimelineData = React.useMemo(() => {
    const buckets: Record<string, { count: number; value: number }> = {
      'Expired': { count: 0, value: 0 },
      '0-30 days': { count: 0, value: 0 },
      '31-60 days': { count: 0, value: 0 },
      '61-90 days': { count: 0, value: 0 },
      '>90 days': { count: 0, value: 0 }
    };

    batchExpiryDetails.forEach(b => {
      if (buckets[b.expiry_bucket]) {
        buckets[b.expiry_bucket].count += b.quantity_on_hand;
        buckets[b.expiry_bucket].value += +(b.quantity_on_hand * b.unit_cost).toFixed(2);
      }
    });

    return Object.entries(buckets).map(([bucket, data]) => ({
      bucket,
      units: data.count,
      valuation: Math.round(data.value)
    }));
  }, [batchExpiryDetails]);

  // Category-wise Valuation
  const categoryValuationData = React.useMemo(() => {
    const catMap = new Map<string, number>();
    medicineAnalytics.forEach(m => {
      catMap.set(m.category, (catMap.get(m.category) || 0) + m.stock_value);
    });

    return Array.from(catMap.entries()).map(([category, value]) => ({
      name: category,
      value: Math.round(value)
    }));
  }, [medicineAnalytics]);

  // Department Consumption Breakdown
  const deptConsumptionData = React.useMemo(() => {
    const deptMap = new Map<string, number>();
    rawDataset.consumption.forEach(c => {
      deptMap.set(c.department, (deptMap.get(c.department) || 0) + c.quantity_used);
    });

    return Array.from(deptMap.entries()).map(([department, quantity]) => ({
      department,
      units: quantity
    }));
  }, [rawDataset.consumption]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Medicine Inventory Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic monitoring of stock availability, consumption velocity, shortage indicators, and expiry risks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-md font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Engine Active</span>
          </span>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Medicines</span>
            <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {kpis.totalMedicines}
            </div>
            <MetricTooltip
              title="Total Medicines Monitored"
              formula="Count of active distinct medicine SKUs in clinical catalog"
              clinicalSignificance="Covers Antibiotics, Analgesics, Cardiac, Diabetic, Antacids, Vitamins, Emergency, and IV Fluids."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across 8 clinical categories</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Stock Value</span>
            <DollarSign className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              ₹{kpis.totalStockValue.toLocaleString('en-IN')}
            </div>
            <MetricTooltip
              title="Total Stock Valuation"
              formula="SUM(batch_quantity_on_hand * unit_cost)"
              clinicalSignificance="Total active working capital allocated to pharmaceutical and emergency medical supplies."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Physical inventory in warehouse & wards</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stock-Out Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {kpis.stockoutCount}
            </div>
            <MetricTooltip
              title="Stock-Out Incidents"
              formula="Count of SKUs that suffered zero availability or acute supply disruption"
              clinicalSignificance="Highlights medicines requiring supplier buffer agreements or safety stock increases."
            />
          </div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Incidents in analyzed 12-month period</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">High Depletion Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {kpis.highRiskCount}
            </div>
            <MetricTooltip
              title="High Shortage Risk SKUs"
              formula="Medicines with Shortage Risk Score >= 70 (Cover < Lead Time, Vital/Essential)"
              clinicalSignificance="Immediate patient safety hazard if stock runs out before procurement delivery."
            />
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Stock cover &lt; supplier lead time</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overstocked SKUs</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {kpis.overstockedCount}
            </div>
            <MetricTooltip
              title="Overstocked Medicines"
              formula="Medicines with Days of Cover > 90 days"
              clinicalSignificance="Ties up working capital and increases risk of shelf expiry before dispensation."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">&gt; 90 days stock cover on hand</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expiring in 30 Days</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {kpis.expiring30DaysCount}
            </div>
            <MetricTooltip
              title="Batches Expiring &le; 30 Days"
              formula="Count of active stock batches reaching manufacturer expiration within 30 days"
              clinicalSignificance="Must be prioritized for FEFO consumption or inter-departmental transfers."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active batches in final 30-day window</div>
        </div>

        {/* KPI 7 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Potential Wastage Value</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              ₹{kpis.potentialWastageValue.toLocaleString('en-IN')}
            </div>
            <MetricTooltip
              title="Potential Expiry Wastage Value"
              formula="SUM(max(0, batch_qty - (ADC * days_to_expiry)) * unit_cost)"
              clinicalSignificance="Projected write-off loss based on current daily consumption velocity and batch expiry dates."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((kpis.potentialWastageValue / (kpis.totalStockValue || 1)) * 100).toFixed(1)}% of total inventory valuation
          </div>
        </div>

        {/* KPI 8 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Order Fill Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
              {kpis.overallFillRate}%
            </div>
            <MetricTooltip
              title="Clinical Order Fill Rate"
              formula="(Total Consumed / Total Requested Demand) * 100"
              clinicalSignificance="Reflects the hospital pharmacy's fulfillment reliability for doctor and patient prescriptions."
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Target: &ge; 98.0% clinical fulfillment</div>
        </div>
      </div>

      {/* Critical Alerts Panel: Top 5 Urgent Actions */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/80 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Critical Inventory Alerts ({criticalAlerts.length} Action Items)
            </h2>
          </div>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Requires immediate pharmacy pharmacist & buyer review
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {criticalAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`font-semibold ${
                      alert.severity === 'critical' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {alert.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                      alert.severity === 'critical'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mb-2">
                  {alert.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700 dark:text-slate-200">{alert.actionText}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (alert.targetModule === 'Shortage Risk') onNavigate('shortage');
                    else if (alert.targetModule === 'Expiry & Wastage') onNavigate('expiry');
                    else if (alert.targetModule === 'Excess Inventory') onNavigate('excess');
                  }}
                  className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: 12-Month System Consumption Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                12-Month Consumption Velocity
              </h3>
              <p className="text-[11px] text-slate-500">Monthly aggregate consumption across all hospital departments</p>
            </div>
            <button
              onClick={() => onNavigate('usage')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Usage Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyConsumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  name="Monthly Consumption (units)"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0d9488' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Consumed Medicines vs Stock */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Top Consumed Medicines vs Current Stock
              </h3>
              <p className="text-[11px] text-slate-500">Highest volume medicines and stock resilience</p>
            </div>
            <button
              onClick={() => onNavigate('usage')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>ABC Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="consumed" name="Annual Consumed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stock" name="Current Stock" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Stock vs Reorder Level (Imminent Depletion) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Current Stock vs Reorder Level (Tightest Cover)
              </h3>
              <p className="text-[11px] text-slate-500">Medicines running closest to critical replenishment threshold</p>
            </div>
            <button
              onClick={() => onNavigate('shortage')}
              className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Shortage Monitor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockVsReorderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="currentStock" name="Current Stock" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorderLevel" name="Reorder Level (ROP)" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Expiry Timeline Buckets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Inventory Expiry Aging Timeline
              </h3>
              <p className="text-[11px] text-slate-500">Units distributed by remaining shelf life</p>
            </div>
            <button
              onClick={() => onNavigate('expiry')}
              className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>FEFO Tracker</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="units" name="Stock Units" radius={[4, 4, 0, 0]}>
                  {expiryTimelineData.map((entry, index) => {
                    let color = '#10b981'; // safe
                    if (entry.bucket === 'Expired') color = '#dc2626';
                    else if (entry.bucket === '0-30 days') color = '#f97316';
                    else if (entry.bucket === '31-60 days') color = '#f59e0b';
                    else if (entry.bucket === '61-90 days') color = '#eab308';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Category Inventory Valuation Share */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Stock Valuation Share by Category
              </h3>
              <p className="text-[11px] text-slate-500">Capital distribution across 8 clinical sectors</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryValuationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryValuationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Valuation']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Department Consumption Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Departmental Dispensation Share
              </h3>
              <p className="text-[11px] text-slate-500">Volume utilized in Outpatient, ICU, Emergency, and Pharmacy</p>
            </div>
            <button
              onClick={() => onNavigate('usage')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Dept Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptConsumptionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="units" name="Units Consumed" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
