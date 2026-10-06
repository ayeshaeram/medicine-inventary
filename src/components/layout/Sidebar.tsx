import React from 'react';
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Clock,
  Truck,
  LineChart,
  UploadCloud,
  BookOpen,
  Bell,
  Sliders,
  Sparkles,
  Download
} from 'lucide-react';

export type PageId =
  | 'home'
  | 'upload'
  | 'overview'
  | 'recommendations'
  | 'shortage'
  | 'expiry'
  | 'excess'
  | 'usage'
  | 'procurement'
  | 'forecast'
  | 'reports'
  | 'docs';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  badgeType?: 'stockout' | 'expiry' | 'general';
  badgeTitle?: string;
  isStep?: boolean;
}

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (id: PageId) => void;
  criticalAlertsCount?: number;
  nearExpiryCount?: number;
  onOpenSimulator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  criticalAlertsCount = 0,
  nearExpiryCount = 0,
  onOpenSimulator
}) => {
  const totalAlerts = criticalAlertsCount + nearExpiryCount;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Portal Home',
      icon: Home
    },
    {
      id: 'upload',
      label: '1. Upload Data (CSV/XLSX)',
      icon: UploadCloud,
      isStep: true
    },
    {
      id: 'overview',
      label: '2. Overview & Analytics',
      icon: LayoutDashboard,
      badgeCount: totalAlerts > 0 ? totalAlerts : undefined,
      badgeType: 'general',
      badgeTitle: `${totalAlerts} total active inventory alerts`,
      isStep: true
    },
    {
      id: 'recommendations',
      label: '3. Smart Recommendations',
      icon: Sparkles,
      badgeCount: criticalAlertsCount,
      badgeType: 'stockout',
      badgeTitle: `${criticalAlertsCount} critical interventions`,
      isStep: true
    },
    {
      id: 'reports',
      label: '4. Download Reports (PDF/Excel)',
      icon: Download,
      isStep: true
    },
    {
      id: 'shortage',
      label: 'Shortage Risk & Depletion',
      icon: AlertTriangle,
      badgeCount: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      badgeType: 'stockout',
      badgeTitle: `${criticalAlertsCount} critical stockout risks detected`
    },
    {
      id: 'expiry',
      label: 'Expiry & Wastage (FEFO)',
      icon: Clock,
      badgeCount: nearExpiryCount > 0 ? nearExpiryCount : undefined,
      badgeType: 'expiry',
      badgeTitle: `${nearExpiryCount} batches expiring within 30 days`
    },
    { id: 'excess', label: 'Excess & Dead Stock', icon: Boxes },
    { id: 'usage', label: 'Usage Trends & ADC', icon: TrendingUp },
    { id: 'procurement', label: 'Procurement & Vendors', icon: Truck },
    { id: 'forecast', label: 'Forecast & Orders', icon: LineChart },
    { id: 'docs', label: 'Problem & Methodology', icon: BookOpen }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Analytics Console
        </div>
        {totalAlerts > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/80 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>{totalAlerts} alerts</span>
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const hasBadge = item.badgeCount !== undefined && item.badgeCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              title={item.badgeTitle || item.label}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-teal-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>

              {/* Visual Notification Badge with Bell Icon */}
              {hasBadge && (
                <div className="flex items-center">
                  {item.badgeType === 'stockout' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs animate-pulse">
                      <Bell className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                      <span>{item.badgeCount}</span>
                    </span>
                  ) : item.badgeType === 'expiry' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                      <Bell className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span>{item.badgeCount}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      <Bell className="w-2.5 h-2.5 text-teal-400 shrink-0" />
                      <span>{item.badgeCount}</span>
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Interactive Scenario Sandbox Button */}
      {onOpenSimulator && (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={onOpenSimulator}
            className="w-full py-2 px-3 rounded-lg border border-teal-500/40 bg-teal-950/40 hover:bg-teal-900/50 text-teal-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>Scenario Simulator</span>
          </button>
        </div>
      )}

      {/* Hospital Unit Summary */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-300 mb-1">Clinical Facilities</div>
        <div className="text-slate-400 leading-snug">
          Central Pharmacy · ICU Satellite · Emergency Bay · Outpatient Care
        </div>
      </div>
    </aside>
  );
};
