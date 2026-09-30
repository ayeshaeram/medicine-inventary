import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Database,
  ShieldCheck,
  LineChart,
  Cpu,
  Radio,
  FileCode,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Title & Introduction */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Documentation & Inventory Analytics Constitution
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Comprehensive technical architecture, mathematical formulas, clinical assumptions, and operational flow governing MediTrack Analytics.
        </p>
      </div>

      {/* 1. Problem Overview & Core Objectives */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>1. Problem Statement & Hospital Operational Challenges</span>
        </h2>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            Hospitals and clinical pharmacies face a persistent dual-threat inventory dilemma: <strong>medicine stockouts</strong> (which threaten acute patient care and ICU survival) versus <strong>excess inventory & shelf expiration</strong> (which tie up working capital and cause millions in pharmaceutical disposal waste).
          </p>
          <p>
            Manual spreadsheet tracking fails because consumption patterns are inherently dynamic: demand fluctuates with seasonal weather surges (winter respiratory infections, fever spikes), emergency room trauma spikes on weekends, and supplier delivery lead-time variability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">Stockout Elimination</strong>
              <span>Zero ICU or Emergency interruptions through continuous safety buffer and lead-time monitoring.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">Expiry Wastage Minimization</strong>
              <span>Enforce First-Expiry-First-Out (FEFO) dispensing and inter-departmental transfers before shelf expiry.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">Capital Optimization</strong>
              <span>Detect overstocked SKUs (&gt;90d cover) and non-moving dead stock to release frozen hospital budgets.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. End-to-End System Pipeline */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>2. End-to-End Analytics Pipeline</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'CSV upload of 5 core tables: Medicines, Stock, Consumption, Procurement, Demand.' },
            { step: '02', title: 'Cleaning & QA', desc: 'Deduplication, date parsing, negative qty rectification, and Data Quality Report.' },
            { step: '03', title: 'Analytics Core', desc: 'ABC/XYZ categorization, ADC, Days of Cover, and Shortage Risk Scoring.' },
            { step: '04', title: 'Forecasting', desc: 'SMA-30 / Linear Regression 30-day projection, MAPE back-testing, Safety Stock.' },
            { step: '05', title: 'Dashboard UI', desc: 'Real-time KPI monitors, high-priority alert cards, and visual drill-downs.' },
            { step: '06', title: 'Action Guidance', desc: 'Plain-English reorder guidance, FEFO transfers, and PDF audit reports.' }
          ].map(s => (
            <div key={s.step} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold text-[10px]">{s.step}</span>
                <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{s.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Mathematical Formula & Metric Definitions */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>3. Complete Mathematical Formula Glossary</span>
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {/* Formula 1 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Average Daily Consumption (ADC)</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                ADC = Total_Quantity_Consumed / Analysis_Window_Days
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Represents normal dispensing speed per SKU per day, smoothing weekend and day-to-day variances.
            </p>
          </div>

          {/* Formula 2 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Days of Stock Cover (DOC)</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                DOC = Quantity_on_Hand / ADC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Number of days current physical warehouse and ward inventory can sustain operations before reaching zero stock.
            </p>
          </div>

          {/* Formula 3 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Shortage Risk Score (SRS, 0 to 100)</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-rose-700 dark:text-rose-300 font-bold">
                SRS = (Cover_Deficit_Weight [45pts] + Stockout_History [35pts]) &times; Criticality_Multiplier
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Weighted composite: If DOC &le; Lead Time, cover score gives 40-45 points. Multipliers: Vital = 1.0, Essential = 0.8, Desirable = 0.55. High Risk (&ge;70) requires urgent replenishment.
            </p>
          </div>

          {/* Formula 4 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Order Fill Rate %</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-teal-700 dark:text-teal-300">
                Fill_Rate = (Quantity_Used / Quantity_Requested) &times; 100
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Unmet demand = Quantity_Requested - Quantity_Used. Fill rate evaluates hospital pharmacy prescription fulfillment efficiency.
            </p>
          </div>

          {/* Formula 5 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Safety Stock (SS) & Reorder Level (ROP)</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                SS = 1.65 &times; &sigma;_daily &times; &radic;Lead_Time | ROP = (ADC &times; Lead_Time) + SS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Z = 1.65 corresponds to a 95% cycle service level (protection against demand surges and supplier dispatch delays during the lead time window).
            </p>
          </div>

          {/* Formula 6 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Suggested Order Quantity (SOQ)</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                SOQ = max(0, (Forecast_30d_Demand + Safety_Stock) - Current_Stock)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Calculates exact purchase order sizing to replenish inventory to optimal levels without creating excess capital lock-up.
            </p>
          </div>

          {/* Formula 7 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">FEFO Expiry & Potential Wastage</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                Wastage_Qty = max(0, Batch_Qty - (ADC &times; Days_to_Expiry))
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              If physical batch quantity exceeds what the hospital can naturally dispense before the expiration date under FEFO sequencing, the surplus is flagged for vendor return or clinic re-allocation.
            </p>
          </div>

          {/* Formula 8 */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">ABC & XYZ Demand Segmentation</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                ABC: Top 70% / Next 20% / Last 10% | XYZ: CV &lt; 0.25 (X), 0.25&le;CV&le;0.5 (Y), CV &gt; 0.5 (Z)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CV = &sigma; / &mu; (Coefficient of Variation). Segregates high-value, highly volatile items (AZ) from high-value stable consumables (AX).
            </p>
          </div>
        </div>
      </section>

      {/* 4. Assumptions & Practical Limitations */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>4. Clinical Assumptions & System Boundaries</span>
        </h2>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>
              <strong>FEFO Discipline:</strong> Assumes pharmacy nurses and staff strictly dispense earliest-expiring lots first.
            </li>
            <li>
              <strong>Supplier Lead Times:</strong> Assumes base supplier contract lead times remain bounded within historical variance envelopes.
            </li>
            <li>
              <strong>Batch Non-Splitting:</strong> Safety stock calculations evaluate SKUs at aggregate level while expiry algorithms inspect individual batch lot records.
            </li>
            <li>
              <strong>Criticality Definitions:</strong> Vital (V) drugs (emergency resuscitation, cardiac arrest, critical ICU antibiotics) carry zero stockout tolerance; Essential (E) have secondary substitutes; Desirable (D) are non-critical supplements.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Future Technology Scope */}
      <section className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>5. Future Roadmap & Advanced Clinical Integration</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">IoT Smart Weight-Sensing Shelves & RFID Bins</strong>
            <p className="text-[11px] text-slate-500 leading-snug">
              Automate physical count reconciliation using continuous load-cell shelf monitoring and RFID antenna checkpoints for real-time inventory depletion without manual scanning.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">HL7 / FHIR Electronic Health Record (EHR) Bridge</strong>
            <p className="text-[11px] text-slate-500 leading-snug">
              Direct connection with hospital EHRs (Epic, Cerner) to translate surgical scheduling and patient admission counts directly into proactive pharmaceutical demand forecasts.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">Cold-Chain Temperature Telemetry</strong>
            <p className="text-[11px] text-slate-500 leading-snug">
              Incorporate continuous 2&deg;C–8&deg;C thermal sensor feeds for insulin, vaccines, and biologics to automatically flag temperature excursion batches for quality recall.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">Automated EDI / B2B Supplier Ordering</strong>
            <p className="text-[11px] text-slate-500 leading-snug">
              Direct electronic data interchange (EDI 850) transmission to certified pharmaceutical distributors when stock hits ROP, shortening procurement lag by 48 hours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
