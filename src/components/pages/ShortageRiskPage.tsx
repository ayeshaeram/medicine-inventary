import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  ShoppingCart,
  TrendingDown,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { MedicineAnalytics } from '../../types/inventory';
import { DataTable, Column } from '../common/DataTable';
import { MetricTooltip } from '../common/MetricTooltip';

interface ShortageRiskPageProps {
  medicineAnalytics: MedicineAnalytics[];
  onOrderClick?: (med: MedicineAnalytics) => void;
}

export const ShortageRiskPage: React.FC<ShortageRiskPageProps> = ({
  medicineAnalytics
}) => {
  const [riskFilter, setRiskFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<'all' | 'Vital' | 'Essential' | 'Desirable'>('all');

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicineAnalytics.filter(m => {
      if (riskFilter !== 'all' && m.shortage_risk_level !== riskFilter) return false;
      if (criticalityFilter !== 'all' && m.criticality !== criticalityFilter) return false;
      return true;
    });
  }, [medicineAnalytics, riskFilter, criticalityFilter]);

  // Top 10 most frequently depleted / highest risk medicines
  const top10Depleted = useMemo(() => {
    return [...medicineAnalytics]
      .sort((a, b) => b.shortage_risk_score - a.shortage_risk_score)
      .slice(0, 10);
  }, [medicineAnalytics]);

  // High risk count
  const highRiskCount = medicineAnalytics.filter(m => m.shortage_risk_level === 'High').length;
  const mediumRiskCount = medicineAnalytics.filter(m => m.shortage_risk_level === 'Medium').length;
  const lowRiskCount = medicineAnalytics.filter(m => m.shortage_risk_level === 'Low').length;

  const columns: Column<MedicineAnalytics>[] = [
    { key: 'name', header: 'Medicine Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'criticality',
      header: 'Criticality',
      align: 'center',
      render: (row) => (
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            row.criticality === 'Vital'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              : row.criticality === 'Essential'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {row.criticality}
        </span>
      )
    },
    {
      key: 'total_stock',
      header: 'Stock on Hand',
      align: 'right',
      render: (row) => `${row.total_stock.toLocaleString()} units`
    },
    {
      key: 'lead_time_days',
      header: 'Lead Time',
      align: 'right',
      render: (row) => `${row.lead_time_days} days`
    },
    {
      key: 'estimated_days_to_stockout',
      header: 'Days to Stock-Out',
      align: 'right',
      render: (row) => {
        const isUrgent = row.estimated_days_to_stockout <= row.lead_time_days;
        return (
          <span className={`font-bold font-mono ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {row.estimated_days_to_stockout > 365 ? '>365d' : `${row.estimated_days_to_stockout}d`}
          </span>
        );
      }
    },
    {
      key: 'unmet_demand',
      header: 'Unmet Demand',
      align: 'right',
      render: (row) => (
        <span className={row.unmet_demand > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>
          {row.unmet_demand.toLocaleString()}
        </span>
      )
    },
    {
      key: 'fill_rate_pct',
      header: 'Fill Rate %',
      align: 'right',
      render: (row) => (
        <span className={`font-mono ${row.fill_rate_pct < 95 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {row.fill_rate_pct}%
        </span>
      )
    },
    {
      key: 'shortage_risk_score',
      header: 'Risk Score (0-100)',
      align: 'center',
      render: (row) => {
        const level = row.shortage_risk_level;
        const color =
          level === 'High'
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300'
            : level === 'Medium'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300';

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>
            <span>{row.shortage_risk_score}</span>
            <span>·</span>
            <span>{level}</span>
          </span>
        );
      }
    },
    {
      key: 'suggested_order_qty',
      header: 'Suggested Replenishment',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-teal-700 dark:text-teal-400 font-mono">
          {row.suggested_order_qty > 0 ? `${row.suggested_order_qty.toLocaleString()} units` : 'Adequate'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Module 2: Frequently Depleted Medicines & Shortage Risk Monitor
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Proactive shortage detection based on stock-out frequency, days of cover vs. supplier lead time, and clinical criticality.
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">High Shortage Risk</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 tabular-nums">
              {highRiskCount} Medicines
            </div>
            <div className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">Cover &le; Lead Time · Action required</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-500/80" />
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Moderate Shortage Risk</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 tabular-nums">
              {mediumRiskCount} Medicines
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Approaching reorder threshold</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/80" />
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Healthy Stock Cover</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 tabular-nums">
              {lowRiskCount} Medicines
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">Sufficient buffer beyond lead time</div>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/80" />
        </div>
      </div>

      {/* Ranked Top 10 Depleted Medicines Spotlight */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Top 10 Most Frequently Depleted & Vulnerable Medicines
            </h2>
            <p className="text-[11px] text-slate-500">
              Ranked by Shortage Risk Score combining lead time deficit, stockouts, and clinical criticality
            </p>
          </div>
          <MetricTooltip
            title="Shortage Risk Score (SRS) Formula"
            formula="SRS = (Cover_vs_LeadTime_Weight [45pts] + Stockout_UnmetDemand_Weight [35pts]) * Criticality_Multiplier (Vital=1.0, Essential=0.8, Desirable=0.55)"
            clinicalSignificance="High Risk (&ge;70) indicates imminent stock exhaustion before a new procurement shipment can arrive."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {top10Depleted.slice(0, 4).map(m => (
            <div
              key={m.medicine_id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Risk: {m.shortage_risk_score}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-2">
                  <span>Category: {m.category}</span>
                  <span>·</span>
                  <span>Criticality: <strong className="text-slate-700 dark:text-slate-300">{m.criticality}</strong></span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-2 text-[11px] leading-relaxed">
                  {m.primary_insight}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between font-mono text-[11px]">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  Days Cover: {m.estimated_days_to_stockout}d (Lead: {m.lead_time_days}d)
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">
                  Order: {m.suggested_order_qty} units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Medicine Depletion & Risk Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Comprehensive Depletion & Fill Rate Register
            </h2>
            <p className="text-[11px] text-slate-500">
              Interactive searchable breakdown of all 60 medicines with lead times, fill rates, and safety buffers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>

            <select
              value={criticalityFilter}
              onChange={e => setCriticalityFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Criticalities</option>
              <option value="Vital">Vital (V)</option>
              <option value="Essential">Essential (E)</option>
              <option value="Desirable">Desirable (D)</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredMedicines}
          columns={columns}
          searchPlaceholder="Search medicine, category..."
          exportFilename="depleted_medicines_shortage_risk"
        />
      </div>
    </div>
  );
};
