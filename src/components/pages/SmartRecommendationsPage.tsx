import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Boxes,
  Truck,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  ArrowRightLeft,
  Filter,
  Download,
  FileSpreadsheet,
  Building2,
  Info
} from 'lucide-react';
import { MedicineAnalytics, BatchExpiryDetail, CriticalAlert } from '../../types/inventory';
import { exportToCSV, exportToExcel } from '../../utils/csvParser';
import { formatINR } from '../../utils/currency';

export interface SmartRecommendation {
  id: string;
  category: 'Shortage Prevention' | 'Expiry & FEFO Action' | 'Excess Capital Recovery' | 'Vendor SLA Adjustment';
  priority: 'Immediate' | 'High' | 'Moderate';
  medicine_id?: string;
  title: string;
  rationale: string;
  suggestedAction: string;
  financialImpact: string;
  facilityScope: 'Hospital & Clinic' | 'Pharmacy & Hospital' | 'Universal';
  actionType: 'order' | 'transfer' | 'moratorium' | 'vendor_review';
  dataPayload?: any;
}

interface SmartRecommendationsPageProps {
  medicineAnalytics: MedicineAnalytics[];
  batchExpiryDetails: BatchExpiryDetail[];
  criticalAlerts: CriticalAlert[];
  onSelectMedicine?: (med: MedicineAnalytics) => void;
  facilityType?: 'hospital' | 'clinic' | 'pharmacy';
}

export const SmartRecommendationsPage: React.FC<SmartRecommendationsPageProps> = ({
  medicineAnalytics,
  batchExpiryDetails,
  criticalAlerts,
  onSelectMedicine,
  facilityType = 'hospital'
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Generate dynamic, data-grounded smart recommendations
  const recommendations = useMemo<SmartRecommendation[]>(() => {
    const list: SmartRecommendation[] = [];

    // 1. Frequently Depleted & Imminent Shortage Recommendations
    const imminentShortages = medicineAnalytics
      .filter(m => m.estimated_days_to_stockout <= m.lead_time_days)
      .sort((a, b) => a.estimated_days_to_stockout - b.estimated_days_to_stockout);

    imminentShortages.forEach(med => {
      list.push({
        id: `rec-shortage-${med.medicine_id}`,
        category: 'Shortage Prevention',
        priority: med.criticality === 'Vital' ? 'Immediate' : 'High',
        medicine_id: med.medicine_id,
        title: `Dispatch Urgent Purchase Order for ${med.name}`,
        rationale: `Stock covers only ${med.estimated_days_to_stockout} days, which is less than the ${med.lead_time_days}-day supplier lead time. Risk of total stockout without immediate expedited reorder.`,
        suggestedAction: `Place emergency PO for ${med.suggested_order_qty > 0 ? med.suggested_order_qty.toLocaleString('en-IN') : med.reorder_level} units today.`,
        financialImpact: `Estimated PO Value: ${formatINR(med.suggested_order_qty * med.unit_cost)}`,
        facilityScope: 'Universal',
        actionType: 'order',
        dataPayload: med
      });
    });

    // 2. Expiry & FEFO Wastage Prevention
    const expiringBatches = batchExpiryDetails
      .filter(b => b.is_fefo_vulnerable && b.days_to_expiry > 0 && b.potential_wastage_qty > 0)
      .sort((a, b) => b.days_to_expiry - a.days_to_expiry);

    expiringBatches.slice(0, 8).forEach(batch => {
      const isUrgent = batch.days_to_expiry <= 30;
      list.push({
        id: `rec-expiry-${batch.batch_no}`,
        category: 'Expiry & FEFO Action',
        priority: isUrgent ? 'Immediate' : 'High',
        medicine_id: batch.medicine_id,
        title: `Inter-Department Lot Transfer for Batch #${batch.batch_no} (${batch.medicine_name})`,
        rationale: `Batch #${batch.batch_no} (${batch.quantity_on_hand} units) expires in ${batch.days_to_expiry} days. At current daily consumption velocity, ${batch.potential_wastage_qty} units will remain unconsumed and become total write-off loss.`,
        suggestedAction: isUrgent
          ? `Route lot to high-turnover Outpatient dispensary or Day Care ward for First-Expiry-First-Out dispensing.`
          : `Initiate supplier return authorization credit before the 30-day return window expires.`,
        financialImpact: `Projected Loss Prevented: ${formatINR(batch.potential_wastage_value)}`,
        facilityScope: 'Hospital & Clinic',
        actionType: 'transfer',
        dataPayload: batch
      });
    });

    // 3. Excess Inventory & Dead Stock Capital Recovery
    const deadStock = medicineAnalytics
      .filter(m => m.is_dead_stock)
      .sort((a, b) => b.stock_value - a.stock_value);

    deadStock.forEach(med => {
      list.push({
        id: `rec-dead-${med.medicine_id}`,
        category: 'Excess Capital Recovery',
        priority: med.stock_value > 5000 ? 'High' : 'Moderate',
        medicine_id: med.medicine_id,
        title: `Halt Reorders & Liquidate Inactive Dead Stock (${med.name})`,
        rationale: `Zero dispensations recorded over past 90 consecutive days. ${med.total_stock} units currently sit inactive in storage, freezing vital working capital.`,
        suggestedAction: `Institute an immediate purchasing freeze. Reallocate inventory to affiliated branch clinics or negotiate vendor return credits.`,
        financialImpact: `Locked Capital to Unlock: ${formatINR(med.stock_value)}`,
        facilityScope: 'Universal',
        actionType: 'moratorium',
        dataPayload: med
      });
    });

    // 4. Overstocked Lines (>90 days cover)
    const overstocked = medicineAnalytics
      .filter(m => m.is_overstocked && !m.is_dead_stock)
      .sort((a, b) => b.excess_stock_value - a.excess_stock_value);

    overstocked.slice(0, 5).forEach(med => {
      list.push({
        id: `rec-excess-${med.medicine_id}`,
        category: 'Excess Capital Recovery',
        priority: 'Moderate',
        medicine_id: med.medicine_id,
        title: `Delay Scheduled Replenishment on ${med.name}`,
        rationale: `Current physical stock provides ${Math.round(med.days_of_stock_cover)} days of consumption cover, well beyond the 60-day operational safety threshold.`,
        suggestedAction: `Pause routine monthly purchase orders until inventory normalizes under 45 days of cover.`,
        financialImpact: `Surplus Capital Avoided: ${formatINR(med.excess_stock_value)}`,
        facilityScope: 'Pharmacy & Hospital',
        actionType: 'moratorium',
        dataPayload: med
      });
    });

    return list;
  }, [medicineAnalytics, batchExpiryDetails]);

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
      return true;
    });
  }, [recommendations, categoryFilter, priorityFilter]);

  // Counts by priority
  const immediateCount = recommendations.filter(r => r.priority === 'Immediate').length;
  const highCount = recommendations.filter(r => r.priority === 'High').length;
  const moderateCount = recommendations.filter(r => r.priority === 'Moderate').length;

  const handleExecuteAction = (rec: SmartRecommendation) => {
    if (rec.medicine_id && onSelectMedicine) {
      const med = medicineAnalytics.find(m => m.medicine_id === rec.medicine_id);
      if (med) {
        onSelectMedicine(med);
        return;
      }
    }
    setActionSuccessToast(`Prescribed intervention initiated: ${rec.title}`);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  const handleExportCSV = () => {
    const exportData = filteredRecommendations.map(r => ({
      Category: r.category,
      Priority: r.priority,
      Medicine_ID: r.medicine_id || 'N/A',
      Title: r.title,
      Rationale: r.rationale,
      Suggested_Action: r.suggestedAction,
      Financial_Impact: r.financialImpact
    }));
    exportToCSV(exportData, 'meditrack_smart_recommendations');
  };

  const handleExportExcel = () => {
    const exportData = filteredRecommendations.map(r => ({
      Category: r.category,
      Priority: r.priority,
      Medicine_ID: r.medicine_id || 'N/A',
      Title: r.title,
      Rationale: r.rationale,
      Suggested_Action: r.suggestedAction,
      Financial_Impact: r.financialImpact
    }));
    exportToExcel(exportData, 'meditrack_smart_recommendations', 'Recommendations');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Inventory Recommendations
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prescriptive algorithmic guidance designed for {facilityType === 'hospital' ? 'Hospitals (ICU/Wards)' : facilityType === 'clinic' ? 'Outpatient Clinics' : 'Pharmacies & Dispensaries'} to prevent shortages, eliminate expiry losses, and recover locked capital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-emerald-600 hover:underline text-[11px] cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Actionable Insights</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1 tabular-nums">
            {recommendations.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across shortages, expiry & excess</div>
        </div>

        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">Immediate Priority</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 tabular-nums">
            {immediateCount}
          </div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">Urgent stockout or &le;30d expiry</div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">High Priority</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 tabular-nums">
            {highCount}
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">FEFO transfer & dead stock recovery</div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Moderate Priority</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 font-mono mt-1 tabular-nums">
            {moderateCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Overstocked order moratoriums</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Recommendations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Disciplines</option>
            <option value="Shortage Prevention">Shortage Prevention</option>
            <option value="Expiry & FEFO Action">Expiry & FEFO Action</option>
            <option value="Excess Capital Recovery">Excess Capital Recovery</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Immediate">Immediate Priority</option>
            <option value="High">High Priority</option>
            <option value="Moderate">Moderate Priority</option>
          </select>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-3">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(rec => (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border transition-all ${
                rec.priority === 'Immediate'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : rec.priority === 'High'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        rec.priority === 'Immediate'
                          ? 'bg-rose-600 text-white'
                          : rec.priority === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {rec.priority}
                    </span>

                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {rec.category}
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">·</span>

                    <span className="text-[11px] text-slate-500">
                      Facility: {rec.facilityScope}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.rationale}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Recommended Action: </span>
                    <span className="text-slate-700 dark:text-slate-300">{rec.suggestedAction}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end justify-between shrink-0 gap-3 pt-2 md:pt-0">
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                    {rec.financialImpact}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleExecuteAction(rec)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {rec.actionType === 'order' && <ShoppingCart className="w-3.5 h-3.5" />}
                    {rec.actionType === 'transfer' && <ArrowRightLeft className="w-3.5 h-3.5" />}
                    {rec.actionType === 'moratorium' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Take Action / Manage</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No recommendations matching current filters.
          </div>
        )}
      </div>
    </div>
  );
};
