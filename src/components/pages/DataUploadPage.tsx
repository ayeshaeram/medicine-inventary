import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { RawDataset, DataQualityReport } from '../../types/inventory';
import {
  parseSpreadsheetFile,
  parseWorkbookMaster,
  cleanAndValidateDataset,
  CSV_TEMPLATES,
  exportToCSV,
  exportToExcel,
  downloadExcelTemplate,
  downloadMasterExcelTemplate
} from '../../utils/csvParser';
import { generateRealisticSampleData } from '../../data/sampleGenerator';

import { PageId } from '../layout/Sidebar';

interface DataUploadPageProps {
  rawDataset: RawDataset;
  qualityReport: DataQualityReport;
  onDatasetUpdate: (newDataset: RawDataset, newReport: DataQualityReport) => void;
  onNavigate?: (page: PageId) => void;
}

type TableKey = 'medicines' | 'stock' | 'consumption' | 'procurement' | 'demand';

export const DataUploadPage: React.FC<DataUploadPageProps> = ({
  rawDataset,
  qualityReport,
  onDatasetUpdate,
  onNavigate
}) => {
  const [activeUploadStatus, setActiveUploadStatus] = useState<Record<TableKey, string | null>>({
    medicines: null,
    stock: null,
    consumption: null,
    procurement: null,
    demand: null
  });
  const [masterUploadStatus, setMasterUploadStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // File upload handler for single table (CSV or Excel .xlsx/.xls)
  const handleFileUpload = async (tableKey: TableKey, file: File) => {
    setActiveUploadStatus(prev => ({ ...prev, [tableKey]: 'Parsing spreadsheet...' }));
    try {
      const rows = await parseSpreadsheetFile(file);
      if (rows.length === 0) {
        setActiveUploadStatus(prev => ({
          ...prev,
          [tableKey]: 'Error: Empty file or no data rows detected.'
        }));
        return;
      }

      // Merge with existing raw dataset
      const updatedRaw: RawDataset = {
        ...rawDataset,
        [tableKey]: rows as any
      };

      const { cleaned, report } = cleanAndValidateDataset(updatedRaw, qualityReport);
      onDatasetUpdate(cleaned, report);

      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      setActiveUploadStatus(prev => ({
        ...prev,
        [tableKey]: `Successfully parsed & validated ${rows.length} ${isExcel ? 'Excel (.xlsx/.xls)' : 'CSV'} records.`
      }));
      setFeedbackMessage(`Uploaded ${tableKey} from ${file.name} (${rows.length} rows): validated and merged.`);
    } catch (err: any) {
      setActiveUploadStatus(prev => ({
        ...prev,
        [tableKey]: `Parsing failed: ${err?.message || 'Check column headers.'}`
      }));
    }
  };

  // Master Excel Workbook Upload (Multi-sheet)
  const handleMasterWorkbookUpload = async (file: File) => {
    setMasterUploadStatus('Reading Excel workbook sheets...');
    try {
      const { data, sheetsFound } = await parseWorkbookMaster(file);

      if (Object.keys(data).length === 0) {
        setMasterUploadStatus(
          'Error: No recognized sheets found. Expected sheet names like "Medicines", "Stock", "Consumption", "Procurement", "Demand".'
        );
        return;
      }

      const updatedRaw: RawDataset = {
        ...rawDataset,
        ...data
      };

      const { cleaned, report } = cleanAndValidateDataset(updatedRaw);
      onDatasetUpdate(cleaned, report);

      setMasterUploadStatus(
        `Master Import Successful! Reconciled ${sheetsFound.length} sheets: ${sheetsFound.join(' · ')}`
      );
      setFeedbackMessage(`Loaded master Excel workbook "${file.name}" with ${sheetsFound.length} validated sheets.`);
    } catch (err: any) {
      setMasterUploadStatus(`Master workbook import failed: ${err?.message || 'Could not parse workbook.'}`);
    }
  };

  // Reload standard sample dataset
  const handleLoadSample = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sample = generateRealisticSampleData();
      const { cleaned, report } = cleanAndValidateDataset(sample);
      onDatasetUpdate(cleaned, report);
      setIsProcessing(false);
      setFeedbackMessage('Loaded pristine realistic 12-month sample dataset with 60 medicines & 4 departments.');
    }, 200);
  };

  // Download single table CSV template
  const handleDownloadCSVTemplate = (tableKey: TableKey) => {
    const templateContent = CSV_TEMPLATES[tableKey];
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meditrack_template_${tableKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download single table Excel template
  const handleDownloadExcelTemplate = (tableKey: TableKey) => {
    downloadExcelTemplate(tableKey);
  };

  // Download All-in-One Master Excel Template
  const handleDownloadMasterTemplate = () => {
    downloadMasterExcelTemplate();
  };

  const tables: Array<{
    key: TableKey;
    title: string;
    description: string;
    columns: string;
    rowCount: number;
  }> = [
    {
      key: 'medicines',
      title: 'Medicines Catalog',
      description: 'Master list of pharmaceutical SKUs, unit costs, reorder points, lead times, and criticality.',
      columns: 'medicine_id, name, category, unit_cost, reorder_level, lead_time_days, criticality',
      rowCount: rawDataset.medicines.length
    },
    {
      key: 'stock',
      title: 'Physical Stock Batches',
      description: 'On-hand quantities, batch lot numbers, storage locations, manufacture and expiration dates.',
      columns: 'medicine_id, batch_no, quantity_on_hand, manufacture_date, expiry_date, storage_location',
      rowCount: rawDataset.stock.length
    },
    {
      key: 'consumption',
      title: 'Historical Consumption Records',
      description: 'Daily usage logs across OPD, ICU, Emergency, and Pharmacy dispensaries.',
      columns: 'date, medicine_id, quantity_used, department',
      rowCount: rawDataset.consumption.length
    },
    {
      key: 'procurement',
      title: 'Procurement Purchase Orders',
      description: 'Purchase orders, delivery dates, suppliers, contracted unit pricing, and quantity ordered.',
      columns: 'order_id, order_date, medicine_id, quantity_ordered, supplier, delivery_date, unit_price',
      rowCount: rawDataset.procurement.length
    },
    {
      key: 'demand',
      title: 'Prescription & Ward Demand Records',
      description: 'Prescription orders and departmental demand requests (used to compute unmet demand & fill rate).',
      columns: 'date, medicine_id, quantity_requested, department',
      rowCount: rawDataset.demand.length
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Data Upload, Ingestion & Quality Validation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest hospital, clinic, or pharmacy records (CSV or Excel .xlsx/.xls) with automated deduplication and quality validation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Analyze in Overview & Analytics</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleLoadSample}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Reset 12-Mo Baseline</span>
          </button>
        </div>
      </div>

      {/* 4-Step Quick Navigation Banner */}
      {onNavigate && (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800">
            <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 uppercase block">Step 1 (Current)</span>
            <span className="font-bold text-teal-900 dark:text-teal-200">Upload Data</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Step 2</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Overview & Analytics →</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('recommendations')}
            className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Step 3</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Smart Recommendations →</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Step 4</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Download Reports →</span>
          </button>
        </div>
      )}

      {feedbackMessage && (
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-md text-xs text-teal-800 dark:text-teal-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-xs cursor-pointer"
              >
                Analyze Data in Overview →
              </button>
            )}
            <button onClick={() => setFeedbackMessage(null)} className="text-teal-600 font-bold hover:underline cursor-pointer text-xs">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Data Quality Report Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Automated Data Quality & Sanitization Report
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Audited: {new Date(qualityReport.timestamp).toLocaleString()}
          </span>
        </div>

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Total Rows Loaded</span>
            <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {qualityReport.totalRowsLoaded.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Valid Active Rows</span>
            <div className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
              {qualityReport.totalRowsCleaned.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Duplicates Removed</span>
            <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {qualityReport.issueTypes.duplicatesRemoved}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Dates Standardized</span>
            <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
              {qualityReport.issueTypes.dateFormatFixed}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-medium">Negative Qty Rectified</span>
            <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
              {qualityReport.issueTypes.negativeQtyCorrected}
            </div>
          </div>
        </div>

        {/* Table Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
          {Object.entries(qualityReport.tableBreakdown).map(([table, stats]) => (
            <div key={table} className="p-2.5 rounded border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
              <div className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{table}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Loaded: <strong className="font-mono text-slate-700 dark:text-slate-300">{stats.loaded}</strong></span>
              </div>
              <div className="text-[11px] text-slate-500">
                <span>Issues Cleaned: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{stats.issues}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All-in-One Master Excel Workbook Ingestion */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-950/30 border border-teal-200 dark:border-teal-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-teal-600 text-white">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                All-in-One Master Excel Workbook Import (.xlsx / .xls)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                Multi-Sheet Auto-Match
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Upload a single multi-sheet Excel file containing tabs for <strong>Medicines</strong>, <strong>Stock Batches</strong>, <strong>Consumption</strong>, <strong>Procurement</strong>, and <strong>Demand</strong>. The engine automatically matches sheets and executes audit validation across all five tables simultaneously.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadMasterTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 dark:text-teal-200 bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700/80 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Download Master Excel Template (.xlsx)</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer">
              <UploadCloud className="w-4 h-4" />
              <span>Upload Master Workbook</span>
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleMasterWorkbookUpload(file);
                }}
              />
            </label>
          </div>
        </div>

        {masterUploadStatus && (
          <div className="mt-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-md border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-800 dark:text-teal-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{masterUploadStatus}</span>
          </div>
        )}
      </div>

      {/* Core Inventory Tables Upload & Schema Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Individual Table Uploads & Templates (CSV or Excel)
          </h2>
          <span className="text-[11px] text-slate-500">
            Accepts <code className="font-mono text-teal-600 dark:text-teal-400">.csv</code>, <code className="font-mono text-emerald-600 dark:text-emerald-400">.xlsx</code>, and <code className="font-mono text-cyan-600 dark:text-cyan-400">.xls</code>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {tables.map(tbl => (
            <div
              key={tbl.key}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{tbl.title}</h3>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {tbl.rowCount.toLocaleString()} rows
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tbl.description}</p>

                <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/70 p-1.5 rounded border border-slate-200 dark:border-slate-700/60 break-all">
                  {tbl.columns}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadCSVTemplate(tbl.key)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                    title="Download format template as CSV"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>CSV</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadExcelTemplate(tbl.key)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 cursor-pointer font-medium"
                    title="Download format template as Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>Excel (.xlsx)</span>
                  </button>
                </div>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Upload CSV / Excel</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(tbl.key, file);
                    }}
                  />
                </label>
              </div>

              {activeUploadStatus[tbl.key] && (
                <div className="mt-2 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  {activeUploadStatus[tbl.key]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
