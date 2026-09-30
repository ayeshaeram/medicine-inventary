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
  Database
} from 'lucide-react';
import { RawDataset, DataQualityReport } from '../../types/inventory';
import { parseCSV, cleanAndValidateDataset, CSV_TEMPLATES, exportToCSV } from '../../utils/csvParser';
import { generateRealisticSampleData } from '../../data/sampleGenerator';

interface DataUploadPageProps {
  rawDataset: RawDataset;
  qualityReport: DataQualityReport;
  onDatasetUpdate: (newDataset: RawDataset, newReport: DataQualityReport) => void;
}

type TableKey = 'medicines' | 'stock' | 'consumption' | 'procurement' | 'demand';

export const DataUploadPage: React.FC<DataUploadPageProps> = ({
  rawDataset,
  qualityReport,
  onDatasetUpdate
}) => {
  const [activeUploadStatus, setActiveUploadStatus] = useState<Record<TableKey, string | null>>({
    medicines: null,
    stock: null,
    consumption: null,
    procurement: null,
    demand: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = (tableKey: TableKey, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setActiveUploadStatus(prev => ({ ...prev, [tableKey]: 'Error: Empty file or invalid CSV headers.' }));
          return;
        }

        // Merge with existing raw dataset
        const updatedRaw: RawDataset = {
          ...rawDataset,
          [tableKey]: rows as any
        };

        const { cleaned, report } = cleanAndValidateDataset(updatedRaw, qualityReport);
        onDatasetUpdate(cleaned, report);

        setActiveUploadStatus(prev => ({
          ...prev,
          [tableKey]: `Successfully parsed & validated ${rows.length} records.`
        }));
        setFeedbackMessage(`Uploaded ${tableKey} table: validated and merged.`);
      } catch (err: any) {
        setActiveUploadStatus(prev => ({
          ...prev,
          [tableKey]: `Parsing failed: ${err?.message || 'Check CSV column formats.'}`
        }));
      }
    };
    reader.readAsText(file);
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

  // Download template
  const handleDownloadTemplate = (tableKey: TableKey) => {
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
            Ingest hospital CSV records with automated deduplication, date normalization, negative quantity correction, and quality reporting.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Generate / Reset Realistic Sample Dataset</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-md text-xs text-teal-800 dark:text-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-teal-600 font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
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

      {/* CSV Ingestion Cards for 5 Tables */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          5 Core Inventory Tables Upload & Schema Templates
        </h2>

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
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(tbl.key)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
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
