import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  ShieldCheck,
  Hospital,
  Activity
} from 'lucide-react';
import {
  UserSession,
  UserRole,
  RegisteredAccount,
  getAllAccounts,
  saveRegisteredAccount,
  saveActiveUserSession,
  verifyCredentials,
  INITIAL_ACCOUNTS
} from '../../types/auth';
import { RawDataset } from '../../types/inventory';
import { PageId } from '../layout/Sidebar';

interface LandingPageProps {
  currentUser?: UserSession | null;
  onLogin: (user: UserSession, targetPage?: PageId) => void;
  rawDataset: RawDataset;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToUpload?: () => void;
  onNavigate?: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onLogin,
  rawDataset,
  darkMode,
  onToggleDarkMode,
  onNavigateToUpload,
  onNavigate
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [targetPageAfterAuth, setTargetPageAfterAuth] = useState<PageId>('overview');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const authCardRef = useRef<HTMLDivElement>(null);

  // Dynamic list of accounts
  const [accountsList, setAccountsList] = useState<RegisteredAccount[]>(() => getAllAccounts());

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpFacilityName, setSignUpFacilityName] = useState('Central Health Center');
  const [signUpFacilityScope, setSignUpFacilityScope] = useState<'hospital' | 'clinic' | 'pharmacy'>('hospital');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Chief Pharmacist');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Feedback states
  const [authError, setAuthError] = useState<string | null>(null);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = signInEmail.trim().toLowerCase();
    if (!emailClean) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (!signInPassword) {
      setAuthError('Please enter your password.');
      return;
    }

    const verification = verifyCredentials(emailClean, signInPassword);
    if (!verification.success || !verification.account) {
      setAuthError(verification.error || 'Invalid email or password.');
      return;
    }

    saveActiveUserSession(verification.account);
    onLogin(verification.account, targetPageAfterAuth);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = signUpEmail.trim().toLowerCase();
    if (!signUpName.trim() || !emailClean || !signUpPassword.trim()) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    if (signUpPassword.trim().length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      return;
    }

    const allAccs = getAllAccounts();
    const existing = allAccs.find(a => a.email.toLowerCase() === emailClean);
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
      .slice(0, 2) || 'SM';

    const newAccount: RegisteredAccount = {
      id: `usr-${Date.now()}`,
      name: signUpName.trim(),
      email: emailClean,
      password: signUpPassword.trim(),
      role: signUpRole,
      hospitalName: signUpFacilityName.trim() || 'Smart Med Healthcare Facility',
      department: signUpRole === 'Emergency Ward Lead' ? 'Trauma & ICU' : 'Central Pharmacy & Supply Chain',
      avatarInitials: initials,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveRegisteredAccount(newAccount);
    saveActiveUserSession(newAccount);
    setAccountsList(getAllAccounts());

    setSignUpSuccessMessage('Account registered successfully! Entering Smart Med console...');
    setTimeout(() => {
      onLogin(newAccount, targetPageAfterAuth);
    }, 450);
  };

  const handleProtectedAction = (targetPage: PageId, actionName: string) => {
    if (currentUser) {
      onNavigate?.(targetPage);
    } else {
      setTargetPageAfterAuth(targetPage);
      setAuthMode('signin');
      setAuthNotice(`Please sign in with your email and password to access ${actionName}.`);
      authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAutofillCredentials = (email: string, pass: string = 'password123') => {
    setSignInEmail(email);
    setSignInPassword(pass);
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Clean Header Bar */}
      <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            S
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Med
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 ml-2 border-l border-slate-300 dark:border-slate-700 pl-2">
              Hospitals · Clinics · Pharmacies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300 hidden md:inline">
                Signed in as <strong className="font-semibold text-slate-900 dark:text-white">{currentUser.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => onNavigate?.('overview')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Go to Console
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  authMode === 'signin'
                    ? 'text-white bg-teal-600 hover:bg-teal-700 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  authMode === 'signup'
                    ? 'text-white bg-teal-600 hover:bg-teal-700 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-12 pb-8 max-w-5xl mx-auto w-full text-center">
        {/* Unboxed Facility Context Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
          <span>Facility Scope:</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Hospitals (ICU / Wards)</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Outpatient Clinics</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Retail & Hospital Pharmacies</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Medicine Inventory, Shortage & Wastage Analytics
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-3.5 leading-relaxed">
          Hospitals, outpatient clinics, and pharmacies face critical stockouts, excess inventory, and expiry losses because consumption patterns are complex. <strong>Smart Med</strong> analyzes stock, consumption, procurement, expiry, and demand records to reveal clear usage trends and automate inventory decisions.
        </p>
      </section>

      {/* Dedicated Email & Password Authentication Card */}
      <section ref={authCardRef} className="px-6 pb-12 max-w-md mx-auto w-full">
        {currentUser ? (
          /* When Already Signed In */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-base flex items-center justify-center mx-auto mb-3">
              {currentUser.avatarInitials || 'SM'}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser.role} · {currentUser.hospitalName}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {currentUser.email}
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => onNavigate?.('overview')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch Analytics Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('upload')}
                className="w-full py-2 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-teal-600" />
                <span>Upload Data (CSV / Excel)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Email & Password Authentication Card (No Guest Mode) */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md overflow-hidden">
            {/* Header Tabs */}
            <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`py-3 px-4 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In with Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`py-3 px-4 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Register New Account</span>
              </button>
            </div>

            <div className="p-5">
              {/* Notice when clicked an action */}
              {authNotice && (
                <div className="mb-3.5 p-2.5 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center justify-between">
                  <span>{authNotice}</span>
                  <button onClick={() => setAuthNotice(null)} className="text-teal-700 font-bold text-[11px] hover:underline cursor-pointer">
                    ✕
                  </button>
                </div>
              )}

              {/* Error banner */}
              {authError && (
                <div className="mb-3.5 p-2.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Success message */}
              {signUpSuccessMessage && (
                <div className="mb-3.5 p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{signUpSuccessMessage}</span>
                </div>
              )}

              {authMode === 'signin' ? (
                /* Sign In Form */
                <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        placeholder="e.g. sarah.chen@smartmed.org"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-8 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showSignInPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In with Email & Password</span>
                  </button>

                  {/* Registered Account Autofill Helpers */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1.5">
                      Quick Autofill for Registered Accounts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAutofillCredentials('sarah.chen@smartmed.org', 'password123')}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[10px]"
                      >
                        sarah.chen@smartmed.org
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutofillCredentials('ayeshaeram2005@gmail.com', 'password123')}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[10px]"
                      >
                        ayeshaeram2005@gmail.com
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Default password: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">password123</code>
                    </span>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      placeholder="e.g. Dr. Aisha Sharma"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Facility Scope
                    </label>
                    <select
                      value={signUpFacilityScope}
                      onChange={e => setSignUpFacilityScope(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="hospital">Hospital (Inpatient / ICU / Trauma)</option>
                      <option value="clinic">Outpatient Clinic</option>
                      <option value="pharmacy">Pharmacy & Dispensary</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpFacilityName}
                      onChange={e => setSignUpFacilityName(e.target.value)}
                      placeholder="e.g. City General Hospital or Metro Clinic"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Role / Department
                    </label>
                    <select
                      value={signUpRole}
                      onChange={e => setSignUpRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Chief Pharmacist">Chief Pharmacist</option>
                      <option value="Supply Chain Director">Supply Chain Director</option>
                      <option value="Emergency Ward Lead">Emergency Ward Lead</option>
                      <option value="Procurement Officer">Procurement Officer</option>
                      <option value="Clinical Auditor">Clinical Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      placeholder="e.g. aisha@hospital.org"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full px-3 py-2 pr-9 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    Create Account & Sign In
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4 Core Analytic Modules */}
      <section className="px-6 py-10 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
          Four Core Analytic Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <button
            type="button"
            onClick={() => handleProtectedAction('usage', 'Usage Trends')}
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
            onClick={() => handleProtectedAction('shortage', 'Shortage Risk')}
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
            onClick={() => handleProtectedAction('excess', 'Excess Inventory')}
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
            onClick={() => handleProtectedAction('expiry', 'Expiry & Wastage')}
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

      {/* Step-by-Step Decision Flow */}
      <section className="px-6 py-10 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            End-to-End Decision Flow
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <button
              type="button"
              onClick={() => handleProtectedAction('upload', 'Step 1: Upload Data')}
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
              onClick={() => handleProtectedAction('overview', 'Step 2: Overview & Analytics')}
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
              onClick={() => handleProtectedAction('recommendations', 'Step 3: Smart Recommendations')}
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
              onClick={() => handleProtectedAction('reports', 'Step 4: Download Reports')}
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
        Smart Med · Clinical Medicine Inventory Decision Support System · INR (₹)
      </footer>
    </div>
  );
};
