import React, { useState, useRef, useEffect } from 'react';
import { FileText, Moon, Sun, RefreshCw, Bell, AlertTriangle, Clock, ArrowRight, X, Sparkles, LogOut, User, Building } from 'lucide-react';
import { OPERATIONAL_DATE } from '../../utils/analyticsEngine';
import { CriticalAlert } from '../../types/inventory';
import { PageId } from './Sidebar';
import { UserSession } from '../../types/auth';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExportPDF: () => void;
  onReloadSampleData: () => void;
  totalMedicinesCount: number;
  criticalAlerts: CriticalAlert[];
  nearExpiryCount: number;
  onNavigate: (page: PageId) => void;
  onToggleAIInsights: () => void;
  currentUser: UserSession | null;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
  facilityType?: 'hospital' | 'clinic' | 'pharmacy';
  onFacilityTypeChange?: (type: 'hospital' | 'clinic' | 'pharmacy') => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onExportPDF,
  onReloadSampleData,
  totalMedicinesCount,
  criticalAlerts = [],
  nearExpiryCount = 0,
  onNavigate,
  onToggleAIInsights,
  currentUser,
  onSignOut,
  onOpenAuthModal,
  facilityType = 'hospital',
  onFacilityTypeChange
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalUrgentCount = criticalAlerts.length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
          S
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Smart Med
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-none">
            Medicine Inventory & Shortage Intelligence
          </span>
        </div>
      </div>

      {/* Zone 2: Clean unboxed metadata with typographic separators */}
      <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Cycle: <strong className="font-mono text-slate-700 dark:text-slate-300">{OPERATIONAL_DATE}</strong></span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
        <span>Catalog: <strong className="font-mono text-slate-700 dark:text-slate-300">{totalMedicinesCount} SKUs</strong></span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
        <span>Currency: <strong className="font-mono text-teal-600 dark:text-teal-400 font-semibold">INR (₹)</strong></span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
        <div className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={facilityType}
            onChange={(e) => onFacilityTypeChange?.(e.target.value as any)}
            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 focus:outline-none cursor-pointer"
          >
            <option value="hospital" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Hospital (Inpatient/ICU)</option>
            <option value="clinic" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Outpatient Clinic</option>
            <option value="pharmacy" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Pharmacy & Dispensary</option>
          </select>
        </div>
      </div>

      {/* Zone 3: Actions + Notification Bell Button */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleAIInsights}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          title="Open AI Operational Bottleneck Insights"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">AI Insights</span>
        </button>

        <button
          type="button"
          onClick={onReloadSampleData}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          title="Reload fresh realistic 12-month sample dataset"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Reload Sample</span>
        </button>

        <button
          type="button"
          onClick={onExportPDF}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Audit PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>

        {/* Visual Notification Bell with Count Badge & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowAlertsDropdown(prev => !prev)}
            className={`relative p-2 rounded-md transition-colors cursor-pointer ${
              showAlertsDropdown
                ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label={`${totalUrgentCount} urgent inventory alerts`}
            title={`${totalUrgentCount} critical inventory alerts`}
          >
            <Bell className="w-4 h-4" />
            {totalUrgentCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold font-mono text-white shadow-xs animate-pulse">
                {totalUrgentCount}
              </span>
            )}
          </button>

          {/* Alerts Popover Menu */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs overflow-hidden">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Urgent Inventory Notifications ({totalUrgentCount})
                  </span>
                </div>
                <button
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {criticalAlerts.length > 0 ? (
                  criticalAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {alert.type === 'stockout' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {alert.title}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                            alert.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {alert.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400">
                          {alert.actionText}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAlertsDropdown(false);
                            if (alert.targetModule === 'Shortage Risk') onNavigate('shortage');
                            else if (alert.targetModule === 'Expiry & Wastage') onNavigate('expiry');
                            else if (alert.targetModule === 'Excess Inventory') onNavigate('excess');
                            else onNavigate('overview');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 cursor-pointer"
                        >
                          <span>View Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No critical stockout or expiry alerts detected.
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    onNavigate('shortage');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
                >
                  View All Shortages
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    onNavigate('expiry');
                  }}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  View All Expiries ({nearExpiryCount})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Account / Profile */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                {currentUser.name.split(',')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                {currentUser.role}
              </span>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              title="Sign Out to Hospital Portal Home"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
