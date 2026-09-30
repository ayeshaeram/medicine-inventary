import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Boxes,
  LineChart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  Building,
  KeyRound,
  Mail,
  Zap,
  Activity,
  Package,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import {
  UserSession,
  UserRole,
  DEMO_USERS,
  RegisteredAccount,
  getRegisteredAccounts,
  getAllAccounts,
  saveRegisteredAccount,
  saveActiveUserSession
} from '../../types/auth';
import { RawDataset } from '../../types/inventory';

interface LandingPageProps {
  onLogin: (user: UserSession) => void;
  rawDataset: RawDataset;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  rawDataset,
  darkMode,
  onToggleDarkMode
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Dynamic list of all saved accounts (demo + custom registered)
  const [accountsList, setAccountsList] = useState<RegisteredAccount[]>(() => getAllAccounts());

  // Reload accounts when modal opens
  useEffect(() => {
    setAccountsList(getAllAccounts());
  }, [showAuthModal]);

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpHospital, setSignUpHospital] = useState('Metropolitan General Hospital');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Chief Pharmacist');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);

  // Active Category Spotlight
  const [activeCategory, setActiveCategory] = useState<string>('Antibiotics');

  const categories = [
    { name: 'Antibiotics', items: '8 SKUs', note: 'Winter surge demand (+45%)', color: 'text-teal-600' },
    { name: 'Emergency Drugs', items: '8 SKUs', note: 'Zero-tolerance stockout vital items', color: 'text-rose-600' },
    { name: 'IV Fluids', items: '7 SKUs', note: 'High continuous volume across ICU & ER', color: 'text-blue-600' },
    { name: 'Cardiac', items: '8 SKUs', note: 'Predictable high-turnover chronic care', color: 'text-purple-600' },
    { name: 'Diabetic', items: '7 SKUs', note: 'High-value cold-chain insulin pens', color: 'text-amber-600' },
    { name: 'Analgesics', items: '8 SKUs', note: 'Post-op inpatient pain management', color: 'text-emerald-600' }
  ];

  // Handle Demo / Quick 1-Click Login
  const handleSelectAccount = (account: RegisteredAccount) => {
    saveActiveUserSession(account);
    onLogin(account);
  };
  const handleDemoLogin = handleSelectAccount;

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = signInEmail.trim().toLowerCase();
    if (!emailClean) {
      setAuthError('Please enter your work email.');
      return;
    }

    const allAccs = getAllAccounts();
    const matched = allAccs.find(u => u.email.toLowerCase() === emailClean);

    if (matched) {
      const updatedAccount: RegisteredAccount = {
        ...matched,
        lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      saveRegisteredAccount(updatedAccount);
      saveActiveUserSession(updatedAccount);
      onLogin(updatedAccount);
    } else {
      // Create session for newly signed in email and persist it
      const name = emailClean.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const newAccount: RegisteredAccount = {
        id: `usr-${Date.now()}`,
        name: formattedName,
        email: emailClean,
        role: 'Chief Pharmacist',
        hospitalName: 'General Hospital',
        department: 'Central Pharmacy',
        avatarInitials: formattedName.slice(0, 2).toUpperCase(),
        lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
        createdAt: new Date().toISOString().split('T')[0]
      };
      saveRegisteredAccount(newAccount);
      saveActiveUserSession(newAccount);
      onLogin(newAccount);
    }
  };

  // Handle Sign Up submission - Persists account permanently
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!signUpName.trim() || !signUpEmail.trim()) {
      setAuthError('Please complete all required fields.');
      return;
    }

    const emailClean = signUpEmail.trim().toLowerCase();

    // Check if email already exists
    const existing = getAllAccounts().find(a => a.email.toLowerCase() === emailClean);
    if (existing) {
      setAuthError('An account with this email is already registered. Please sign in instead.');
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
      hospitalName: signUpHospital.trim() || 'General Hospital',
      department: signUpRole === 'Emergency Ward Lead' ? 'Trauma & ICU' : 'Central Pharmacy & Supply Chain',
      avatarInitials: initials,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Permanently save the created account in localStorage
    saveRegisteredAccount(newAccount);
    saveActiveUserSession(newAccount);
    setAccountsList(getAllAccounts());

    setSignUpSuccessMessage('Account created and saved successfully! Redirecting...');
    setTimeout(() => {
      onLogin(newAccount);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            M
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              MediTrack Analytics
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 ml-2 border-l border-slate-300 dark:border-slate-700 pl-2">
              Hospital Medicine Inventory System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleDemoLogin(DEMO_USERS[0])}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <span>Guest Explorer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-md transition-colors cursor-pointer"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-12 pb-16 max-w-6xl mx-auto w-full text-center">
        {/* Trust pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 mb-6">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>Deployed Across ICU, Emergency, Outpatient & Central Pharmacy</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Eliminate Medicine Shortages & Prevent Expiry Wastage in Real Time
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
          MediTrack Analytics provides clinical pharmacy directors and hospital supply chain teams with deep predictive intelligence: <strong>stockout risk forecasting</strong>, <strong>FEFO expiry prevention</strong>, and <strong>working capital optimization</strong>.
        </p>

        {/* Main Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            className="px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Clinical Console</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin(DEMO_USERS[0])}
            className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Launch Live Demo (Guest Access)</span>
            <ArrowRight className="w-4 h-4 text-teal-600" />
          </button>
        </div>

        {/* 1-Click Role Login Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Instant Role Demo:</span>
          {DEMO_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => handleDemoLogin(user)}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer font-medium"
            >
              {user.name.split(',')[0]} ({user.role})
            </button>
          ))}
        </div>
      </section>

      {/* Live System Telemetry Strip */}
      <section className="bg-slate-900 text-white py-6 px-6 border-y border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">60 SKUs</div>
            <div className="text-xs text-slate-400 mt-0.5">Vital, Essential & Desirable Medicines</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">4 Units</div>
            <div className="text-xs text-slate-400 mt-0.5">OPD, ICU, Emergency, Central Pharmacy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">365 Days</div>
            <div className="text-xs text-slate-400 mt-0.5">Continuous Daily Telemetry Analyzed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">96.8%</div>
            <div className="text-xs text-slate-400 mt-0.5">Overall Order Fill Rate Target</div>
          </div>
        </div>
      </section>

      {/* Interactive Clinical Category Explorer */}
      <section className="px-6 py-14 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Clinical Category Coverage
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a clinical sector to inspect inventory parameters and demand characteristics
            </p>
          </div>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-2 sm:mt-0">
            60 Total Pre-Configured Medicines
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => {
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-teal-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className={`text-xs font-bold block ${cat.color}`}>{cat.name}</span>
                  <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">{cat.items}</span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 leading-snug">
                  {cat.note}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="px-6 py-12 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
            The Three Pillars of MediTrack Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg mx-auto mb-10">
            Algorithmic protection against clinical supply chain interruptions and financial inventory wastage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  1. Shortage Risk Score (SRS)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Evaluates daily consumption velocity against supplier delivery lead times and clinical criticality. Immediately flags vital antibiotics and resuscitation ampoules before inventory reaches zero.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <span>Prevents ICU & Emergency Disruptions</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  2. FEFO Expiry & Wastage Prevention
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  First-Expiry-First-Out algorithmic checks identify vulnerable batches expiring in &le;30 days that will not deplete naturally at current ward usage rates, recommending immediate lot transfers.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>Eliminates High-Value Write-Offs</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  3. AI Operational Bottleneck Diagnosis
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Powered by Gemini 3.8 Flash, MediTrack synthesizes complex telemetry to produce natural language briefings of the top three operational bottlenecks with prescribed immediate interventions.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                <span>Executive Decision Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>MediTrack Analytics · Clinical Medicine Inventory System</span>
          <div className="flex items-center gap-4">
            <button onClick={() => handleDemoLogin(DEMO_USERS[0])} className="hover:text-teal-600 cursor-pointer">
              Launch Demo
            </button>
            <button onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }} className="hover:text-teal-600 cursor-pointer">
              Sign In
            </button>
            <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="hover:text-teal-600 cursor-pointer">
              Create Account
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Sign In / Create Account */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {authMode === 'signin' ? 'Sign In to MediTrack' : 'Create Clinical Account'}
                </span>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  authMode === 'signin'
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  authMode === 'signup'
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {authError && (
                <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-md text-xs text-rose-700 dark:text-rose-300">
                  {authError}
                </div>
              )}

              {authMode === 'signin' ? (
                /* Sign In Form */
                <form onSubmit={handleSignInSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Institutional Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        placeholder="sarah.chen@stjudes-health.org"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    Sign In to Portal
                  </button>

                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <span className="relative bg-white dark:bg-slate-900 px-2 text-[11px] text-slate-400">
                      or 1-click select saved / demo account
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {accountsList.map(user => {
                      const isCustom = !DEMO_USERS.some(d => d.id === user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectAccount(user)}
                          className={`w-full p-2 rounded-md border flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isCustom
                              ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100/60'
                              : 'border-slate-200 dark:border-slate-700/80 hover:border-teal-500 hover:bg-teal-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px]">
                              {user.avatarInitials}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCustom && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-600 text-white font-mono">
                                    Saved
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">{user.role} · {user.hospitalName}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs">
                  {signUpSuccessMessage && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{signUpSuccessMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded border border-teal-200 dark:border-teal-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Your created account will remain permanently saved on this device.</span>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={e => setSignUpName(e.target.value)}
                        placeholder="Dr. Jordan Hayes"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hospital Affiliation
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={signUpHospital}
                        onChange={e => setSignUpHospital(e.target.value)}
                        placeholder="St. Jude Memorial Hospital"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Clinical Operational Role
                    </label>
                    <select
                      value={signUpRole}
                      onChange={e => setSignUpRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Chief Pharmacist">Chief Pharmacist</option>
                      <option value="Supply Chain Director">Supply Chain Director</option>
                      <option value="Emergency Ward Lead">Emergency Ward Lead</option>
                      <option value="Procurement Officer">Procurement Officer</option>
                      <option value="Clinical Auditor">Clinical Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Institutional Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={e => setSignUpEmail(e.target.value)}
                        placeholder="jordan.hayes@hospital.org"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer mt-3"
                  >
                    Create Account & Launch Console
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
