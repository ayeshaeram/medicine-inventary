import React, { useMemo, useState } from 'react';
import {
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Undo2,
  Gift,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { BatchExpiryDetail, ExpiryBucket } from '../../types/inventory';
import { DataTable, Column } from '../common/DataTable';
import { MetricTooltip } from '../common/MetricTooltip';

interface ExpiryWastagePageProps {
  batchExpiryDetails: BatchExpiryDetail[];
  totalStockValue: number;
}

export const ExpiryWastagePage: React.FC<ExpiryWastagePageProps> = ({
  batchExpiryDetails,
  totalStockValue
}) => {
  const [bucketFilter, setBucketFilter] = useState<'all' | ExpiryBucket>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Filter batches
  const filteredBatches = useMemo(() => {
    return batchExpiryDetails.filter(b => {
      if (bucketFilter !== 'all' && b.expiry_bucket !== bucketFilter) return false;
      if (actionFilter !== 'all' && b.suggested_action !== actionFilter) return false;
      return true;
    });
  }, [batchExpiryDetails, bucketFilter, actionFilter]);

  // Aggregate Metrics
  const expiredBatches = useMemo(() => batchExpiryDetails.filter(b => b.days_to_expiry < 0), [batchExpiryDetails]);
  const expiring30dBatches = useMemo(() => batchExpiryDetails.filter(b => b.days_to_expiry >= 0 && b.days_to_expiry <= 30), [batchExpiryDetails]);
  const vulnerableBatches = useMemo(() => batchExpiryDetails.filter(b => b.is_fefo_vulnerable), [batchExpiryDetails]);
  
  const totalWastageValue = useMemo(() => {
    return batchExpiryDetails.reduce((acc, b) => acc + b.potential_wastage_value, 0);
  }, [batchExpiryDetails]);

  const wastagePercentage = totalStockValue > 0 ? +((totalWastageValue / totalStockValue) * 100).toFixed(1) : 0;

  // Category-wise Wastage Breakdown
  const categoryWastageData = useMemo(() => {
    const catMap = new Map<string, number>();
    batchExpiryDetails.forEach(b => {
      catMap.set(b.category, (catMap.get(b.category) || 0) + b.potential_wastage_value);
    });

    return Array.from(catMap.entries())
      .filter(([_, val]) => val > 0)
      .map(([category, value]) => ({
        category,
        wastageValue: Math.round(value)
      }))
      .sort((a, b) => b.wastageValue - a.wastageValue);
  }, [batchExpiryDetails]);

  // Expiry Timeline Buckets
  const expiryTimelineData = useMemo(() => {
    const buckets: Record<ExpiryBucket, { count: number; value: number }> = {
      'Expired': { count: 0, value: 0 },
      '0-30 days': { count: 0, value: 0 },
      '31-60 days': { count: 0, value: 0 },
      '61-90 days': { count: 0, value: 0 },
      '>90 days': { count: 0, value: 0 }
    };

    batchExpiryDetails.forEach(b => {
      buckets[b.expiry_bucket].count += b.quantity_on_hand;
      buckets[b.expiry_bucket].value += b.potential_wastage_value;
    });

    return Object.entries(buckets).map(([bucket, data]) => ({
      bucket,
      units: data.count,
      wastageValue: Math.round(data.value)
    }));
  }, [batchExpiryDetails]);

  const columns: Column<BatchExpiryDetail>[] = [
    { key: 'batch_no', header: 'Batch No.', render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.batch_no}</span> },
    { key: 'medicine_name', header: 'Medicine Name' },
    { key: 'category', header: 'Category' },
    { key: 'storage_location', header: 'Storage Location' },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      render: (row) => (
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {row.expiry_date}
        </span>
      )
    },
    {
      key: 'days_to_expiry',
      header: 'Days Left',
      align: 'right',
      render: (row) => {
        const isExp = row.days_to_expiry < 0;
        const isNear = row.days_to_expiry <= 30;
        return (
          <span className={`font-mono font-bold ${isExp ? 'text-rose-600 dark:text-rose-400' : isNear ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {isExp ? `${Math.abs(row.days_to_expiry)}d ago (Expired)` : `${row.days_to_expiry}d`}
          </span>
        );
      }
    },
    {
      key: 'quantity_on_hand',
      header: 'Batch Qty',
      align: 'right',
      render: (row) => `${row.quantity_on_hand.toLocaleString()} units`
    },
    {
      key: 'potential_wastage_qty',
      header: 'FEFO Wastage Qty',
      align: 'right',
      render: (row) => (
        <span className={row.potential_wastage_qty > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}>
          {row.potential_wastage_qty.toLocaleString()}
        </span>
      )
    },
    {
      key: 'potential_wastage_value',
      header: 'Wastage Value (₹)',
      align: 'right',
      render: (row) => (
        <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
          ₹{row.potential_wastage_value.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'suggested_action',
      header: 'Recommended Action',
      render: (row) => {
        let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        let IconComponent = CheckCircle;

        if (row.suggested_action === 'Return to Supplier') {
          badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
          IconComponent = Undo2;
        } else if (row.suggested_action === 'Transfer to Another Dept') {
          badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300';
          IconComponent = ArrowRightLeft;
        } else if (row.suggested_action === 'Discount or Donate') {
          badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300';
          IconComponent = Gift;
        } else if (row.suggested_action === 'Use First (FEFO Priority)') {
          badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300';
          IconComponent = AlertTriangle;
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}>
            <IconComponent className="w-3 h-3" />
            <span>{row.suggested_action}</span>
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Module 4: Expiry, FEFO & Wastage Prevention
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          First-Expiry-First-Out (FEFO) algorithms, batch shelf-life aging, and financial risk mitigation through transfer or vendor return.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Potential Wastage</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 tabular-nums">
            ₹{totalWastageValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {wastagePercentage}% of total stock valuation
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Already Expired Batches</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 tabular-nums">
            {expiredBatches.length} Batches
          </div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">Quarantine & safe disposal required</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expiring in &le; 30 Days</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 tabular-nums">
            {expiring30dBatches.length} Batches
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Immediate ward re-allocation needed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">FEFO Vulnerable Batches</div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono mt-1 tabular-nums">
            {vulnerableBatches.length} Batches
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cannot be depleted at standard ADC</div>
        </div>
      </div>

      {/* Visual Charts: Expiry Aging Timeline & Category-wise Wastage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timeline Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Expiry Aging Distribution
            </h2>
            <MetricTooltip
              title="FEFO Expiry Timeline"
              formula="Units grouped by Days to Expiry (DTE): Expired (<0d), 0-30d, 31-60d, 61-90d, >90d"
              clinicalSignificance="Ensures pharmacy teams never dispense older drugs behind newer shipments."
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Total physical units grouped by remaining expiry window</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryTimelineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="units" name="Stock Units" radius={[4, 4, 0, 0]}>
                  {expiryTimelineData.map((entry, index) => {
                    let color = '#10b981';
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

        {/* Category Wastage Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Potential Wastage Exposure by Category
            </h2>
            <MetricTooltip
              title="Category Wastage Valuation"
              formula="SUM(Potential_Wastage_Units * Unit_Cost) per Clinical Category"
              clinicalSignificance="High unit-cost categories like Diabetic (Insulin) and Antibiotics represent the greatest financial write-off risks."
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Rupee risk exposure categorized by medical therapeutic specialty</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryWastageData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Wastage Risk']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="wastageValue" name="Wastage Value (₹)" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Batch Register */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Active Batch Expiry & FEFO Protocol Register
            </h2>
            <p className="text-[11px] text-slate-500">
              Detailed tracking of every batch with storage rack, remaining shelf life, and prescribed intervention
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bucketFilter}
              onChange={e => setBucketFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Expiry Windows</option>
              <option value="Expired">Already Expired</option>
              <option value="0-30 days">0 to 30 Days Left</option>
              <option value="31-60 days">31 to 60 Days Left</option>
              <option value="61-90 days">61 to 90 Days Left</option>
              <option value=">90 days">&gt;90 Days (Safe)</option>
            </select>

            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Prescribed Actions</option>
              <option value="Return to Supplier">Return to Supplier</option>
              <option value="Transfer to Another Dept">Transfer to Dept</option>
              <option value="Use First (FEFO Priority)">Use First (FEFO)</option>
              <option value="Discount or Donate">Discount / Donate</option>
              <option value="Safe / Adequate Velocity">Safe Velocity</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredBatches}
          columns={columns}
          searchPlaceholder="Search batch number, medicine..."
          exportFilename="batch_expiry_fefo_register"
        />
      </div>
    </div>
  );
};
