import { jsPDF } from 'jspdf';
import { MedicineAnalytics, BatchExpiryDetail, CriticalAlert } from '../types/inventory';
import { OPERATIONAL_DATE } from './analyticsEngine';

export interface PDFReportData {
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
  criticalAlerts: CriticalAlert[];
  topDepleted: MedicineAnalytics[];
  topOverstocked: MedicineAnalytics[];
  nearExpiryBatches: BatchExpiryDetail[];
}

export function generateInventoryPDF(data: PDFReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Bar
  doc.setFillColor(15, 118, 110); // Teal 700
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Med', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Hospital & Pharmacy Medicine Inventory Audit Report', 14, 18);
  doc.text(`Generated: ${OPERATIONAL_DATE} | System Scope: OPD, ICU, Emergency, Central Pharmacy`, 14, 23);

  y = 38;

  // Executive KPI Summary Grid
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive KPI Summary', 14, y);
  y += 6;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  // Column 1
  doc.text('Total Medicines:', 20, y + 8);
  doc.text('Total Stock Valuation:', 20, y + 16);
  doc.text('Overall Order Fill Rate:', 20, y + 24);

  // Column 2
  doc.text('Stock-Out Incidents:', 110, y + 8);
  doc.text('High Depletion Risk:', 110, y + 16);
  doc.text('Potential Wastage Value:', 110, y + 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.kpis.totalMedicines}`, 65, y + 8);
  doc.text(`Rs. ${data.kpis.totalStockValue.toLocaleString('en-IN')}`, 65, y + 16);
  doc.text(`${data.kpis.overallFillRate}%`, 65, y + 24);

  doc.text(`${data.kpis.stockoutCount}`, 160, y + 8);
  doc.setTextColor(220, 38, 38);
  doc.text(`${data.kpis.highRiskCount} Critical`, 160, y + 16);
  doc.text(`Rs. ${data.kpis.potentialWastageValue.toLocaleString('en-IN')}`, 160, y + 24);

  y += 38;

  // 2. Urgent Critical Alerts
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. High Priority Action Items', 14, y);
  y += 6;

  data.criticalAlerts.slice(0, 4).forEach((alert, i) => {
    doc.setFillColor(alert.severity === 'critical' ? 254 : 255, alert.severity === 'critical' ? 242 : 251, alert.severity === 'critical' ? 242 : 235);
    doc.setDrawColor(alert.severity === 'critical' ? 254 : 253, alert.severity === 'critical' ? 202 : 230, alert.severity === 'critical' ? 202 : 138);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1, 1, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(alert.severity === 'critical' ? 185 : 180, alert.severity === 'critical' ? 28 : 83, alert.severity === 'critical' ? 28 : 9);
    doc.text(`[${alert.severity.toUpperCase()}] ${alert.title}`, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`${alert.description} -> Action: ${alert.actionText}`, 18, y + 9.5);

    y += 14;
  });

  y += 4;

  // 3. Top Depleted / Imminent Stockout Medicines
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Imminent Depletion & Replenishment Orders', 14, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Medicine', 18, y + 5);
  doc.text('Criticality', 75, y + 5);
  doc.text('Days of Cover', 105, y + 5);
  doc.text('Shortage Risk', 135, y + 5);
  doc.text('Suggested Order', 165, y + 5);
  y += 8;

  data.topDepleted.slice(0, 5).forEach(m => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(m.name.slice(0, 32), 18, y + 4);
    doc.text(m.criticality, 75, y + 4);
    doc.text(`${m.days_of_stock_cover}d`, 105, y + 4);
    doc.setTextColor(m.shortage_risk_level === 'High' ? 220 : 202, m.shortage_risk_level === 'High' ? 38 : 138, m.shortage_risk_level === 'High' ? 38 : 4);
    doc.text(`${m.shortage_risk_score} (${m.shortage_risk_level})`, 135, y + 4);
    doc.setTextColor(15, 118, 110);
    doc.setFont('helvetica', 'bold');
    doc.text(`${m.suggested_order_qty} units`, 165, y + 4);
    y += 6;
  });

  y += 6;

  // 4. Expiry & FEFO Risk Batches
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Batches Approaching Expiry (FEFO Watchlist)', 14, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Batch / Medicine', 18, y + 5);
  doc.text('Expiry Date', 80, y + 5);
  doc.text('Qty on Hand', 115, y + 5);
  doc.text('Wastage Value', 145, y + 5);
  doc.text('Action Needed', 170, y + 5);
  y += 8;

  data.nearExpiryBatches.slice(0, 5).forEach(b => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`${b.batch_no} - ${b.medicine_name.slice(0, 24)}`, 18, y + 4);
    doc.text(b.expiry_date, 80, y + 4);
    doc.text(`${b.quantity_on_hand}`, 115, y + 4);
    doc.setTextColor(220, 38, 38);
    doc.text(`Rs. ${b.potential_wastage_value.toLocaleString('en-IN')}`, 145, y + 4);
    doc.setTextColor(15, 23, 42);
    doc.text(b.suggested_action.slice(0, 18), 170, y + 4);
    y += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential - Smart Med Inventory Decision Support System', 14, 287);
  doc.text('Page 1 of 1', pageWidth - 30, 287);

  // Save PDF
  doc.save(`SmartMed_Inventory_Report_${OPERATIONAL_DATE}.pdf`);
}
