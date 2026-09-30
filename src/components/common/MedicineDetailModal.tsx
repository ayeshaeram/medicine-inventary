import React, { useState } from 'react';
import {
  X,
  Package,
  Layers,
  Clock,
  Truck,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import { MedicineAnalytics, BatchExpiryDetail } from '../../types/inventory';

interface MedicineDetailModalProps {
  medicine: MedicineAnalytics | null;
  batches: BatchExpiryDetail[];
  onClose: () => void;
  onOrderSimulated: (medId: string, qty: number) => void;
  onTransferSimulated: (medId: string, batchNo: string, toDept: string) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  batches,
  onClose,
  onOrderSimulated,
  onTransferSimulated
}) => {
  const [orderQty, setOrderQty] = useState<number>(medicine?.suggested_order_qty || 250);
  const [selectedDept, setSelectedDept] = useState<string>('ICU Satellite Cabinet');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!medicine) return null;

  const medBatches = batches.filter(b => b.medicine_id === medicine.medicine_id);

  const handleOrder = () => {
    onOrderSimulated(medicine.medicine_id, orderQty);
    setToastMessage(`Simulated purchase order of ${orderQty} units placed for ${medicine.name}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTransfer = (batchNo: string) => {
    onTransferSimulated(medicine.medicine_id, batchNo, selectedDept);
    setToastMessage(`Simulated transfer of batch #${batchNo} to ${selectedDept} logged.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const stockRatio = medicine.reorder_level > 0
    ? Math.min(100, Math.round((medicine.total_stock / medicine.reorder_level) * 100))
    : 100;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  {medicine.name}
                </h2>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    medicine.criticality === 'Vital'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : medicine.criticality === 'Essential'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {medicine.criticality}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {medicine.medicine_id} · {medicine.category} · Unit Cost: ₹{medicine.unit_cost}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Stock Level Progress */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5 font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                Stock On Hand ({medicine.total_stock.toLocaleString()} units) vs Reorder Level ({medicine.reorder_level.toLocaleString()} units)
              </span>
              <span className={`font-mono ${stockRatio < 50 ? 'text-rose-600' : 'text-teal-600'}`}>
                {stockRatio}% of ROP
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stockRatio < 50 ? 'bg-rose-500' : stockRatio < 80 ? 'bg-amber-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, stockRatio)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Days of Cover: <strong>{medicine.days_of_stock_cover}d</strong></span>
              <span>Lead Time: <strong>{medicine.lead_time_days}d</strong></span>
              <span>Daily Usage: <strong>{medicine.average_daily_consumption}/day</strong></span>
              <span>Safety Stock: <strong>{medicine.safety_stock} units</strong></span>
            </div>
          </div>

          {/* Active Batches */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px] mb-2">
              Physical Batch Lots ({medBatches.length} active lots on shelf)
            </h3>
            <div className="space-y-2">
              {medBatches.map(b => (
                <div
                  key={b.batch_no}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-850 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{b.batch_no}</span>
                      <span className="text-[10px] font-mono text-slate-400">({b.storage_location})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span>Qty: <strong className="text-slate-800 dark:text-slate-200">{b.quantity_on_hand}</strong></span>
                      <span className="mx-1">·</span>
                      <span>Expires: <strong className="font-mono">{b.expiry_date}</strong></span>
                      <span className="mx-1">·</span>
                      <span className={b.days_to_expiry <= 30 ? 'text-rose-600 font-bold' : ''}>
                        {b.days_to_expiry <= 0 ? 'Expired' : `${b.days_to_expiry} days left`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTransfer(b.batch_no)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Reorder Action */}
          <div className="p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800/60">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-teal-600" />
              <span>Simulate Immediate Purchase Order</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Dispatch simulated electronic purchase order to replenish stock above reorder point.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                step="50"
                value={orderQty}
                onChange={e => setOrderQty(Number(e.target.value))}
                className="w-32 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-slate-500">units</span>
              <button
                type="button"
                onClick={handleOrder}
                className="ml-auto px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors cursor-pointer"
              >
                Dispatch PO Order
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-slate-500">
          <span>Shortage Risk Score: <strong className="font-mono text-rose-600">{medicine.shortage_risk_score}/100</strong></span>
          <button onClick={onClose} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-semibold hover:bg-slate-300 transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
