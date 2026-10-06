/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { RawDataset, DataQualityReport, GlobalFilterState, MedicineAnalytics } from './types/inventory';
import { UserSession, DEMO_USERS, getActiveUserSession, saveActiveUserSession, clearActiveUserSession } from './types/auth';
import { generateRealisticSampleData } from './data/sampleGenerator';
import { cleanAndValidateDataset } from './utils/csvParser';
import { runInventoryAnalytics } from './utils/analyticsEngine';
import { generateInventoryPDF } from './utils/pdfExport';
import { Header } from './components/layout/Header';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { GlobalFilterBar } from './components/common/GlobalFilterBar';
import { AIInsightsDrawer } from './components/common/AIInsightsDrawer';
import { LandingPage } from './components/home/LandingPage';
import { ScenarioSandboxModal, SimulationParameters } from './components/common/ScenarioSandboxModal';
import { MedicineDetailModal } from './components/common/MedicineDetailModal';

// Pages
import { OverviewPage } from './components/pages/OverviewPage';
import { UsageTrendsPage } from './components/pages/UsageTrendsPage';
import { ShortageRiskPage } from './components/pages/ShortageRiskPage';
import { ExcessInventoryPage } from './components/pages/ExcessInventoryPage';
import { ExpiryWastagePage } from './components/pages/ExpiryWastagePage';
import { ProcurementPage } from './components/pages/ProcurementPage';
import { ForecastPage } from './components/pages/ForecastPage';
import { DataUploadPage } from './components/pages/DataUploadPage';
import { HowItWorksPage } from './components/pages/HowItWorksPage';
import { SmartRecommendationsPage } from './components/pages/SmartRecommendationsPage';
import { ReportsDownloadPage } from './components/pages/ReportsDownloadPage';

const INITIAL_FILTERS: GlobalFilterState = {
  dateRange: '365d',
  category: 'all',
  medicineId: 'all',
  department: 'all',
  supplier: 'all',
  searchQuery: ''
};

const DEFAULT_SIMULATION: SimulationParameters = {
  winterSurgeEnabled: false,
  supplierDelayDays: 0,
  emergencyDemandMultiplier: 1.0,
  leadTimeBufferPct: 0
};

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth User Session State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return getActiveUserSession();
  });

  // Active page: default to 'home' if no user session
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const saved = getActiveUserSession();
    return saved ? 'overview' : 'home';
  });

  // Save auth user
  const handleLogin = (user: UserSession, targetPage: PageId = 'overview') => {
    setCurrentUser(user);
    saveActiveUserSession(user);
    setCurrentPage(targetPage);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    clearActiveUserSession();
    setCurrentPage('home');
  };

  // AI Insights Drawer persistent state
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);

  // Interactive Scenario Simulator Modal state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>(DEFAULT_SIMULATION);

  // Interactive Medicine Detail Modal state
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<MedicineAnalytics | null>(null);

  // Global Toast Banner
  const [appToast, setAppToast] = useState<string | null>(null);

  // Facility Scope state (Hospital, Clinic, or Pharmacy)
  const [facilityType, setFacilityType] = useState<'hospital' | 'clinic' | 'pharmacy'>('hospital');

  // Initial Data Generation & Validation
  const [rawDataset, setRawDataset] = useState<RawDataset>(() => {
    const sample = generateRealisticSampleData();
    const { cleaned } = cleanAndValidateDataset(sample);
    return cleaned;
  });

  const [qualityReport, setQualityReport] = useState<DataQualityReport>(() => {
    const sample = generateRealisticSampleData();
    const { report } = cleanAndValidateDataset(sample);
    return report;
  });

  // Global Filters
  const [filters, setFilters] = useState<GlobalFilterState>(INITIAL_FILTERS);

  // Dynamic Dataset adjusted by Simulation Parameters
  const activeDataset = useMemo(() => {
    if (
      !simulationParams.winterSurgeEnabled &&
      simulationParams.supplierDelayDays === 0 &&
      simulationParams.emergencyDemandMultiplier === 1.0
    ) {
      return rawDataset;
    }

    // Apply simulation shock
    const simulatedMedicines = rawDataset.medicines.map(m => {
      const extraLead = simulationParams.supplierDelayDays;
      return {
        ...m,
        lead_time_days: m.lead_time_days + extraLead
      };
    });

    const simulatedConsumption = rawDataset.consumption.map(c => {
      let qty = c.quantity_used;
      if (simulationParams.emergencyDemandMultiplier > 1.0 && (c.department === 'Emergency' || c.department === 'ICU')) {
        qty = Math.round(qty * simulationParams.emergencyDemandMultiplier);
      }
      return { ...c, quantity_used: qty };
    });

    return {
      ...rawDataset,
      medicines: simulatedMedicines,
      consumption: simulatedConsumption
    };
  }, [rawDataset, simulationParams]);

  // Compute Full Analytical Engine Results
  const analytics = useMemo(() => {
    return runInventoryAnalytics(activeDataset, filters);
  }, [activeDataset, filters]);

  // Handle reload sample data
  const handleReloadSampleData = () => {
    const sample = generateRealisticSampleData();
    const { cleaned, report } = cleanAndValidateDataset(sample);
    setRawDataset(cleaned);
    setQualityReport(report);
    setFilters(INITIAL_FILTERS);
    setSimulationParams(DEFAULT_SIMULATION);
    setAppToast('Reset to fresh 12-month clinical baseline.');
    setTimeout(() => setAppToast(null), 3500);
  };

  // Handle simulated purchase order from modal
  const handleOrderSimulated = (medId: string, qty: number) => {
    // Increase stock for the first batch of this medicine
    setRawDataset(prev => {
      const updatedStock = prev.stock.map(b => {
        if (b.medicine_id === medId) {
          return { ...b, quantity_on_hand: b.quantity_on_hand + qty };
        }
        return b;
      });
      return { ...prev, stock: updatedStock };
    });
    setAppToast(`Simulated PO fulfilled: Added ${qty} units to inventory.`);
    setTimeout(() => setAppToast(null), 3500);
  };

  // Handle simulated batch transfer
  const handleTransferSimulated = (medId: string, batchNo: string, toDept: string) => {
    setRawDataset(prev => {
      const updatedStock = prev.stock.map(b => {
        if (b.batch_no === batchNo) {
          return { ...b, storage_location: toDept };
        }
        return b;
      });
      return { ...prev, stock: updatedStock };
    });
    setAppToast(`Batch #${batchNo} transferred to ${toDept}.`);
    setTimeout(() => setAppToast(null), 3500);
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    const topDepleted = [...analytics.medicineAnalytics]
      .sort((a, b) => b.shortage_risk_score - a.shortage_risk_score)
      .slice(0, 10);

    const topOverstocked = [...analytics.medicineAnalytics]
      .filter(m => m.is_overstocked)
      .sort((a, b) => b.excess_stock_value - a.excess_stock_value)
      .slice(0, 10);

    const nearExpiryBatches = [...analytics.batchExpiryDetails]
      .filter(b => b.days_to_expiry <= 60)
      .slice(0, 10);

    generateInventoryPDF({
      kpis: analytics.kpis,
      criticalAlerts: analytics.criticalAlerts,
      topDepleted,
      topOverstocked,
      nearExpiryBatches
    });
  };

  const handleFilterChange = (partial: Partial<GlobalFilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Should we show GlobalFilterBar? (Exclude from Home, Upload, and HowItWorks)
  const showFilterBar = currentPage !== 'home' && currentPage !== 'upload' && currentPage !== 'docs';

  // If on Home page, render LandingPage
  if (currentPage === 'home') {
    return (
      <LandingPage
        onLogin={handleLogin}
        rawDataset={rawDataset}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        onNavigateToUpload={() => handleLogin(currentUser || DEMO_USERS[0], 'upload')}
        onNavigate={(page) => handleLogin(currentUser || DEMO_USERS[0], page)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 3-Zone Top Bar Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        onExportPDF={handleExportPDF}
        onReloadSampleData={handleReloadSampleData}
        totalMedicinesCount={rawDataset.medicines.length}
        criticalAlerts={analytics.criticalAlerts}
        nearExpiryCount={analytics.kpis.expiring30DaysCount}
        onNavigate={setCurrentPage}
        onToggleAIInsights={() => setIsAIDrawerOpen(prev => !prev)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAuthModal={() => setCurrentPage('home')}
        facilityType={facilityType}
        onFacilityTypeChange={setFacilityType}
      />

      {/* Global Simulation Alert Banner if Active */}
      {(simulationParams.winterSurgeEnabled || simulationParams.supplierDelayDays > 0 || simulationParams.emergencyDemandMultiplier > 1.0) && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
            <span>
              Simulation Active: {simulationParams.supplierDelayDays > 0 ? `+${simulationParams.supplierDelayDays}d delay · ` : ''}
              {simulationParams.winterSurgeEnabled ? 'Winter surge (+45%) · ' : ''}
              {simulationParams.emergencyDemandMultiplier > 1.0 ? `Emergency demand ${(simulationParams.emergencyDemandMultiplier * 100).toFixed(0)}%` : ''}
            </span>
          </div>
          <button
            onClick={() => setSimulationParams(DEFAULT_SIMULATION)}
            className="px-2 py-0.5 bg-slate-950 text-amber-300 rounded font-mono text-[10px] hover:bg-slate-900 cursor-pointer"
          >
            End Simulation
          </button>
        </div>
      )}

      {/* App Toast Banner */}
      {appToast && (
        <div className="bg-teal-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{appToast}</span>
          <button onClick={() => setAppToast(null)} className="text-white hover:underline text-[11px] cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          criticalAlertsCount={analytics.kpis.highRiskCount}
          nearExpiryCount={analytics.kpis.expiring30DaysCount}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-7xl mx-auto">
            {/* Global Filter Bar */}
            {showFilterBar && (
              <GlobalFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            )}

            {/* Page Router */}
            {currentPage === 'overview' && (
              <OverviewPage
                analytics={analytics}
                rawDataset={activeDataset}
                onNavigate={setCurrentPage}
                onSelectMedicine={(med) => setSelectedMedForDetail(med)}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                facilityType={facilityType}
              />
            )}

            {currentPage === 'recommendations' && (
              <SmartRecommendationsPage
                medicineAnalytics={analytics.medicineAnalytics}
                batchExpiryDetails={analytics.batchExpiryDetails}
                criticalAlerts={analytics.criticalAlerts}
                onSelectMedicine={(med) => setSelectedMedForDetail(med)}
                facilityType={facilityType}
              />
            )}

            {currentPage === 'reports' && (
              <ReportsDownloadPage
                analytics={analytics}
                rawDataset={activeDataset}
                facilityType={facilityType}
              />
            )}

            {currentPage === 'usage' && (
              <UsageTrendsPage
                medicineAnalytics={analytics.medicineAnalytics}
                rawDataset={activeDataset}
                onSelectMedicine={(med) => setSelectedMedForDetail(med)}
              />
            )}

            {currentPage === 'shortage' && (
              <ShortageRiskPage
                medicineAnalytics={analytics.medicineAnalytics}
                onOrderClick={(med) => setSelectedMedForDetail(med)}
              />
            )}

            {currentPage === 'excess' && (
              <ExcessInventoryPage
                medicineAnalytics={analytics.medicineAnalytics}
                onSelectMedicine={(med) => setSelectedMedForDetail(med)}
              />
            )}

            {currentPage === 'expiry' && (
              <ExpiryWastagePage
                batchExpiryDetails={analytics.batchExpiryDetails}
                totalStockValue={analytics.kpis.totalStockValue}
                onSelectMedicineById={(medId) => {
                  const found = analytics.medicineAnalytics.find(m => m.medicine_id === medId);
                  if (found) setSelectedMedForDetail(found);
                }}
              />
            )}

            {currentPage === 'procurement' && (
              <ProcurementPage
                supplierMetrics={analytics.supplierMetrics}
                procurementRecords={activeDataset.procurement}
                medicineAnalytics={analytics.medicineAnalytics}
              />
            )}

            {currentPage === 'forecast' && (
              <ForecastPage
                medicineAnalytics={analytics.medicineAnalytics}
                rawDataset={activeDataset}
                onSelectMedicine={(med) => setSelectedMedForDetail(med)}
              />
            )}

            {currentPage === 'upload' && (
              <DataUploadPage
                rawDataset={rawDataset}
                qualityReport={qualityReport}
                onDatasetUpdate={(newDataset, newReport) => {
                  setRawDataset(newDataset);
                  setQualityReport(newReport);
                }}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'docs' && (
              <HowItWorksPage />
            )}
          </div>
        </main>
      </div>

      {/* Persistent AI Insights Drawer */}
      <AIInsightsDrawer
        analytics={analytics}
        onNavigate={setCurrentPage}
        isOpen={isAIDrawerOpen}
        onToggle={() => setIsAIDrawerOpen(prev => !prev)}
      />

      {/* Interactive Scenario Sandbox Simulator Modal */}
      <ScenarioSandboxModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentParams={simulationParams}
        onApplyScenario={(newParams) => {
          setSimulationParams(newParams);
          setAppToast('Applied what-if simulation parameters. Analytics recalibrated in real time.');
          setTimeout(() => setAppToast(null), 4000);
        }}
        onResetScenario={() => {
          setSimulationParams(DEFAULT_SIMULATION);
          setAppToast('Reset simulation parameters to hospital baseline.');
          setTimeout(() => setAppToast(null), 3000);
        }}
      />

      {/* Interactive Medicine SKU Detail & Action Modal */}
      <MedicineDetailModal
        medicine={selectedMedForDetail}
        batches={analytics.batchExpiryDetails}
        onClose={() => setSelectedMedForDetail(null)}
        onOrderSimulated={handleOrderSimulated}
        onTransferSimulated={handleTransferSimulated}
      />
    </div>
  );
}
