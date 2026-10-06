import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Boxes,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  UploadCloud,
  Download,
  Building,
  KeyRound,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  UserSession,
  UserRole,
  DEMO_USERS,
  RegisteredAccount,
  getAllAccounts,
  saveRegisteredAccount,
  saveActiveUserSession
} from '../../types/auth';
import { RawDataset } from '../../types/inventory';

import { PageId } from '../layout/Sidebar';

interface LandingPageProps {
  onLogin: (user: UserSession, targetPage?: PageId) => void;
  rawDataset: RawDataset;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToUpload?: () => void;
  onNavigate?: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  rawDataset,
  darkMode,
  onToggleDarkMode,
  onNavigateToUpload,
  onNavigate
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedFacility, setSelectedFacility] = useState<'hospital' | 'clinic' | 'pharmacy'>('hospital');

  // Dynamic list of accounts
  const [accountsList, setAccountsList] = useState<RegisteredAccount[]>(() => getAllAccounts());

  useEffect(() => {
    setAccountsList(getAllAccounts());
  }, [showAuthModal]);

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpFacilityName, setSignUpFacilityName] = useState('Central Health Facility');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Chief Pharmacist');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);

  const handleSelectAccount = (account: RegisteredAccount, targetPage: PageId = 'overview') => {
    saveActiveUserSession(account);
    onLogin(account, targetPage);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const emailClean = signInEmail.trim().toLowerCase();

    const matched = accountsList.find(a => a.email.toLowerCase() === emailClean);
    if (!matched) {
      setAuthError('Email not recognized. Use quick access demo accounts or create an account.');
      return;
    }

    saveActiveUserSession(matched);
    onLogin(matched);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = signUpEmail.trim().toLowerCase();
    if (!signUpName.trim() || !emailClean || !signUpPassword.trim()) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    const existing = accountsList.find(a => a.email.toLowerCase() === emailClean);
    if (existing) {
      setAuthError('An account with this email already exists. Please sign in instead.');
      return;
    }

    const initials = signUpName
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'RX';

    const newAccount: RegisteredAccount = {
      id: `usr-${Date.now()}`,
      name: signUpName.trim(),
      email: emailClean,
      role: signUpRole,
      hospitalName: signUpFacilityName.trim() || 'Health Care System',
      department: signUpRole === 'Emergency Ward Lead' ? 'Trauma & ICU' : 'Central Pharmacy & Supply Chain',
      avatarInitials: initials,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveRegisteredAccount(newAccount);
    saveActiveUserSession(newAccount);
    setAccountsList(getAllAccounts());

    setSignUpSuccessMessage('Account created successfully! Entering console...');
    setTimeout(() => {
      onLogin(newAccount);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Clean Header Bar */}
      <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            M
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              MediTrack Analytics
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 ml-2 border-l border-slate-300 dark:border-slate-700 pl-2">
              Hospitals · Clinics · Pharmacies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSelectAccount(DEMO_USERS[0])}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Guest Demo
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-12 max-w-5xl mx-auto w-full text-center">
        {/* Unboxed Facility Context Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
          <span>Facility Scope:</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Hospitals</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Outpatient Clinics</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Retail & Hospital Pharmacies</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Medicine Inventory, Shortage & Wastage Analytics
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
          Hospitals and pharmacies face critical stockouts, excess inventory, and expiry losses because consumption patterns are complex. MediTrack analyzes stock, consumption, procurement, expiry, and demand records to reveal clear usage trends and automate inventory decisions.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => handleSelectAccount(DEMO_USERS[0])}
            className="px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Launch Analytics Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectAccount(DEMO_USERS[0]);
              onNavigateToUpload?.();
            }}
            className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Upload Data (CSV / Excel)</span>
          </button>
        </div>

        {/* 1-Click Role Quick Access Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick 1-Click Access:</span>
          {DEMO_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelectAccount(user)}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {user.name.split(',')[0]} ({user.role})
            </button>
          ))}
        </div>
      </section>

      {/* 4 Core Pillars Matching the Problem Statement */}
      <section className="px-6 py-10 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
          Four Core Analytic Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <button
            type="button"
            onClick={() => handleSelectAccount(DEMO_USERS[0], 'usage')}
            className="text-left bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-all hover:shadow-sm cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Usage Trends</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Analyzes historical consumption across wards, daily dispensation averages (ADC), and fast vs. slow movement.
            </p>
          </button>

          {/* Pillar 2 */}
          <button
            type="button"
            onClick={() => handleSelectAccount(DEMO_USERS[0], 'shortage')}
            className="text-left bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-all hover:shadow-sm cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Shortage Risk & Depletion</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Flags frequently depleted medicines when days of cover fall below supplier delivery lead times.
            </p>
          </button>

          {/* Pillar 3 */}
          <button
            type="button"
            onClick={() => handleSelectAccount(DEMO_USERS[0], 'excess')}
            className="text-left bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-all hover:shadow-sm cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Excess Inventory & Dead Stock</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Detects overstocked stock sitting beyond safe 60-day limits and non-moving items with zero 90-day usage.
            </p>
          </button>

          {/* Pillar 4 */}
          <button
            type="button"
            onClick={() => handleSelectAccount(DEMO_USERS[0], 'expiry')}
            className="text-left bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-all hover:shadow-sm cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Expiry & FEFO Wastage</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Tracks batch shelf lives to mandate First-Expiry-First-Out dispensing and prevent financial write-offs.
            </p>
          </button>
        </div>
      </section>

      {/* Step-by-Step Problem Solving Workflow */}
      <section className="px-6 py-10 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            End-to-End Decision Flow
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <button
              type="button"
              onClick={() => handleSelectAccount(DEMO_USERS[0], 'upload')}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between">
                <span>Step 1</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Upload Data</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Ingest CSV or multi-sheet Excel (.xlsx) records.</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAccount(DEMO_USERS[0], 'overview')}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between">
                <span>Step 2</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Overview & Analytics</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Automated telemetry audit across 5 core tables.</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAccount(DEMO_USERS[0], 'recommendations')}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between">
                <span>Step 3</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Smart Recommendations</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Actionable reorders, FEFO routing, & freezes.</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAccount(DEMO_USERS[0], 'reports')}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between">
                <span>Step 4</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">Download Reports</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Export executive PDF audits or master Excel files.</div>
            </button>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto py-6 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        MediTrack Analytics · Clinical Medicine Inventory Decision Support System · INR (₹)
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {authMode === 'signin' ? 'Sign In to Console' : 'Register New Account'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {authError}
              </div>
            )}

            {signUpSuccessMessage && (
              <div className="mt-3 p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
                {signUpSuccessMessage}
              </div>
            )}

            {authMode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="pharmacist@hospital.org"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Sign In
                </button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError(null);
                    }}
                    className="text-teal-600 font-semibold hover:underline cursor-pointer"
                  >
                    Create one
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                    placeholder="Dr. Aisha Sharma"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Facility Name (Hospital, Clinic, or Pharmacy)
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpFacilityName}
                    onChange={e => setSignUpFacilityName(e.target.value)}
                    placeholder="City General Hospital or Care Clinic"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Clinical / Operational Role
                  </label>
                  <select
                    value={signUpRole}
                    onChange={e => setSignUpRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Chief Pharmacist">Chief Pharmacist</option>
                    <option value="Hospital Director">Medical Director / Clinic Lead</option>
                    <option value="Procurement Officer">Procurement & Purchasing Manager</option>
                    <option value="Emergency Ward Lead">Emergency / Dispensary Lead</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    placeholder="aisha@hospital.org"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Create & Launch
                </button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthError(null);
                    }}
                    className="text-teal-600 font-semibold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
