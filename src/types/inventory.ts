export type Criticality = 'Vital' | 'Essential' | 'Desirable';

export type Department = 'OPD' | 'ICU' | 'Emergency' | 'Pharmacy';

export type Category = 
  | 'Antibiotics'
  | 'Analgesics'
  | 'Cardiac'
  | 'Diabetic'
  | 'Antacids'
  | 'Vitamins'
  | 'Emergency Drugs'
  | 'IV Fluids';

export interface Medicine {
  medicine_id: string;
  name: string;
  category: Category | string;
  unit_cost: number;
  reorder_level: number;
  lead_time_days: number;
  criticality: Criticality;
}

export interface StockBatch {
  medicine_id: string;
  batch_no: string;
  quantity_on_hand: number;
  manufacture_date: string;
  expiry_date: string;
  storage_location: string;
}

export interface ConsumptionRecord {
  date: string;
  medicine_id: string;
  quantity_used: number;
  department: Department | string;
}

export interface ProcurementRecord {
  order_id: string;
  order_date: string;
  medicine_id: string;
  quantity_ordered: number;
  supplier: string;
  delivery_date: string;
  unit_price: number;
}

export interface DemandRecord {
  date: string;
  medicine_id: string;
  quantity_requested: number;
  department: Department | string;
}

export interface RawDataset {
  medicines: Medicine[];
  stock: StockBatch[];
  consumption: ConsumptionRecord[];
  procurement: ProcurementRecord[];
  demand: DemandRecord[];
}

export interface CleaningLogEntry {
  table: string;
  rowNumber?: number;
  field: string;
  issue: string;
  actionTaken: string;
}

export interface DataQualityReport {
  timestamp: string;
  totalRowsLoaded: number;
  totalRowsCleaned: number;
  tableBreakdown: {
    medicines: { loaded: number; cleaned: number; issues: number };
    stock: { loaded: number; cleaned: number; issues: number };
    consumption: { loaded: number; cleaned: number; issues: number };
    procurement: { loaded: number; cleaned: number; issues: number };
    demand: { loaded: number; cleaned: number; issues: number };
  };
  issueTypes: {
    missingValues: number;
    duplicatesRemoved: number;
    dateFormatFixed: number;
    negativeQtyCorrected: number;
    orphanedReferences: number;
  };
  recentLogs: CleaningLogEntry[];
}

export type AbcClass = 'A' | 'B' | 'C';
export type XyzClass = 'X' | 'Y' | 'Z';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type ExpiryBucket = 'Expired' | '0-30 days' | '31-60 days' | '61-90 days' | '>90 days';

export interface MedicineAnalytics {
  medicine_id: string;
  name: string;
  category: string;
  unit_cost: number;
  reorder_level: number;
  lead_time_days: number;
  criticality: Criticality;
  
  // Stock metrics
  total_stock: number;
  stock_value: number;
  batch_count: number;
  
  // Consumption metrics
  total_consumed: number;
  total_consumption_value: number;
  average_daily_consumption: number; // ADC
  days_of_stock_cover: number; // quantity_on_hand / ADC
  consumption_trend_pct: number; // MoM growth %
  
  // Demand & Shortage metrics
  total_demanded: number;
  unmet_demand: number; // requested - used
  fill_rate_pct: number; // used / requested * 100
  stockout_events_count: number;
  days_below_reorder: number;
  shortage_risk_score: number; // 0-100
  shortage_risk_level: RiskLevel;
  estimated_days_to_stockout: number; // quantity_on_hand / ADC
  
  // Excess inventory metrics
  is_overstocked: boolean; // cover > 90
  is_dead_stock: boolean; // no usage in 90 days
  inventory_turnover_ratio: number; // annual consumption value / average stock value
  excess_quantity: number; // stock - (ADC * 60)
  excess_stock_value: number; // excess_qty * unit_cost
  
  // Expiry metrics
  expiring_30_days_qty: number;
  potential_wastage_qty: number;
  potential_wastage_value: number;
  
  // Classification
  abc_class: AbcClass; // A: top 70% value, B: next 20%, C: last 10%
  xyz_class: XyzClass; // X: CV < 0.25, Y: 0.25-0.5, Z: > 0.5
  demand_cv: number; // Coefficient of Variation
  
  // Inventory Control & Forecasting
  daily_demand_std_dev: number;
  safety_stock: number; // 1.65 * std_dev * sqrt(lead_time)
  calculated_reorder_level: number; // (ADC * lead_time) + safety_stock
  forecast_30d_demand: number;
  suggested_order_qty: number; // max(0, forecast + safety_stock - current_stock)
  
  // Plain-English insight
  primary_insight: string;
}

export interface BatchExpiryDetail {
  medicine_id: string;
  medicine_name: string;
  category: string;
  batch_no: string;
  quantity_on_hand: number;
  unit_cost: number;
  manufacture_date: string;
  expiry_date: string;
  storage_location: string;
  days_to_expiry: number;
  expiry_bucket: ExpiryBucket;
  is_fefo_vulnerable: boolean; // quantity_on_hand > ADC * days_to_expiry
  potential_wastage_qty: number;
  potential_wastage_value: number;
  suggested_action: 'Return to Supplier' | 'Transfer to Another Dept' | 'Use First (FEFO Priority)' | 'Discount or Donate' | 'Safe / Adequate Velocity';
}

export interface SupplierMetric {
  supplier: string;
  total_orders: number;
  total_units_ordered: number;
  total_spend: number;
  avg_delivery_delay_days: number;
  on_time_orders_count: number;
  on_time_delivery_pct: number;
  reliability_status: 'Excellent' | 'Satisfactory' | 'Needs Review';
}

export interface GlobalFilterState {
  dateRange: '30d' | '90d' | '180d' | '365d' | 'all';
  category: string;
  medicineId: string;
  department: string;
  supplier: string;
  searchQuery: string;
}

export interface CriticalAlert {
  id: string;
  type: 'stockout' | 'expiry' | 'excess' | 'supplier_delay' | 'unmet_demand';
  severity: 'critical' | 'warning' | 'info';
  medicine_id: string;
  medicine_name: string;
  title: string;
  description: string;
  actionText: string;
  targetModule: string;
}
