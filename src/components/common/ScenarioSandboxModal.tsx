import React, { useState } from 'react';
import {
  Sliders,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';

export interface SimulationParameters {
  winterSurgeEnabled: boolean;
  supplierDelayDays: number;
  emergencyDemandMultiplier: number;
  leadTimeBufferPct: number;
}

interface ScenarioSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (params: SimulationParameters) => void;
  onResetScenario: () => void;
  currentParams: SimulationParameters;
}

export const ScenarioSandboxModal: React.FC<ScenarioSandboxModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
  onResetScenario,
  currentParams
}) => {
  const [params, setParams] = useState<SimulationParameters>(currentParams);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'winter_surge',
      name: 'Winter Epidemic Surge',
      description: '+45% demand on Antibiotics & Cold items with 3-day supplier delay.',
      params: {
        winterSurgeEnabled: true,
        supplierDelayDays: 3,
        emergencyDemandMultiplier: 1.2,
        leadTimeBufferPct: 20
      }
    },
    {
      id: 'supply_crisis',
      name: 'Global Supply Chain Disruption',
      description: '+7 days transit delay on international API imports, freezing ROP buffers.',
      params: {
        winterSurgeEnabled: false,
        supplierDelayDays: 7,
        emergencyDemandMultiplier: 1.0,
        leadTimeBufferPct: 50
      }
    },
    {
      id: 'trauma_shock',
      name: 'Mass-Casualty Incident Shock',
      description: '+60% demand spike in ICU and Emergency IV fluids and resuscitation drugs.',
      params: {
        winterSurgeEnabled: false,
        supplierDelayDays: 1,
        emergencyDemandMultiplier: 1.6,
        leadTimeBufferPct: 15
      }
    }
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setParams(preset.params);
  };

  const handleApply = () => {
    onApplyScenario(params);
    onClose();
  };

  const handleReset = () => {
    setActivePreset(null);
    onResetScenario();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Hospital Supply Chain "What-If" Simulation Sandbox
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-slate-500 leading-relaxed">
            Test inventory resilience by simulating operational shocks. Observe how shortage risk scores, safety stocks, and replenishment triggers dynamically respond.
          </p>

          {/* Quick Presets */}
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Select Pre-Configured Clinical Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    activePreset === p.id
                      ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/60 ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-snug">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Controls */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                  Simulate Seasonal Winter Surge
                </span>
                <span className="text-[10px] text-slate-400">+45% Antibiotic & Analgesic consumption</span>
              </div>
              <input
                type="checkbox"
                checked={params.winterSurgeEnabled}
                onChange={e => {
                  setActivePreset(null);
                  setParams(prev => ({ ...prev, winterSurgeEnabled: e.target.checked }));
                }}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Supplier Delivery Delay Shock
                </span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                  +{params.supplierDelayDays} days
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={params.supplierDelayDays}
                onChange={e => {
                  setActivePreset(null);
                  setParams(prev => ({ ...prev, supplierDelayDays: Number(e.target.value) }));
                }}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Emergency & Trauma Demand Multiplier
                </span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                  {(params.emergencyDemandMultiplier * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={params.emergencyDemandMultiplier}
                onChange={e => {
                  setActivePreset(null);
                  setParams(prev => ({ ...prev, emergencyDemandMultiplier: Number(e.target.value) }));
                }}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
