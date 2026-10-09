import * as XLSX from 'xlsx';
import {
  Medicine,
  StockBatch,
  ConsumptionRecord,
  ProcurementRecord,
  DemandRecord,
  RawDataset,
  DataQualityReport,
  CleaningLogEntry
} from '../types/inventory';

// Parse raw CSV string to rows of objects
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle comma inside quotes if any
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const values: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null && values.length < headers.length) {
      let val = match[1] ?? '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      values.push(val.trim());
      if (regex.lastIndex >= line.length) break;
    }

    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? '';
      });
      rows.push(row);
    }
  }

  return rows;
}

// Normalize various date formats to YYYY-MM-DD
export function normalizeDate(dateStr: string, defaultDate = '2026-09-29'): { normalized: string; altered: boolean } {
  if (!dateStr || dateStr.trim() === '') {
    return { normalized: defaultDate, altered: true };
  }

  const clean = dateStr.trim();
  // Check if standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return { normalized: clean, altered: false };
  }

  // Handle DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  const parts = clean.split(/[-/.]/);
  if (parts.length === 3) {
    let year = parts[2];
    let month = parts[1];
    let day = parts[0];

    // If first part is 4 digits
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else if (parts[2].length === 2) {
      year = '20' + parts[2];
    }

    month = month.padStart(2, '0');
    day = day.padStart(2, '0');

    const reconstructed = `${year}-${month}-${day}`;
    const testDate = new Date(reconstructed);
    if (!isNaN(testDate.getTime())) {
      return { normalized: reconstructed, altered: true };
    }
  }

  // Try standard Date parse
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return { normalized: parsed.toISOString().split('T')[0], altered: true };
  }

  return { normalized: defaultDate, altered: true };
}

// Clean and Validate Entire Dataset
export function cleanAndValidateDataset(
  raw: Partial<RawDataset>,
  existingQuality?: DataQualityReport
): { cleaned: RawDataset; report: DataQualityReport } {
  const logs: CleaningLogEntry[] = [];
  const issueCounts = {
    missingValues: 0,
    duplicatesRemoved: 0,
    dateFormatFixed: 0,
    negativeQtyCorrected: 0,
    orphanedReferences: 0
  };

  // 1. Clean Medicines
  const medicinesMap = new Map<string, Medicine>();
  const rawMeds = raw.medicines || [];
  let medIssues = 0;

  rawMeds.forEach((row, idx) => {
    let id = (row.medicine_id || '').trim();
    if (!id) {
      id = `MED-AUTO-${idx + 1}`;
      issueCounts.missingValues++;
      medIssues++;
      logs.push({
        table: 'Medicines',
        rowNumber: idx + 1,
        field: 'medicine_id',
        issue: 'Empty medicine_id',
        actionTaken: `Assigned generated ID ${id}`
      });
    }

    if (medicinesMap.has(id)) {
      issueCounts.duplicatesRemoved++;
      medIssues++;
      logs.push({
        table: 'Medicines',
        rowNumber: idx + 1,
        field: 'medicine_id',
        issue: `Duplicate medicine_id '${id}'`,
        actionTaken: 'Overwritten with newest record'
      });
    }

    const name = (row.name || `Medicine ${id}`).trim();
    const category = (row.category || 'General').trim();
    let unit_cost = Number(row.unit_cost);
    if (isNaN(unit_cost) || unit_cost <= 0) {
      unit_cost = 10.0;
      issueCounts.missingValues++;
      medIssues++;
      logs.push({
        table: 'Medicines',
        rowNumber: idx + 1,
        field: 'unit_cost',
        issue: 'Invalid or zero unit cost',
        actionTaken: 'Defaulted to 10.0'
      });
    }

    let reorder_level = Math.round(Number(row.reorder_level));
    if (isNaN(reorder_level) || reorder_level < 0) {
      reorder_level = 100;
      issueCounts.missingValues++;
      medIssues++;
    }

    let lead_time_days = Math.round(Number(row.lead_time_days));
    if (isNaN(lead_time_days) || lead_time_days <= 0) {
      lead_time_days = 7;
      issueCounts.missingValues++;
      medIssues++;
    }

    const critRaw = (row.criticality || '').trim();
    const criticality = (critRaw === 'Vital' || critRaw === 'Essential' || critRaw === 'Desirable')
      ? critRaw
      : 'Essential';

    medicinesMap.set(id, {
      medicine_id: id,
      name,
      category,
      unit_cost,
      reorder_level,
      lead_time_days,
      criticality
    });
  });

  const cleanedMedicines = Array.from(medicinesMap.values());
  const validMedicineIds = new Set(cleanedMedicines.map(m => m.medicine_id));

  // 2. Clean Stock Batches
  const cleanedStock: StockBatch[] = [];
  const batchKeys = new Set<string>();
  const rawStock = raw.stock || [];
  let stockIssues = 0;

  rawStock.forEach((s, idx) => {
    const medId = (s.medicine_id || '').trim();
    if (!validMedicineIds.has(medId)) {
      issueCounts.orphanedReferences++;
      stockIssues++;
      logs.push({
        table: 'Stock',
        rowNumber: idx + 1,
        field: 'medicine_id',
        issue: `Orphaned medicine_id '${medId}' not found in Medicines table`,
        actionTaken: 'Skipped batch record'
      });
      return;
    }

    let batchNo = (s.batch_no || '').trim();
    if (!batchNo) {
      batchNo = `BAT-${idx + 1000}`;
      issueCounts.missingValues++;
      stockIssues++;
    }

    const uniqueKey = `${medId}_${batchNo}`;
    if (batchKeys.has(uniqueKey)) {
      issueCounts.duplicatesRemoved++;
      stockIssues++;
      return;
    }
    batchKeys.add(uniqueKey);

    let qty = Number(s.quantity_on_hand);
    if (isNaN(qty)) {
      qty = 0;
      issueCounts.missingValues++;
      stockIssues++;
    } else if (qty < 0) {
      qty = Math.abs(qty);
      issueCounts.negativeQtyCorrected++;
      stockIssues++;
      logs.push({
        table: 'Stock',
        rowNumber: idx + 1,
        field: 'quantity_on_hand',
        issue: `Negative quantity (${s.quantity_on_hand}) encountered`,
        actionTaken: `Converted to positive (${qty})`
      });
    }

    const mfg = normalizeDate(s.manufacture_date, '2025-01-01');
    if (mfg.altered) {
      issueCounts.dateFormatFixed++;
      stockIssues++;
    }

    const exp = normalizeDate(s.expiry_date, '2027-01-01');
    if (exp.altered) {
      issueCounts.dateFormatFixed++;
      stockIssues++;
    }

    cleanedStock.push({
      medicine_id: medId,
      batch_no: batchNo,
      quantity_on_hand: qty,
      manufacture_date: mfg.normalized,
      expiry_date: exp.normalized,
      storage_location: s.storage_location || 'Central Pharmacy Shelf A'
    });
  });

  // 3. Clean Consumption Records
  const cleanedConsumption: ConsumptionRecord[] = [];
  const rawConsumption = raw.consumption || [];
  let consumptionIssues = 0;

  rawConsumption.forEach((c, idx) => {
    const medId = (c.medicine_id || '').trim();
    if (!validMedicineIds.has(medId)) {
      issueCounts.orphanedReferences++;
      consumptionIssues++;
      return;
    }

    let qty = Number(c.quantity_used);
    if (isNaN(qty) || qty <= 0) {
      if (qty < 0) {
        qty = Math.abs(qty);
        issueCounts.negativeQtyCorrected++;
        consumptionIssues++;
      } else {
        return; // Drop 0 consumption rows to save memory
      }
    }

    const dt = normalizeDate(c.date);
    if (dt.altered) {
      issueCounts.dateFormatFixed++;
      consumptionIssues++;
    }

    cleanedConsumption.push({
      date: dt.normalized,
      medicine_id: medId,
      quantity_used: qty,
      department: c.department || 'Pharmacy'
    });
  });

  // 4. Clean Procurement Records
  const cleanedProcurement: ProcurementRecord[] = [];
  const poIds = new Set<string>();
  const rawProcurement = raw.procurement || [];
  let procIssues = 0;

  rawProcurement.forEach((p, idx) => {
    const medId = (p.medicine_id || '').trim();
    if (!validMedicineIds.has(medId)) {
      issueCounts.orphanedReferences++;
      procIssues++;
      return;
    }

    let orderId = (p.order_id || '').trim();
    if (!orderId || poIds.has(orderId)) {
      orderId = `PO-GEN-${idx + 1000}`;
      if (poIds.has(p.order_id)) issueCounts.duplicatesRemoved++;
      else issueCounts.missingValues++;
      procIssues++;
    }
    poIds.add(orderId);

    let qty = Number(p.quantity_ordered);
    if (isNaN(qty) || qty <= 0) {
      qty = Math.abs(qty) || 50;
      issueCounts.negativeQtyCorrected++;
      procIssues++;
    }

    const orderDt = normalizeDate(p.order_date);
    const delivDt = normalizeDate(p.delivery_date, orderDt.normalized);

    let unitPrice = Number(p.unit_price);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      const med = medicinesMap.get(medId);
      unitPrice = med ? med.unit_cost : 10;
      issueCounts.missingValues++;
      procIssues++;
    }

    cleanedProcurement.push({
      order_id: orderId,
      order_date: orderDt.normalized,
      medicine_id: medId,
      quantity_ordered: qty,
      supplier: (p.supplier || 'Standard Supplier').trim(),
      delivery_date: delivDt.normalized,
      unit_price: unitPrice
    });
  });

  // 5. Clean Demand Records
  const cleanedDemand: DemandRecord[] = [];
  const rawDemand = raw.demand || [];
  let demandIssues = 0;

  rawDemand.forEach((d, idx) => {
    const medId = (d.medicine_id || '').trim();
    if (!validMedicineIds.has(medId)) {
      issueCounts.orphanedReferences++;
      demandIssues++;
      return;
    }

    let qty = Number(d.quantity_requested);
    if (isNaN(qty) || qty <= 0) {
      if (qty < 0) {
        qty = Math.abs(qty);
        issueCounts.negativeQtyCorrected++;
        demandIssues++;
      } else {
        return;
      }
    }

    const dt = normalizeDate(d.date);
    if (dt.altered) {
      issueCounts.dateFormatFixed++;
      demandIssues++;
    }

    cleanedDemand.push({
      date: dt.normalized,
      medicine_id: medId,
      quantity_requested: qty,
      department: d.department || 'Pharmacy'
    });
  });

  const totalLoaded = rawMeds.length + rawStock.length + rawConsumption.length + rawProcurement.length + rawDemand.length;
  const totalCleaned = cleanedMedicines.length + cleanedStock.length + cleanedConsumption.length + cleanedProcurement.length + cleanedDemand.length;

  const report: DataQualityReport = {
    timestamp: new Date().toISOString(),
    totalRowsLoaded: totalLoaded,
    totalRowsCleaned: totalCleaned,
    tableBreakdown: {
      medicines: { loaded: rawMeds.length, cleaned: cleanedMedicines.length, issues: medIssues },
      stock: { loaded: rawStock.length, cleaned: cleanedStock.length, issues: stockIssues },
      consumption: { loaded: rawConsumption.length, cleaned: cleanedConsumption.length, issues: consumptionIssues },
      procurement: { loaded: rawProcurement.length, cleaned: cleanedProcurement.length, issues: procIssues },
      demand: { loaded: rawDemand.length, cleaned: cleanedDemand.length, issues: demandIssues }
    },
    issueTypes: issueCounts,
    recentLogs: logs.slice(0, 50)
  };

  return {
    cleaned: {
      medicines: cleanedMedicines,
      stock: cleanedStock,
      consumption: cleanedConsumption,
      procurement: cleanedProcurement,
      demand: cleanedDemand
    },
    report
  };
}

// Download table as CSV helper
export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Sample CSV Templates
export const CSV_TEMPLATES = {
  medicines: 'medicine_id,name,category,unit_cost,reorder_level,lead_time_days,criticality\nMED-001,Amoxicillin 500mg,Antibiotics,14.5,600,7,Vital\nMED-002,Paracetamol 650mg,Analgesics,3.2,1200,4,Essential',
  stock: 'medicine_id,batch_no,quantity_on_hand,manufacture_date,expiry_date,storage_location\nMED-001,BAT-AB-101,450,2025-01-15,2027-01-15,Warehouse Rack A-1\nMED-002,BAT-AN-202,1500,2025-03-01,2026-11-20,Pharmacy Shelf B-2',
  consumption: 'date,medicine_id,quantity_used,department\n2026-09-28,MED-001,45,ICU\n2026-09-28,MED-002,120,OPD',
  procurement: 'order_id,order_date,medicine_id,quantity_ordered,supplier,delivery_date,unit_price\nPO-1001,2026-08-10,MED-001,1000,Apex BioPharma,2026-08-17,14.2\nPO-1002,2026-08-15,MED-002,3000,MedSupply Global,2026-08-19,3.1',
  demand: 'date,medicine_id,quantity_requested,department\n2026-09-28,MED-001,50,ICU\n2026-09-28,MED-002,120,OPD'
};

// Universal file parser: parses CSV or Excel (.xlsx, .xls) to string records
export async function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';

  if (isExcel) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { raw: false, defval: '' });
    return rawRows.map(row => {
      const stringified: Record<string, string> = {};
      Object.entries(row).forEach(([k, v]) => {
        stringified[k.trim()] = String(v ?? '').trim();
      });
      return stringified;
    });
  } else {
    // CSV / TSV text file
    const text = await file.text();
    return parseCSV(text);
  }
}

// Parse multi-sheet master Excel file containing up to all 5 tables in separate sheets
export async function parseWorkbookMaster(file: File): Promise<{
  data: Partial<RawDataset>;
  sheetsFound: string[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const result: Partial<RawDataset> = {};
  const sheetsFound: string[] = [];

  const normalizeSheetName = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');

  workbook.SheetNames.forEach(sheetName => {
    const cleanName = normalizeSheetName(sheetName);
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { raw: false, defval: '' });
    const rows = rawRows.map(row => {
      const stringified: Record<string, string> = {};
      Object.entries(row).forEach(([k, v]) => {
        stringified[k.trim()] = String(v ?? '').trim();
      });
      return stringified;
    });

    if (cleanName.includes('medicine') || cleanName.includes('catalog') || cleanName === 'meds') {
      result.medicines = rows as any;
      sheetsFound.push(`${sheetName} → Medicines (${rows.length} rows)`);
    } else if (cleanName.includes('stock') || cleanName.includes('batch') || cleanName.includes('lot')) {
      result.stock = rows as any;
      sheetsFound.push(`${sheetName} → Stock Batches (${rows.length} rows)`);
    } else if (cleanName.includes('consum') || cleanName.includes('usage') || cleanName.includes('dispens')) {
      result.consumption = rows as any;
      sheetsFound.push(`${sheetName} → Consumption (${rows.length} rows)`);
    } else if (cleanName.includes('procur') || cleanName.includes('order') || cleanName.includes('purchase') || cleanName.includes('po')) {
      result.procurement = rows as any;
      sheetsFound.push(`${sheetName} → Procurement (${rows.length} rows)`);
    } else if (cleanName.includes('demand') || cleanName.includes('request') || cleanName.includes('prescript')) {
      result.demand = rows as any;
      sheetsFound.push(`${sheetName} → Demand (${rows.length} rows)`);
    }
  });

  return { data: result, sheetsFound };
}

// Export dataset array to real Excel (.xlsx) file
export function exportToExcel<T extends Record<string, any>>(data: T[], filename: string, sheetName = 'Sheet1') {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Download Master Excel Template (.xlsx) with all 5 tabs pre-created
export function downloadMasterExcelTemplate() {
  const workbook = XLSX.utils.book_new();

  const templateMap: Record<string, string> = {
    Medicines: CSV_TEMPLATES.medicines,
    Stock_Batches: CSV_TEMPLATES.stock,
    Consumption: CSV_TEMPLATES.consumption,
    Procurement: CSV_TEMPLATES.procurement,
    Demand: CSV_TEMPLATES.demand
  };

  Object.entries(templateMap).forEach(([tabName, csvString]) => {
    const rows = parseCSV(csvString);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, tabName);
  });

  XLSX.writeFile(workbook, 'SmartMed_Master_Inventory_Template.xlsx');
}

// Download single table template as Excel (.xlsx)
export function downloadExcelTemplate(tableKey: keyof typeof CSV_TEMPLATES) {
  const csvString = CSV_TEMPLATES[tableKey];
  const rows = parseCSV(csvString);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  const title = tableKey.charAt(0).toUpperCase() + tableKey.slice(1);
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  XLSX.writeFile(workbook, `smartmed_template_${tableKey}.xlsx`);
}
