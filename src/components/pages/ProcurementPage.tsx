import React, { useMemo, useState } from 'react';
import {
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { SupplierMetric, ProcurementRecord, MedicineAnalytics } from '../../types/inventory';
import { DataTable, Column } from '../common/DataTable';
import { MetricTooltip } from '../common/MetricTooltip';

interface ProcurementPageProps {
  supplierMetrics: SupplierMetric[];
  procurementRecords: ProcurementRecord[];
  medicineAnalytics: MedicineAnalytics[];
}

export const ProcurementPage: React.FC<ProcurementPageProps> = ({
  supplierMetrics,
  procurementRecords,
  medicineAnalytics
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  const medMap = useMemo(() => {
    return new Map(medicineAnalytics.map(m => [m.medicine_id, m]));
  }, [medicineAnalytics]);

  // Total procurement spend
  const totalProcurementSpend = useMemo(() => {
    return supplierMetrics.reduce((acc, s) => acc + s.total_spend, 0);
  }, [supplierMetrics]);

  // Overall on-time delivery %
  const overallOnTimePct = useMemo(() => {
    const totalOrders = supplierMetrics.reduce((acc, s) => acc + s.total_orders, 0);
    const onTimeOrders = supplierMetrics.reduce((acc, s) => acc + s.on_time_orders_count, 0);
    return totalOrders > 0 ? +((onTimeOrders / totalOrders) * 100).toFixed(1) : 100;
  }, [supplierMetrics]);

  // Average delay days
  const averageDelayDays = useMemo(() => {
    const totalOrders = supplierMetrics.reduce((acc, s) => acc + s.total_orders, 0);
    const sumDelay = supplierMetrics.reduce((acc, s) => acc + (s.avg_delivery_delay_days * s.total_orders), 0);
    return totalOrders > 0 ? +(sumDelay / totalOrders).toFixed(1) : 0;
  }, [supplierMetrics]);

  // Over-ordering and Under-ordering Detection
  // We compare the total quantity ordered over the period vs actual consumption
  const orderSizingAnomalies = useMemo(() => {
    const ordersByMed = new Map<string, number>();
    procurementRecords.forEach(po => {
      ordersByMed.set(po.medicine_id, (ordersByMed.get(po.medicine_id) || 0) + po.quantity_ordered);
    });

    const anomalies: Array<{
      medicine_id: string;
      medicine_name: string;
      category: string;
      totalOrdered: number;
      totalConsumed: number;
      variancePct: number;
      status: 'Over-Ordered' | 'Under-Ordered' | 'Balanced';
      riskImpact: string;
    }> = [];

    medicineAnalytics.forEach(m => {
      const ordered = ordersByMed.get(m.medicine_id) || 0;
      const consumed = m.total_consumed;
      if (consumed === 0 && ordered > 0) {
        anomalies.push({
          medicine_id: m.medicine_id,
          medicine_name: m.name,
          category: m.category,
          totalOrdered: ordered,
          totalConsumed: consumed,
          variancePct: 999,
          status: 'Over-Ordered',
          riskImpact: 'Dead stock creation: Purchased without corresponding clinical usage'
        });
      } else if (consumed > 0) {
        const ratio = ordered / consumed;
        if (ratio > 1.4) {
          anomalies.push({
            medicine_id: m.medicine_id,
            medicine_name: m.name,
            category: m.category,
            totalOrdered: ordered,
            totalConsumed: consumed,
            variancePct: +(((ordered - consumed) / consumed) * 100).toFixed(1),
            status: 'Over-Ordered',
            riskImpact: `Procurement exceeded clinical demand by +${Math.round((ratio - 1) * 100)}%`
          });
        } else if (ratio < 0.75) {
          anomalies.push({
            medicine_id: m.medicine_id,
            medicine_name: m.name,
            category: m.category,
            totalOrdered: ordered,
            totalConsumed: consumed,
            variancePct: +(((ordered - consumed) / consumed) * 100).toFixed(1),
            status: 'Under-Ordered',
            riskImpact: `Supply deficit: Ordered only ${Math.round(ratio * 100)}% of consumed rate`
          });
        }
      }
    });

    return anomalies.sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct));
  }, [procurementRecords, medicineAnalytics]);

  // Filtered Purchase Orders
  const filteredPO = useMemo(() => {
    return procurementRecords
      .filter(p => selectedSupplier === 'all' || p.supplier === selectedSupplier)
      .map(p => {
        const med = medMap.get(p.medicine_id);
        const orderDt = new Date(p.order_date).getTime();
        const delivDt = new Date(p.delivery_date).getTime();
        const actualLead = Math.max(0, Math.round((delivDt - orderDt) / 86400000));
        const promisedLead = med ? med.lead_time_days : 7;
        const delayDays = Math.max(0, actualLead - promisedLead);

        return {
          ...p,
          medicine_name: med ? med.name : p.medicine_id,
          promised_lead_time: promisedLead,
          actual_lead_time: actualLead,
          delay_days: delayDays,
          total_order_cost: +(p.quantity_ordered * p.unit_price).toFixed(2),
          delivery_status: delayDays === 0 ? 'On-Time' : `${delayDays}d Delayed`
        };
      });
  }, [procurementRecords, selectedSupplier, medMap]);

  // Supplier Scorecard Columns
  const supplierColumns: Column<SupplierMetric>[] = [
    { key: 'supplier', header: 'Supplier Name' },
    { key: 'total_orders', header: 'PO Count', align: 'right', render: (row) => `${row.total_orders} orders` },
    { key: 'total_units_ordered', header: 'Total Units', align: 'right', render: (row) => row.total_units_ordered.toLocaleString() },
    { key: 'total_spend', header: 'Total Spend (₹)', align: 'right', render: (row) => `₹${row.total_spend.toLocaleString('en-IN')}` },
    {
      key: 'on_time_delivery_pct',
      header: 'On-Time %',
      align: 'right',
      render: (row) => (
        <span className={`font-mono font-bold ${row.on_time_delivery_pct >= 90 ? 'text-emerald-600 dark:text-emerald-400' : row.on_time_delivery_pct >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {row.on_time_delivery_pct}%
        </span>
      )
    },
    {
      key: 'avg_delivery_delay_days',
      header: 'Avg Delay',
      align: 'right',
      render: (row) => `${row.avg_delivery_delay_days} days`
    },
    {
      key: 'reliability_status',
      header: 'Reliability Rating',
      align: 'center',
      render: (row) => {
        let color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
        if (row.reliability_status === 'Needs Review') color = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300';
        else if (row.reliability_status === 'Satisfactory') color = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';

        return (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${color}`}>
            {row.reliability_status}
          </span>
        );
      }
    }
  ];

  // Purchase Order Detail Columns
  const poColumns: Column<any>[] = [
    { key: 'order_id', header: 'PO Number', render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.order_id}</span> },
    { key: 'order_date', header: 'Order Date' },
    { key: 'delivery_date', header: 'Delivery Date' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'medicine_name', header: 'Medicine' },
    { key: 'quantity_ordered', header: 'Qty Ordered', align: 'right', render: (row) => `${row.quantity_ordered.toLocaleString()} units` },
    { key: 'unit_price', header: 'Unit Price', align: 'right', render: (row) => `₹${row.unit_price}` },
    { key: 'total_order_cost', header: 'Total Cost', align: 'right', render: (row) => `₹${row.total_order_cost.toLocaleString('en-IN')}` },
    {
      key: 'delivery_status',
      header: 'Delivery Status',
      align: 'center',
      render: (row) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${row.delay_days === 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
          {row.delivery_status}
        </span>
      )
    }
  ];

  // Anomalies Columns
  const anomalyColumns: Column<any>[] = [
    { key: 'medicine_name', header: 'Medicine Name' },
    { key: 'category', header: 'Category' },
    { key: 'totalOrdered', header: 'Total Ordered', align: 'right', render: (row) => `${row.totalOrdered.toLocaleString()} units` },
    { key: 'totalConsumed', header: 'Total Consumed', align: 'right', render: (row) => `${row.totalConsumed.toLocaleString()} units` },
    {
      key: 'status',
      header: 'Anomaly Type',
      align: 'center',
      render: (row) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${row.status === 'Over-Ordered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
          {row.status}
        </span>
      )
    },
    { key: 'riskImpact', header: 'Clinical / Capital Impact' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Module 5: Procurement & Vendor Performance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Supplier delivery delay audits, SLA compliance monitoring, order frequency alignment, and over/under-ordering risk detection.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Procurement Spend</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1 tabular-nums">
            ₹{totalProcurementSpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">12-month fulfilled purchase orders</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">On-Time Fulfillment Rate</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 tabular-nums">
            {overallOnTimePct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Orders delivered within contract lead time</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Delivery Delay</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 tabular-nums">
            {averageDelayDays} Days
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Average lag past promised dispatch date</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ordering Mismatches</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 tabular-nums">
            {orderSizingAnomalies.length} SKUs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Over-ordered or under-supplied vs usage</div>
        </div>
      </div>

      {/* Supplier Scorecards Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Supplier SLA & Performance Scorecard
            </h2>
            <p className="text-[11px] text-slate-500">
              Comparative analysis of delivery reliability, on-time percentage, and average transit delay
            </p>
          </div>
          <MetricTooltip
            title="Supplier Performance Metrics"
            formula="On-Time % = (On_Time_Orders / Total_Orders) * 100 | Delivery Delay = max(0, Actual_Delivery_Days - Contracted_Lead_Time)"
            clinicalSignificance="Unreliable suppliers directly jeopardize ICU and Emergency stockout buffers."
          />
        </div>

        <DataTable
          data={supplierMetrics}
          columns={supplierColumns}
          searchPlaceholder="Search supplier name..."
          exportFilename="supplier_sla_scorecards"
        />
      </div>

      {/* Over-Ordering and Under-Ordering Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
          Ordering Sizing Anomalies (Over-Ordering vs. Under-Ordering)
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Medicines where total procurement quantities significantly diverged from actual consumption velocity
        </p>

        <DataTable
          data={orderSizingAnomalies}
          columns={anomalyColumns}
          searchPlaceholder="Search order anomalies..."
          exportFilename="procurement_sizing_anomalies"
        />
      </div>

      {/* Detailed Purchase Orders Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Purchase Order Fulfillment Log
            </h2>
            <p className="text-[11px] text-slate-500">
              Individual procurement shipments with order date, delivery date, unit costs, and transit delay
            </p>
          </div>

          <select
            value={selectedSupplier}
            onChange={e => setSelectedSupplier(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Suppliers ({procurementRecords.length} POs)</option>
            {supplierMetrics.map(s => (
              <option key={s.supplier} value={s.supplier}>{s.supplier}</option>
            ))}
          </select>
        </div>

        <DataTable
          data={filteredPO}
          columns={poColumns}
          searchPlaceholder="Search PO #, medicine, supplier..."
          exportFilename="purchase_order_fulfillment_log"
        />
      </div>
    </div>
  );
};
