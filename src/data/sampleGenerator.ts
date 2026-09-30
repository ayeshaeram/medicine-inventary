import { 
  Medicine, 
  StockBatch, 
  ConsumptionRecord, 
  ProcurementRecord, 
  DemandRecord, 
  RawDataset,
  Criticality,
  Category,
  Department
} from '../types/inventory';

export const MEDICINE_CATALOG: Array<{
  id: string;
  name: string;
  category: Category;
  unit_cost: number;
  reorder_level: number;
  lead_time_days: number;
  criticality: Criticality;
  velocity: 'fast' | 'medium' | 'slow' | 'dead';
  baseDailyDemand: number;
  winterMultiplier: number;
}> = [
  // 1. ANTIBIOTICS (8 medicines)
  { id: 'MED-AB-01', name: 'Amoxicillin 500mg Capsule', category: 'Antibiotics', unit_cost: 14.5, reorder_level: 600, lead_time_days: 7, criticality: 'Vital', velocity: 'fast', baseDailyDemand: 85, winterMultiplier: 1.6 },
  { id: 'MED-AB-02', name: 'Azithromycin 500mg Tablet', category: 'Antibiotics', unit_cost: 28.0, reorder_level: 350, lead_time_days: 5, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 40, winterMultiplier: 1.5 },
  { id: 'MED-AB-03', name: 'Ceftriaxone 1g IV Injection', category: 'Antibiotics', unit_cost: 65.0, reorder_level: 500, lead_time_days: 10, criticality: 'Vital', velocity: 'fast', baseDailyDemand: 70, winterMultiplier: 1.4 },
  { id: 'MED-AB-04', name: 'Ciprofloxacin 500mg Tablet', category: 'Antibiotics', unit_cost: 18.5, reorder_level: 300, lead_time_days: 6, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 35, winterMultiplier: 1.1 },
  { id: 'MED-AB-05', name: 'Levofloxacin 750mg Tablet', category: 'Antibiotics', unit_cost: 32.0, reorder_level: 200, lead_time_days: 8, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 25, winterMultiplier: 1.3 },
  { id: 'MED-AB-06', name: 'Meropenem 1g IV Vial', category: 'Antibiotics', unit_cost: 210.0, reorder_level: 120, lead_time_days: 14, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 12, winterMultiplier: 1.2 },
  { id: 'MED-AB-07', name: 'Doxycycline 100mg Capsule', category: 'Antibiotics', unit_cost: 9.5, reorder_level: 150, lead_time_days: 7, criticality: 'Desirable', velocity: 'slow', baseDailyDemand: 16, winterMultiplier: 1.1 },
  { id: 'MED-AB-08', name: 'Vancomycin 500mg Injection', category: 'Antibiotics', unit_cost: 145.0, reorder_level: 80, lead_time_days: 12, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 8, winterMultiplier: 1.1 },

  // 2. ANALGESICS (8 medicines)
  { id: 'MED-AN-01', name: 'Paracetamol 650mg Tablet', category: 'Analgesics', unit_cost: 3.2, reorder_level: 1200, lead_time_days: 4, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 180, winterMultiplier: 1.4 },
  { id: 'MED-AN-02', name: 'Ibuprofen 400mg Tablet', category: 'Analgesics', unit_cost: 5.5, reorder_level: 500, lead_time_days: 5, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 65, winterMultiplier: 1.2 },
  { id: 'MED-AN-03', name: 'Tramadol 50mg Capsule', category: 'Analgesics', unit_cost: 16.0, reorder_level: 250, lead_time_days: 7, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 30, winterMultiplier: 1.0 },
  { id: 'MED-AN-04', name: 'Morphine Sulfate 10mg/ml Ampoule', category: 'Analgesics', unit_cost: 85.0, reorder_level: 100, lead_time_days: 15, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 10, winterMultiplier: 1.0 },
  { id: 'MED-AN-05', name: 'Diclofenac 50mg Tablet', category: 'Analgesics', unit_cost: 4.8, reorder_level: 300, lead_time_days: 5, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 38, winterMultiplier: 1.0 },
  { id: 'MED-AN-06', name: 'Ketorolac 30mg IV Ampoule', category: 'Analgesics', unit_cost: 22.0, reorder_level: 150, lead_time_days: 8, criticality: 'Essential', velocity: 'dead', baseDailyDemand: 0, winterMultiplier: 1.0 },
  { id: 'MED-AN-07', name: 'Acetaminophen 1000mg IV Infusion', category: 'Analgesics', unit_cost: 42.0, reorder_level: 400, lead_time_days: 6, criticality: 'Vital', velocity: 'fast', baseDailyDemand: 55, winterMultiplier: 1.3 },
  { id: 'MED-AN-08', name: 'Fentanyl Transdermal Patch 50mcg', category: 'Analgesics', unit_cost: 180.0, reorder_level: 60, lead_time_days: 14, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 6, winterMultiplier: 1.0 },

  // 3. CARDIAC (8 medicines)
  { id: 'MED-CA-01', name: 'Atorvastatin 20mg Tablet', category: 'Cardiac', unit_cost: 12.0, reorder_level: 800, lead_time_days: 6, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 95, winterMultiplier: 1.0 },
  { id: 'MED-CA-02', name: 'Amlodipine 5mg Tablet', category: 'Cardiac', unit_cost: 6.5, reorder_level: 700, lead_time_days: 5, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 88, winterMultiplier: 1.0 },
  { id: 'MED-CA-03', name: 'Enalapril 10mg Tablet', category: 'Cardiac', unit_cost: 8.0, reorder_level: 400, lead_time_days: 6, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 45, winterMultiplier: 1.0 },
  { id: 'MED-CA-04', name: 'Metoprolol Succinate 50mg', category: 'Cardiac', unit_cost: 14.0, reorder_level: 500, lead_time_days: 7, criticality: 'Vital', velocity: 'medium', baseDailyDemand: 50, winterMultiplier: 1.0 },
  { id: 'MED-CA-05', name: 'Digoxin 0.25mg Tablet', category: 'Cardiac', unit_cost: 11.5, reorder_level: 150, lead_time_days: 8, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 14, winterMultiplier: 1.0 },
  { id: 'MED-CA-06', name: 'Nitroglycerin 0.4mg Sublingual', category: 'Cardiac', unit_cost: 38.0, reorder_level: 180, lead_time_days: 9, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 18, winterMultiplier: 1.0 },
  { id: 'MED-CA-07', name: 'Clopidogrel 75mg Tablet', category: 'Cardiac', unit_cost: 15.0, reorder_level: 600, lead_time_days: 6, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 60, winterMultiplier: 1.0 },
  { id: 'MED-CA-08', name: 'Furosemide 40mg IV Ampoule', category: 'Cardiac', unit_cost: 9.0, reorder_level: 350, lead_time_days: 5, criticality: 'Vital', velocity: 'medium', baseDailyDemand: 42, winterMultiplier: 1.0 },

  // 4. DIABETIC (7 medicines)
  { id: 'MED-DB-01', name: 'Metformin 500mg Tablet', category: 'Diabetic', unit_cost: 4.5, reorder_level: 1000, lead_time_days: 5, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 140, winterMultiplier: 1.0 },
  { id: 'MED-DB-02', name: 'Insulin Glargine 100 IU/ml Pen', category: 'Diabetic', unit_cost: 320.0, reorder_level: 220, lead_time_days: 10, criticality: 'Vital', velocity: 'medium', baseDailyDemand: 26, winterMultiplier: 1.0 },
  { id: 'MED-DB-03', name: 'Insulin Regular 100 IU/ml Vial', category: 'Diabetic', unit_cost: 150.0, reorder_level: 180, lead_time_days: 8, criticality: 'Vital', velocity: 'medium', baseDailyDemand: 22, winterMultiplier: 1.0 },
  { id: 'MED-DB-04', name: 'Glimepiride 2mg Tablet', category: 'Diabetic', unit_cost: 7.2, reorder_level: 450, lead_time_days: 5, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 52, winterMultiplier: 1.0 },
  { id: 'MED-DB-05', name: 'Sitagliptin 100mg Tablet', category: 'Diabetic', unit_cost: 26.0, reorder_level: 300, lead_time_days: 7, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 34, winterMultiplier: 1.0 },
  { id: 'MED-DB-06', name: 'Empagliflozin 25mg Tablet', category: 'Diabetic', unit_cost: 45.0, reorder_level: 250, lead_time_days: 7, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 28, winterMultiplier: 1.0 },
  { id: 'MED-DB-07', name: 'Liraglutide 6mg/ml Injection Pen', category: 'Diabetic', unit_cost: 580.0, reorder_level: 40, lead_time_days: 14, criticality: 'Desirable', velocity: 'slow', baseDailyDemand: 4, winterMultiplier: 1.0 },

  // 5. ANTACIDS (7 medicines)
  { id: 'MED-AT-01', name: 'Pantoprazole 40mg IV Injection', category: 'Antacids', unit_cost: 24.0, reorder_level: 700, lead_time_days: 5, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 80, winterMultiplier: 1.0 },
  { id: 'MED-AT-02', name: 'Omeprazole 20mg Capsule', category: 'Antacids', unit_cost: 6.0, reorder_level: 600, lead_time_days: 5, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 75, winterMultiplier: 1.0 },
  { id: 'MED-AT-03', name: 'Ranitidine 150mg Tablet', category: 'Antacids', unit_cost: 4.0, reorder_level: 200, lead_time_days: 6, criticality: 'Desirable', velocity: 'slow', baseDailyDemand: 15, winterMultiplier: 1.0 },
  { id: 'MED-AT-04', name: 'Rabeprazole 20mg Tablet', category: 'Antacids', unit_cost: 11.0, reorder_level: 350, lead_time_days: 6, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 38, winterMultiplier: 1.0 },
  { id: 'MED-AT-05', name: 'Sucralfate 1g/5ml Suspension 200ml', category: 'Antacids', unit_cost: 48.0, reorder_level: 140, lead_time_days: 7, criticality: 'Desirable', velocity: 'slow', baseDailyDemand: 12, winterMultiplier: 1.0 },
  { id: 'MED-AT-06', name: 'Famotidine 20mg Tablet', category: 'Antacids', unit_cost: 7.5, reorder_level: 250, lead_time_days: 5, criticality: 'Desirable', velocity: 'slow', baseDailyDemand: 20, winterMultiplier: 1.0 },
  { id: 'MED-AT-07', name: 'Magnesium Aluminum Hydroxide Gel', category: 'Antacids', unit_cost: 35.0, reorder_level: 300, lead_time_days: 6, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 32, winterMultiplier: 1.0 },

  // 6. VITAMINS (7 medicines)
  { id: 'MED-VT-01', name: 'Vitamin C (Ascorbic Acid) 500mg', category: 'Vitamins', unit_cost: 3.5, reorder_level: 400, lead_time_days: 6, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 45, winterMultiplier: 1.5 },
  { id: 'MED-VT-02', name: 'Vitamin D3 60,000 IU Capsule', category: 'Vitamins', unit_cost: 18.0, reorder_level: 350, lead_time_days: 7, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 35, winterMultiplier: 1.2 },
  { id: 'MED-VT-03', name: 'Vitamin B-Complex with B12 Tablet', category: 'Vitamins', unit_cost: 5.0, reorder_level: 500, lead_time_days: 5, criticality: 'Desirable', velocity: 'fast', baseDailyDemand: 70, winterMultiplier: 1.0 },
  { id: 'MED-VT-04', name: 'Calcium Carbonate 500mg + D3', category: 'Vitamins', unit_cost: 8.5, reorder_level: 450, lead_time_days: 6, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 48, winterMultiplier: 1.0 },
  { id: 'MED-VT-05', name: 'Zinc Sulfate 50mg Tablet', category: 'Vitamins', unit_cost: 4.0, reorder_level: 300, lead_time_days: 6, criticality: 'Desirable', velocity: 'slow', baseDailyDemand: 18, winterMultiplier: 1.3 },
  { id: 'MED-VT-06', name: 'Multivitamin Infusion (MVI) 10ml', category: 'Vitamins', unit_cost: 55.0, reorder_level: 180, lead_time_days: 8, criticality: 'Essential', velocity: 'slow', baseDailyDemand: 16, winterMultiplier: 1.0 },
  { id: 'MED-VT-07', name: 'Folic Acid 5mg Tablet', category: 'Vitamins', unit_cost: 3.0, reorder_level: 300, lead_time_days: 5, criticality: 'Desirable', velocity: 'medium', baseDailyDemand: 28, winterMultiplier: 1.0 },

  // 7. EMERGENCY DRUGS (8 medicines)
  { id: 'MED-EM-01', name: 'Adrenaline (Epinephrine) 1mg/ml', category: 'Emergency Drugs', unit_cost: 45.0, reorder_level: 160, lead_time_days: 8, criticality: 'Vital', velocity: 'medium', baseDailyDemand: 18, winterMultiplier: 1.0 },
  { id: 'MED-EM-02', name: 'Atropine Sulfate 0.6mg/ml Ampoule', category: 'Emergency Drugs', unit_cost: 25.0, reorder_level: 120, lead_time_days: 7, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 12, winterMultiplier: 1.0 },
  { id: 'MED-EM-03', name: 'Amiodarone 150mg/3ml Ampoule', category: 'Emergency Drugs', unit_cost: 72.0, reorder_level: 100, lead_time_days: 10, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 9, winterMultiplier: 1.0 },
  { id: 'MED-EM-04', name: 'Naloxone HCl 0.4mg/ml Ampoule', category: 'Emergency Drugs', unit_cost: 95.0, reorder_level: 80, lead_time_days: 12, criticality: 'Vital', velocity: 'dead', baseDailyDemand: 0, winterMultiplier: 1.0 },
  { id: 'MED-EM-05', name: 'Hydrocortisone 100mg IV Vial', category: 'Emergency Drugs', unit_cost: 38.0, reorder_level: 220, lead_time_days: 6, criticality: 'Vital', velocity: 'medium', baseDailyDemand: 26, winterMultiplier: 1.2 },
  { id: 'MED-EM-06', name: 'Dopamine 200mg/5ml Ampoule', category: 'Emergency Drugs', unit_cost: 60.0, reorder_level: 100, lead_time_days: 9, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 8, winterMultiplier: 1.0 },
  { id: 'MED-EM-07', name: 'Sodium Bicarbonate 8.4% 25ml', category: 'Emergency Drugs', unit_cost: 40.0, reorder_level: 140, lead_time_days: 7, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 14, winterMultiplier: 1.0 },
  { id: 'MED-EM-08', name: 'Adenosine 6mg/2ml Rapid IV Vial', category: 'Emergency Drugs', unit_cost: 110.0, reorder_level: 60, lead_time_days: 10, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 5, winterMultiplier: 1.0 },

  // 8. IV FLUIDS (7 medicines)
  { id: 'MED-IV-01', name: 'Normal Saline (0.9% NaCl) 500ml', category: 'IV Fluids', unit_cost: 22.0, reorder_level: 1400, lead_time_days: 4, criticality: 'Vital', velocity: 'fast', baseDailyDemand: 190, winterMultiplier: 1.0 },
  { id: 'MED-IV-02', name: 'Ringer Lactate (RL) Solution 500ml', category: 'IV Fluids', unit_cost: 26.0, reorder_level: 1100, lead_time_days: 4, criticality: 'Vital', velocity: 'fast', baseDailyDemand: 150, winterMultiplier: 1.0 },
  { id: 'MED-IV-03', name: 'Dextrose 5% in Water 500ml', category: 'IV Fluids', unit_cost: 24.0, reorder_level: 800, lead_time_days: 5, criticality: 'Vital', velocity: 'fast', baseDailyDemand: 105, winterMultiplier: 1.0 },
  { id: 'MED-IV-04', name: 'Dextrose 10% in Water 500ml', category: 'IV Fluids', unit_cost: 28.0, reorder_level: 300, lead_time_days: 5, criticality: 'Essential', velocity: 'medium', baseDailyDemand: 35, winterMultiplier: 1.0 },
  { id: 'MED-IV-05', name: 'Mannitol 20% IV Infusion 100ml', category: 'IV Fluids', unit_cost: 65.0, reorder_level: 160, lead_time_days: 8, criticality: 'Essential', velocity: 'slow', baseDailyDemand: 15, winterMultiplier: 1.0 },
  { id: 'MED-IV-06', name: 'Sterile Water for Injection 10ml', category: 'IV Fluids', unit_cost: 5.0, reorder_level: 1200, lead_time_days: 4, criticality: 'Essential', velocity: 'fast', baseDailyDemand: 160, winterMultiplier: 1.0 },
  { id: 'MED-IV-07', name: 'Sodium Chloride 3% Hypertonic 500ml', category: 'IV Fluids', unit_cost: 52.0, reorder_level: 120, lead_time_days: 7, criticality: 'Vital', velocity: 'slow', baseDailyDemand: 10, winterMultiplier: 1.0 }
];

export const SUPPLIERS = [
  'Apex BioPharma Supplies',
  'MedSupply Global Distribution',
  'CareCore Therapeutics Ltd',
  'Zenith LifeSciences Corp',
  'PharmaQuick Emergency Logistics'
];

export const DEPARTMENTS: Department[] = ['OPD', 'ICU', 'Emergency', 'Pharmacy'];

// Deterministic PRNG for reliable data reproducibility
function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateRealisticSampleData(): RawDataset {
  const rand = pseudoRandom(42);
  const today = new Date('2026-09-29T00:00:00Z');
  
  // 1. Build Medicines
  const medicines: Medicine[] = MEDICINE_CATALOG.map(item => ({
    medicine_id: item.id,
    name: item.name,
    category: item.category,
    unit_cost: item.unit_cost,
    reorder_level: item.reorder_level,
    lead_time_days: item.lead_time_days,
    criticality: item.criticality
  }));

  // 2. Build Stock Batches
  const stock: StockBatch[] = [];
  const locations = ['Warehouse Rack A-1', 'Main Pharmacy Shelf B-2', 'ICU Satellite Cabinet C-1', 'Emergency Cold Storage', 'Clean Room D-4'];

  medicines.forEach((med, idx) => {
    const catalogItem = MEDICINE_CATALOG[idx];
    const isDead = catalogItem.velocity === 'dead';
    const isOverstocked = med.medicine_id === 'MED-VT-01' || med.medicine_id === 'MED-AT-04' || med.medicine_id === 'MED-DB-05';
    const isImminentShortage = med.medicine_id === 'MED-AB-01' || med.medicine_id === 'MED-EM-01' || med.medicine_id === 'MED-CA-04';
    
    // Batch counts: 2 to 4 batches per medicine
    const batchCount = isDead ? 1 : (idx % 3 === 0 ? 3 : (idx % 2 === 0 ? 2 : 4));

    for (let b = 0; b < batchCount; b++) {
      const batchNo = `BAT-${med.category.slice(0, 2).toUpperCase()}-${1000 + idx * 10 + b}`;
      let qty: number;
      let expiryDaysOffset: number;

      if (isDead) {
        // Dead stock: large quantity, hasn't moved, moderate expiry
        qty = 450 + Math.floor(rand() * 200);
        expiryDaysOffset = 75 + Math.floor(rand() * 60);
      } else if (isOverstocked) {
        // High quantity, cover > 120 days
        qty = Math.floor(catalogItem.baseDailyDemand * (95 + b * 20));
        expiryDaysOffset = 180 + Math.floor(rand() * 200);
      } else if (isImminentShortage) {
        // Depleted: barely 2 to 5 days of cover left
        qty = Math.max(15, Math.floor(catalogItem.baseDailyDemand * (1.5 + rand() * 2)));
        expiryDaysOffset = 120 + Math.floor(rand() * 90);
      } else {
        // Standard normal distribution
        const coverDays = 15 + Math.floor(rand() * 45);
        qty = Math.floor((catalogItem.baseDailyDemand * coverDays) / batchCount);
        
        // Controlled expiry conditions:
        // Some batches already expired (-15 to -5 days)
        // Some in 0-30 days
        // Some in 31-60 days
        // Some safe (>90 days)
        if (idx === 2 && b === 0) {
          // Ceftriaxone batch near expiry (18 days left)
          expiryDaysOffset = 18;
          qty = 280; // High quantity vs ADC => FEFO risk!
        } else if (idx === 17 && b === 0) {
          // Insulin Glargine batch near expiry (25 days left, high value)
          expiryDaysOffset = 25;
          qty = 95;
        } else if (idx === 9 && b === 0) {
          // Morphine batch in 45 days
          expiryDaysOffset = 45;
          qty = 70;
        } else if (idx === 14 && b === 0) {
          // Already expired batch (-8 days)
          expiryDaysOffset = -8;
          qty = 40;
        } else if (idx === 30 && b === 0) {
          // Vitamin C near expiry (12 days)
          expiryDaysOffset = 12;
          qty = 600;
        } else {
          expiryDaysOffset = 60 + Math.floor(rand() * 320);
        }
      }

      // Calculate dates
      const expDate = new Date(today.getTime() + expiryDaysOffset * 86400000);
      const mfgDate = new Date(expDate.getTime() - (540 + Math.floor(rand() * 180)) * 86400000);

      stock.push({
        medicine_id: med.medicine_id,
        batch_no: batchNo,
        quantity_on_hand: Math.max(0, qty),
        manufacture_date: mfgDate.toISOString().split('T')[0],
        expiry_date: expDate.toISOString().split('T')[0],
        storage_location: locations[(idx + b) % locations.length]
      });
    }
  });

  // 3. Build 12 Months of Daily Consumption and Demand Records
  // Range: 2025-10-01 to 2026-09-29 (~364 days)
  const consumption: ConsumptionRecord[] = [];
  const demand: DemandRecord[] = [];
  const totalDays = 364;
  const startDate = new Date(today.getTime() - totalDays * 86400000);

  // Pre-generate department distribution weights per category
  const deptWeights: Record<Category, Record<Department, number>> = {
    'Antibiotics': { OPD: 0.35, ICU: 0.25, Emergency: 0.25, Pharmacy: 0.15 },
    'Analgesics': { OPD: 0.30, ICU: 0.20, Emergency: 0.35, Pharmacy: 0.15 },
    'Cardiac': { OPD: 0.40, ICU: 0.30, Emergency: 0.20, Pharmacy: 0.10 },
    'Diabetic': { OPD: 0.50, ICU: 0.20, Emergency: 0.15, Pharmacy: 0.15 },
    'Antacids': { OPD: 0.35, ICU: 0.25, Emergency: 0.20, Pharmacy: 0.20 },
    'Vitamins': { OPD: 0.55, ICU: 0.10, Emergency: 0.05, Pharmacy: 0.30 },
    'Emergency Drugs': { OPD: 0.05, ICU: 0.40, Emergency: 0.50, Pharmacy: 0.05 },
    'IV Fluids': { OPD: 0.15, ICU: 0.40, Emergency: 0.35, Pharmacy: 0.10 }
  };

  for (let d = 0; d < totalDays; d++) {
    const curDate = new Date(startDate.getTime() + d * 86400000);
    const dateStr = curDate.toISOString().split('T')[0];
    const month = curDate.getMonth(); // 0-11. Dec=11, Jan=0, Feb=1
    const isWinter = month === 11 || month === 0 || month === 1;

    // Day of week seasonality: weekends slightly lower for OPD, higher for Emergency
    const dayOfWeek = curDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // For performance and clean aggregation, generate daily records for active medicines
    medicines.forEach((med, mIdx) => {
      const catalog = MEDICINE_CATALOG[mIdx];
      if (catalog.velocity === 'dead') {
        // Dead stock: no consumption in the last 120 days!
        if (d < 180) {
          // Minor early usage
          if (d % 7 === 0) {
            consumption.push({
              date: dateStr,
              medicine_id: med.medicine_id,
              quantity_used: 1 + Math.floor(rand() * 2),
              department: 'Emergency'
            });
            demand.push({
              date: dateStr,
              medicine_id: med.medicine_id,
              quantity_requested: 2,
              department: 'Emergency'
            });
          }
        }
        return;
      }

      // Base demand calculation
      let dailyBase = catalog.baseDailyDemand;
      if (isWinter && catalog.winterMultiplier > 1.0) {
        dailyBase *= catalog.winterMultiplier;
      }

      // Random daily variation (+/- 25%)
      const variation = 0.75 + rand() * 0.5;
      let totalDayDemand = Math.round(dailyBase * variation);

      // Stockout periods simulation for specific medicines
      // E.g. Ceftriaxone stockout between day 280 and 292
      let isStockoutPeriod = false;
      if (med.medicine_id === 'MED-AB-03' && d >= 280 && d <= 292) {
        isStockoutPeriod = true;
      } else if (med.medicine_id === 'MED-EM-01' && d >= 340 && d <= 346) {
        isStockoutPeriod = true;
      }

      // Distribute across departments
      const weights = deptWeights[catalog.category];
      DEPARTMENTS.forEach(dept => {
        let deptRatio = weights[dept];
        if (isWeekend) {
          if (dept === 'Emergency') deptRatio *= 1.35;
          if (dept === 'OPD') deptRatio *= 0.6;
        }

        const deptDemandQty = Math.max(0, Math.round(totalDayDemand * deptRatio));
        if (deptDemandQty > 0) {
          demand.push({
            date: dateStr,
            medicine_id: med.medicine_id,
            quantity_requested: deptDemandQty,
            department: dept
          });

          // Consumption: if stockout period, unmet demand occurs!
          let deptUsedQty = deptDemandQty;
          if (isStockoutPeriod) {
            // Unmet demand!
            deptUsedQty = Math.floor(deptDemandQty * 0.2); // Only 20% met or 0
          } else if (catalog.velocity === 'fast' && rand() < 0.04) {
            // Occasional spot shortages (unmet demand 10-30%)
            deptUsedQty = Math.max(0, Math.floor(deptDemandQty * (0.7 + rand() * 0.25)));
          }

          if (deptUsedQty > 0) {
            consumption.push({
              date: dateStr,
              medicine_id: med.medicine_id,
              quantity_used: deptUsedQty,
              department: dept
            });
          }
        }
      });
    });
  }

  // 4. Build Procurement Records
  const procurement: ProcurementRecord[] = [];
  let orderCounter = 10001;

  medicines.forEach((med, mIdx) => {
    const catalog = MEDICINE_CATALOG[mIdx];
    const supplier = SUPPLIERS[mIdx % SUPPLIERS.length];
    
    // Fast moving medicines ordered every 2-3 weeks; slow moving every 2-3 months
    const intervalDays = catalog.velocity === 'fast' ? 18 : (catalog.velocity === 'medium' ? 35 : 75);
    const orderQty = Math.round(catalog.baseDailyDemand * intervalDays * 1.05);

    if (catalog.velocity === 'dead') return; // No recent procurement for dead stock

    for (let day = 15; day < totalDays - 10; day += intervalDays) {
      const orderDate = new Date(startDate.getTime() + day * 86400000);
      const promisedLeadTime = catalog.lead_time_days;
      
      // Delay simulation: Apex & CareCore usually on time; PharmaQuick occasional delays
      let actualDelay = 0;
      if (supplier === 'PharmaQuick Emergency Logistics' && rand() < 0.4) {
        actualDelay = 3 + Math.floor(rand() * 5); // 3-7 days late
      } else if (rand() < 0.15) {
        actualDelay = 1 + Math.floor(rand() * 3);
      }

      const deliveryDate = new Date(orderDate.getTime() + (promisedLeadTime + actualDelay) * 86400000);
      const unitPrice = +(med.unit_cost * (0.95 + rand() * 0.1)).toFixed(2);

      procurement.push({
        order_id: `PO-${orderCounter++}`,
        order_date: orderDate.toISOString().split('T')[0],
        medicine_id: med.medicine_id,
        quantity_ordered: Math.max(10, orderQty),
        supplier: supplier,
        delivery_date: deliveryDate.toISOString().split('T')[0],
        unit_price: unitPrice
      });
    }
  });

  return {
    medicines,
    stock,
    consumption,
    procurement,
    demand
  };
}
