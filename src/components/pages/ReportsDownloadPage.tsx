import React from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Table,
  Building,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import {
  MedicineAnalytics,
  BatchExpiryDetail,
  CriticalAlert,
  SupplierMetric,
  RawDataset
} from '../../types/inventory';
import { exportToCSV, exportToExcel, downloadMasterExcelTemplate } from '../../utils/csvParser';
import { generateInventoryPDF } from '../../utils/pdfExport';
import { OPERATIONAL_DATE } from '../../utils/analyticsEngine';
import { formatINR } from '../../utils/currency';

interface ReportsDownloadPageProps {
  analytics: {
    medicineAnalytics: MedicineAnalytics[];
    batchExpiryDetails: BatchExpiryDetail[];
    criticalAlerts: CriticalAlert[];
    supplierMetrics: SupplierMetric[];
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
  facilityType?: 'hospital' | 'clinic' | 'pharmacy';
}

export const ReportsDownloadPage: React.FC<ReportsDownloadPageProps> = ({
  analytics,
  rawDataset,
  facilityType = 'hospital'
}) => {
  const { kpis, medicineAnalytics, batchExpiryDetails } = analytics;

  // 1. Download PDF Audit Report
  const handleDownloadPDF = () => {
    generateInventoryPDF({
      kpis,
      criticalAlerts: analytics.criticalAlerts,
      topDepleted: medicineAnalytics.filter(m => m.shortage_risk_level === 'High'),
      topOverstocked: medicineAnalytics.filter(m => m.is_overstocked),
      nearExpiryBatches: batchExpiryDetails.filter(b => b.days_to_expiry <= 30)
    });
  };

  // 2. Download Master Excel Workbook (.xlsx)
  const handleDownloadMasterExcel = () => {
    downloadMasterExcelTemplate();
  };

  // 3. Download Shortage Risk Schedule
  const handleDownloadShortageReport = (format: 'xlsx' | 'csv') => {
    const data = medicineAnalytics
      .filter((m: MedicineAnalytics) => m.shortage_risk_level !== 'Low' || m.estimated_days_to_stockout <= 30)
      .map((m: MedicineAnalytics) => ({
        Medicine_ID: m.medicine_id,
        Name: m.name,
        Category: m.category,
        Criticality: m.criticality,
        Current_Stock: m.total_stock,
        Daily_Avg_Usage: m.average_daily_consumption,
        Days_of_Cover: Math.round(m.days_of_stock_cover),
        Lead_Time_Days: m.lead_time_days,
        Shortage_Risk_Score: m.shortage_risk_score,
        Risk_Level: m.shortage_risk_level,
        Suggested_Order_Qty: m.suggested_order_qty,
        Est_Reorder_Cost_INR: Math.round(m.suggested_order_qty * m.unit_cost)
      }));

    if (format === 'xlsx') {
      exportToExcel(data, `Shortage_Risk_Schedule_${OPERATIONAL_DATE}`, 'Shortages');
    } else {
      exportToCSV(data, `Shortage_Risk_Schedule_${OPERATIONAL_DATE}`);
    }
  };

  // 4. Download Expiry & Wastage Report
  const handleDownloadExpiryReport = (format: 'xlsx' | 'csv') => {
    const data = batchExpiryDetails.map((b: BatchExpiryDetail) => ({
      Medicine_ID: b.medicine_id,
      Medicine_Name: b.medicine_name,
      Category: b.category,
      Batch_No: b.batch_no,
      Quantity_On_Hand: b.quantity_on_hand,
      Unit_Cost_INR: b.unit_cost,
      Expiry_Date: b.expiry_date,
      Days_to_Expiry: b.days_to_expiry,
      FEFO_Vulnerable: b.is_fefo_vulnerable ? 'YES' : 'NO',
      Potential_Wastage_Qty: b.potential_wastage_qty,
      Potential_Wastage_Value_INR: b.potential_wastage_value,
      Storage_Location: b.storage_location,
      Recommended_Action: b.suggested_action
    }));

    if (format === 'xlsx') {
      exportToExcel(data, `Expiry_Wastage_Ledger_${OPERATIONAL_DATE}`, 'Expiry_Ledger');
    } else {
      exportToCSV(data, `Expiry_Wastage_Ledger_${OPERATIONAL_DATE}`);
    }
  };

  // 5. Download Excess & Dead Stock Report
  const handleDownloadExcessReport = (format: 'xlsx' | 'csv') => {
    const data = medicineAnalytics
      .filter((m: MedicineAnalytics) => m.is_overstocked || m.is_dead_stock)
      .map((m: MedicineAnalytics) => ({
        Medicine_ID: m.medicine_id,
        Name: m.name,
        Category: m.category,
        Current_Stock: m.total_stock,
        Days_of_Cover: Math.round(m.days_of_stock_cover),
        Excess_Quantity: m.excess_quantity,
        Excess_Value_INR: m.excess_stock_value,
        Is_Dead_Stock: m.is_dead_stock ? 'YES' : 'NO',
        Inventory_Turnover_Ratio: m.inventory_turnover_ratio,
        ABC_Class: m.abc_class,
        XYZ_Class: m.xyz_class
      }));

    if (format === 'xlsx') {
      exportToExcel(data, `Excess_Dead_Stock_Report_${OPERATIONAL_DATE}`, 'Excess_Inventory');
    } else {
      exportToCSV(data, `Excess_Dead_Stock_Report_${OPERATIONAL_DATE}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-teal-600 text-white">
            <Download className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reports & Data Exports
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          One-click clinical audit downloads, executive PDF summaries, and multi-tab Excel workbooks for {facilityType === 'hospital' ? 'Hospital Leadership' : facilityType === 'clinic' ? 'Clinic Administration' : 'Pharmacy Operations'}.
        </p>
      </div>

      {/* Featured Executive Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Official Executive PDF Report */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/20 border border-teal-200 dark:border-teal-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-teal-600 text-white shadow-xs">
                <FileText className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded">
                Executive PDF Format
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-3">
              Official Clinical Audit Report (PDF)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Print-ready executive summary for the Medical Director, Pharmacy Board, and Purchase Committee. Includes high-risk stockout hazards, impending FEFO expiry losses, fill rates, and key metrics in INR (Rs.).
            </p>

            <div className="mt-3 text-[11px] text-slate-500 font-mono space-y-0.5">
              <div>· Operational Snapshot Date: {OPERATIONAL_DATE}</div>
              <div>· Total Monitored Medicines: {kpis.totalMedicines} SKUs</div>
              <div>· Active Stock Valuation: {formatINR(kpis.totalStockValue)}</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-teal-200/60 dark:border-teal-800/60">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Executive PDF Report</span>
            </button>
          </div>
        </div>

        {/* Card 2: Master Excel Consolidated Workbook */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                Multi-Tab .xlsx
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-3">
              Master 5-Tab Excel Workbook (.xlsx)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Complete consolidated hospital spreadsheet containing separate pre-formatted tabs for Medicines, Stock Batches, Historical Consumption, Procurement POs, and Ward Demand.
            </p>

            <div className="mt-3 text-[11px] text-slate-500 font-mono space-y-0.5">
              <div>· Sheet 1: Medicines Catalog (60 SKUs)</div>
              <div>· Sheet 2: Physical Stock Batches</div>
              <div>· Sheet 3: 12-Month Daily Consumption</div>
              <div>· Sheet 4: Procurement Purchase Orders</div>
              <div>· Sheet 5: Clinical Demand Records</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-blue-200/60 dark:border-blue-800/60">
            <button
              type="button"
              onClick={handleDownloadMasterExcel}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Master Excel Workbook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Granular Module Data Exports */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Module-Specific Analytic Schedules & Raw Ledgers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Schedule 1 */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Table className="w-4 h-4" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Shortage Risk & Reorder Schedule
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Contains daily consumption rates, safety stocks, lead time cover, and suggested replenishment purchase quantities.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadShortageReport('csv')}
                className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-center transition-colors cursor-pointer"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleDownloadShortageReport('xlsx')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded text-center border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
              >
                Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Schedule 2 */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Table className="w-4 h-4" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Expiry & FEFO Batch Ledger
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Detailed batch aging register, shelf-life days remaining, potential rupee write-offs, and prescribed FEFO actions.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadExpiryReport('csv')}
                className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-center transition-colors cursor-pointer"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleDownloadExpiryReport('xlsx')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded text-center border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
              >
                Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Schedule 3 */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Table className="w-4 h-4" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Excess Inventory & Dead Stock
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Inventory turnover ratios, trapped excess capital beyond 60-day buffers, and items with zero 90-day dispensations.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadExcessReport('csv')}
                className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-center transition-colors cursor-pointer"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleDownloadExcessReport('xlsx')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded text-center border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
              >
                Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
