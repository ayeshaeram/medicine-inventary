import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface MetricTooltipProps {
  title: string;
  formula: string;
  clinicalSignificance?: string;
  className?: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({
  title,
  formula,
  clinicalSignificance,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
        aria-label={`Formula details for ${title}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs pointer-events-none transition-opacity duration-150 border border-slate-700">
          <div className="font-semibold text-teal-400 mb-1">{title}</div>
          <div className="mb-1 font-mono text-[11px] text-slate-200 bg-slate-800 p-1.5 rounded border border-slate-700/60">
            {formula}
          </div>
          {clinicalSignificance && (
            <div className="text-slate-300 text-[11px] leading-relaxed mt-1">
              <span className="font-semibold text-slate-400">Impact: </span>
              {clinicalSignificance}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
