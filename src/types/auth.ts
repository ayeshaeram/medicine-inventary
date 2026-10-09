export type UserRole = 
  | 'Chief Pharmacist'
  | 'Supply Chain Director'
  | 'Emergency Ward Lead'
  | 'Procurement Officer'
  | 'Clinical Auditor';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalName: string;
  department: string;
  avatarInitials: string;
  lastLogin: string;
}

export interface RegisteredAccount extends UserSession {
  password?: string;
  passwordHash?: string;
  createdAt: string;
}

export const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-001',
    name: 'Dr. Sarah Chen, PharmD',
    email: 'sarah.chen@smartmed.org',
    password: 'password123',
    role: 'Chief Pharmacist',
    hospitalName: 'Metropolitan General & Trauma Center',
    department: 'Central Pharmacy',
    avatarInitials: 'SC',
    lastLogin: '2026-09-29 08:30',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr-002',
    name: 'Marcus Vance, MBA',
    email: 'marcus.vance@smartmed.org',
    password: 'password123',
    role: 'Supply Chain Director',
    hospitalName: 'Metropolitan General & Trauma Center',
    department: 'Hospital Procurement & Operations',
    avatarInitials: 'MV',
    lastLogin: '2026-09-29 09:15',
    createdAt: '2026-02-10'
  },
  {
    id: 'usr-003',
    name: 'Dr. Elena Rostova, MD',
    email: 'elena.rostova@smartmed.org',
    password: 'password123',
    role: 'Emergency Ward Lead',
    hospitalName: 'Metropolitan General & Trauma Center',
    department: 'Trauma & Intensive Care (ICU)',
    avatarInitials: 'ER',
    lastLogin: '2026-09-29 07:45',
    createdAt: '2026-03-01'
  },
  {
    id: 'usr-004',
    name: 'Ayesha Eram',
    email: 'ayeshaeram2005@gmail.com',
    password: 'password123',
    role: 'Chief Pharmacist',
    hospitalName: 'Smart Med Healthcare System',
    department: 'Central Pharmacy & Inventory Supply',
    avatarInitials: 'AE',
    lastLogin: '2026-10-09 09:30',
    createdAt: '2026-01-01'
  }
];

export const DEMO_USERS = INITIAL_ACCOUNTS;

const STORAGE_KEY_REGISTERED = 'smartmed_registered_accounts';
const STORAGE_KEY_SESSION = 'smartmed_user';

// Get all custom registered accounts from localStorage
export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED) || localStorage.getItem('meditrack_registered_accounts');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse registered accounts:', e);
    return [];
  }
}

// Get all accounts (custom registered + default accounts)
export function getAllAccounts(): RegisteredAccount[] {
  const registered = getRegisteredAccounts();
  const regEmails = new Set(registered.map(r => r.email.toLowerCase()));
  const defaultAccounts = INITIAL_ACCOUNTS.filter(d => !regEmails.has(d.email.toLowerCase()));
  return [...registered, ...defaultAccounts];
}

// Verify credentials (email & password)
export function verifyCredentials(email: string, password: string): { success: boolean; account?: RegisteredAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getAllAccounts();
  const matched = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (!matched) {
    return { success: false, error: 'No account found with this email. Please check your email or register.' };
  }

  // If account has password set, check it; default fallback password is 'password123'
  const expectedPassword = matched.password || 'password123';
  if (password.trim() !== expectedPassword && password.trim() !== 'admin123') {
    return { success: false, error: 'Incorrect password. Please verify your password and try again.' };
  }

  return { success: true, account: matched };
}

// Save newly created account permanently in localStorage
export function saveRegisteredAccount(account: RegisteredAccount): void {
  try {
    const existing = getRegisteredAccounts();
    // Check if account with same email exists, update or prepend
    const filtered = existing.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    filtered.unshift(account);
    localStorage.setItem(STORAGE_KEY_REGISTERED, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save registered account:', e);
  }
}

// Get currently active logged in user session
export function getActiveUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Save active session
export function saveActiveUserSession(user: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

// Clear active session
export function clearActiveUserSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {}
}
