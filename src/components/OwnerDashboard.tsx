'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wallet, 
  FileCheck, 
  Plus, 
  BellRing, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  LogOut,
  Sparkles,
  Inbox,
  ShieldCheck,
  TrendingUp,
  Copy,
  Trash2,
  KeyRound,
  Calendar,
  User,
  ChevronDown,
  ArrowLeftRight,
  Sun,
  Moon,
  Search,
  HelpCircle,
  RotateCcw,
  CheckSquare2,
  Square
} from 'lucide-react';

import { Property } from './propertiesData';
import { api } from './api';
import PropertyManagement from './PropertyManagement';
import OwnerMyProfile from './OwnerMyProfile';
import TenantRequests from './TenantRequests';
import TenantManagement from './TenantManagement';
import RentManagement from './RentManagement';

interface OwnerDashboardProps {
  onLogout: () => void;
  onSwitchToTenant?: () => void;
  hasCompletedOnboarding?: boolean;
  onMarkOnboardingComplete?: () => void | Promise<void>;
}

interface AccessCodeEntry {
  id: string;
  propertyId: string;
  property: string;
  unitIndex: number;
  code: string;
  status: string;
  created: string;
}

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target: string;
};

function OnboardingChecklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-3 shadow-xs">
          {item.done ? (
            <CheckSquare2 className="w-5 h-5 text-brand-mint shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-slate-300 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-black ${item.done ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>{item.label}</p>
            <p className="text-[10px] text-slate-500 font-semibold">{item.done ? 'Completed' : 'Pending'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnerTourOverlay({
  open,
  step,
  onClose,
  onNext,
  onPrev,
  onFinish
}: {
  open: boolean;
  step: OnboardingStep | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}) {
  if (!open || !step) return null;
  const target = typeof document !== 'undefined' ? document.querySelector(step.target) as HTMLElement | null : null;
  const rect = target?.getBoundingClientRect();
  const highlightStyle = rect ? {
    top: Math.max(rect.top - 10, 16),
    left: Math.max(rect.left - 10, 16),
    width: Math.min(rect.width + 20, window.innerWidth - 32),
    height: rect.height + 20,
  } : undefined;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" onClick={onClose} />
      {highlightStyle && (
        <div
          className="absolute rounded-3xl border-2 border-brand-mint shadow-[0_0_0_9999px_rgba(2,6,23,0.35)] pointer-events-none transition-all duration-300"
          style={highlightStyle as any}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute z-[91] w-[min(92vw,360px)] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5"
        style={{
          top: rect ? Math.min(rect.bottom + 18, window.innerHeight - 220) : '50%',
          left: rect ? Math.min(rect.left, window.innerWidth - 380) : '50%',
          transform: rect ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-brand-purple">Owner Tour</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{step.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={onPrev} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200">Back</button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200">Skip</button>
            <button onClick={onNext} className="px-4 py-2 rounded-xl bg-brand-purple text-white text-sm font-black">{step.id === 'final' ? 'Start Listing' : 'Next'}</button>
          </div>
        </div>
        {step.id === 'final' && (
          <button onClick={onFinish} className="mt-3 w-full py-2.5 rounded-xl border border-brand-mint/30 bg-brand-mint/10 text-brand-mint text-sm font-black">
            Start Listing
          </button>
        )}
      </motion.div>
    </div>
  );
}

function OwnerUserDropdown({ 
  onLogout, 
  onSwitchToTenant,
  onViewChange,
  align = 'top',
  compact = false
}: { 
  onLogout?: () => void; 
  onSwitchToTenant?: () => void; 
  onViewChange?: (view: string) => void;
  align?: 'top' | 'bottom';
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.getMe();
        setUserName(userData.fullName);
        setUserEmail(userData.email);
        localStorage.setItem('Homtu_user_fullname', userData.fullName);
        localStorage.setItem('Homtu_user_email', userData.email);
      } catch (err) {
        setUserName(localStorage.getItem('Homtu_user_fullname') || 'User');
        setUserEmail(localStorage.getItem('Homtu_user_email') || '');
      }
    }
    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doLogout = () => {
    localStorage.removeItem('Homtu_authenticated');
    localStorage.removeItem('Homtu_user_role');
    localStorage.removeItem('Homtu_user_fullname');
    localStorage.removeItem('Homtu_user_email');
    onLogout?.();
    setOpen(false);
  };

  const doSwitchTenant = () => {
    localStorage.setItem('Homtu_user_role', 'tenant');
    onSwitchToTenant?.();
    setOpen(false);
  };

  if (compact) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 cursor-pointer border transition-all ${
            open
              ? 'bg-purple-100 dark:bg-brand-purple/25 border-brand-purple/40 text-brand-purple shadow-sm scale-95'
              : 'bg-purple-50 dark:bg-brand-purple/10 border-purple-100 dark:border-brand-purple/20 text-brand-purple hover:bg-purple-100 dark:hover:bg-brand-purple/20'
          }`}
          title="Account Menu"
        >
          {getInitials(userName)}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50"
            >
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium truncate">{userEmail}</p>
              </div>

              {/* My Profile */}
              <button
                onClick={() => {
                  onViewChange?.('settings');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:text-brand-purple transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-slate-850 group-hover:bg-purple-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-purple font-black" />
                </div>
                <span className="flex-1">My Profile</span>
              </button>

              {/* Switch to Tenant */}
              <button
                onClick={doSwitchTenant}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-75 dark:hover:text-violet-350 transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-slate-850 group-hover:bg-violet-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="flex-1">Switch to Tenant</span>
              </button>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              {/* Sign Out */}
              <button
                onClick={doLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-slate-850 group-hover:bg-red-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                </div>
                <span className="flex-1">Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center text-left gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
          open
            ? 'bg-purple-50 dark:bg-brand-purple/10 border-purple-200 dark:border-brand-purple/30 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-705'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple font-black text-xs shrink-0">
          {getInitials(userName)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Property Owner</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              align === 'bottom'
                ? 'right-0 top-full mt-2 w-56'
                : 'left-0 bottom-full mb-2 w-full'
            } bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50`}
          >
            {/* User info header */}
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium truncate">{userEmail}</p>
            </div>

            {/* My Profile */}
            <button
              onClick={() => {
                onViewChange?.('settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:text-brand-purple transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-slate-850 group-hover:bg-purple-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <User className="w-3.5 h-3.5 text-brand-purple font-black" />
              </div>
              <span className="flex-1">My Profile</span>
            </button>

            {/* Switch to Tenant */}
            <button
              onClick={doSwitchTenant}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-75 dark:hover:text-violet-350 transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-slate-850 group-hover:bg-violet-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="flex-1">Switch to Tenant</span>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            {/* Sign Out */}
            <button
              onClick={doLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-slate-850 group-hover:bg-red-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="flex-1">Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OwnerNotificationBell({
  requests,
  onUpdateRequest
}: {
  requests: any[];
  onUpdateRequest: (requestId: string, status: 'approved' | 'rejected', leaseDate?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [leaseStartDate, setLeaseStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const count = pendingRequests.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-xl text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 relative ${
          open ? 'bg-slate-100 dark:bg-slate-800' : ''
        }`}
        title="Notifications"
      >
        <BellRing className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Notifications
              </h4>
              {count > 0 && (
                <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[9px] font-black">
                  {count} New
                </span>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {count > 0 ? (
                pendingRequests.map(r => (
                  <div 
                    key={r.id} 
                    className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 space-y-2.5 text-left"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple font-black text-[10px] shrink-0">
                        {r.users?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          <span className="font-extrabold">{r.users?.full_name}</span> requested to join:
                        </p>
                        <p className="text-[10px] font-extrabold text-brand-purple mt-0.5 truncate">
                          {r.properties?.property_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {approvingId === r.id ? (
                        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 space-y-2.5">
                          <div>
                            <label className="block text-[9px] uppercase font-extrabold text-slate-500 tracking-wider mb-1">Rent Cycle Start Date</label>
                            <input
                              type="date"
                              value={leaseStartDate}
                              onChange={(e) => setLeaseStartDate(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await onUpdateRequest(r.id, 'approved', leaseStartDate);
                                setApprovingId(null);
                              }}
                              className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-2xs"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setApprovingId(null); setLeaseStartDate(new Date().toISOString().split('T')[0]); }}
                              className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setApprovingId(r.id);
                              setLeaseStartDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-2xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              await onUpdateRequest(r.id, 'rejected');
                            }}
                            className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-900/50 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 dark:text-slate-600 font-bold text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                  <span>No pending join requests.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OwnerDashboard({ onLogout, onSwitchToTenant, hasCompletedOnboarding = false, onMarkOnboardingComplete }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<string | null>(null);
  const [reminderSentMessage, setReminderSentMessage] = useState(false);
  const [isGeneratingAgreement, setIsGeneratingAgreement] = useState(false);
  const [agreementStep, setAgreementStep] = useState<'form' | 'success'>('form');
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [tourDismissed, setTourDismissed] = useState(false);
  const [showPublishPrompt, setShowPublishPrompt] = useState(false);
  const [draftPropertyReady, setDraftPropertyReady] = useState(false);
  const [paymentGateOpen, setPaymentGateOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [requestLeaseStartDate, setRequestLeaseStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('Homtu_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('Homtu_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('Homtu_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Agreement Form State
  const [agreementTenant, setAgreementTenant] = useState('');
  const [agreementProperty, setAgreementProperty] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Properties State
  const [myProperties, setMyProperties] = useState<Property[]>([]);

  // Selected property in registry dropdown
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [props, tenantsData, requestsData] = await Promise.all([
          api.getProperties(),
          api.getPropertyTenants(),
          api.getJoinRequests()
        ]);
        setMyProperties(props);
        if (props.length > 0) {
          setSelectedPropertyId(props[0].id);
        }
        setAllTenants(tenantsData);
        setAllRequests(requestsData);
      } catch (err) {
        console.error('Failed to load data in OwnerDashboard:', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem('Homtu_owner_onboarding_dismissed') === 'true';
    setTourDismissed(seen || hasCompletedOnboarding);
    if (!seen && !hasCompletedOnboarding) {
      const timer = window.setTimeout(() => setTourOpen(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      localStorage.setItem('Homtu_owner_onboarding_dismissed', 'true');
    }
  }, [hasCompletedOnboarding]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRentStatusToggle = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'due' : 'paid';
    
    // Optimistic update
    setAllTenants(prev => prev.map(t => t.id === tenantId ? { ...t, rent_status: newStatus } : t));
    showToast(`Rent status marked as ${newStatus.toUpperCase()}`);

    try {
      await api.updateTenantRentStatus(tenantId, newStatus);
      // Reload tenants to get updated cycle data from server
      const tenantsData = await api.getPropertyTenants();
      setAllTenants(tenantsData);
    } catch (err) {
      console.error('Failed to update rent status:', err);
      // Revert on error
      setAllTenants(prev => prev.map(t => t.id === tenantId ? { ...t, rent_status: currentStatus } : t));
      showToast('Failed to update rent status');
    }
  };

  const handleRemoveTenant = async (tenantId: string) => {
    if (!window.confirm("Are you sure you want to remove this tenant from the property?")) return;
    
    // Optimistic update
    const previousTenants = [...allTenants];
    setAllTenants(prev => prev.filter(t => t.id !== tenantId));
    showToast('Tenant removed successfully');

    try {
      await api.removeTenant(tenantId);
    } catch (err) {
      console.error('Failed to remove tenant:', err);
      setAllTenants(previousTenants);
      showToast('Failed to remove tenant');
    }
  };

  const handleUpdateJoinRequestStatus = async (requestId: string, status: 'approved' | 'rejected', leaseDate?: string) => {
    try {
      // Approve uses the leaseDate from the date picker or defaults to today
      const dateToSend = status === 'approved' ? (leaseDate || new Date().toISOString().split('T')[0]) : undefined;
      await api.updateJoinRequestStatus(requestId, status, dateToSend);
      showToast(`Join request successfully ${status}`);
      // Update local request status
      setAllRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      // Re-fetch tenants and properties if approved
      if (status === 'approved') {
        const [tenantsData, props] = await Promise.all([
          api.getPropertyTenants(),
          api.getProperties()
        ]);
        setAllTenants(tenantsData);
        setMyProperties(props);
      }
    } catch (err: any) {
      console.error('Failed to update request:', err);
      showToast(err.message || 'Failed to update request status');
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Landlord OS', icon: LayoutDashboard },
    { id: 'properties', label: 'My Properties', icon: Building2 },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'rent-management', label: 'Rent Payments', icon: Wallet },
    { id: 'disputes', label: 'Agreement Portal', icon: FileCheck }
  ];

  const tourSteps: OnboardingStep[] = [
    {
      id: 'dashboard',
      title: 'Welcome to RentEdge!',
      description: 'This is your owner dashboard where you can manage your rentals, track activity, and get started without any blocking setup.',
      target: '[data-tour="owner-dashboard"]'
    },
    {
      id: 'properties',
      title: 'List Property',
      description: 'Click here to add your first rental property.',
      target: '[data-tour="nav-properties"]'
    },
    {
      id: 'properties-page',
      title: 'Properties',
      description: 'All your listed properties will appear here.',
      target: '[data-tour="properties-tab"]'
    },
    {
      id: 'tenants',
      title: 'Tenants',
      description: 'Manage tenants, agreements, and occupancy from here.',
      target: '[data-tour="nav-tenants"]'
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'Track rent payments and earnings.',
      target: '[data-tour="nav-payments"]'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Update your account settings whenever needed.',
      target: '[data-tour="profile-menu"]'
    },
    {
      id: 'final',
      title: "Congratulations!",
      description: "You're ready to list your first property.",
      target: '[data-tour="owner-dashboard"]'
    }
  ];

  const onboardingChecklist = [
    { label: 'Complete Profile', done: Boolean(localStorage.getItem('Homtu_user_fullname')) },
    { label: 'List First Property', done: myProperties.length > 0 },
    { label: 'Add Payment Details', done: localStorage.getItem('Homtu_payment_details_completed') === 'true' },
    { label: 'Publish Property', done: myProperties.some((p: any) => p.status === 'published') }
  ];

  const currentTourStep = tourSteps[Math.min(tourIndex, tourSteps.length - 1)] || null;

  const handleSendReminder = (tenantName: string) => {
    setIsSendingReminder(true);
    setReminderTarget(tenantName);
    
    setTimeout(() => {
      setIsSendingReminder(false);
      setReminderSentMessage(true);
      setTimeout(() => setReminderSentMessage(false), 3000);
    }, 1500);
  };

  const handleGenerateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAgreement(true);
    setAgreementStep('form');
    
    // Simulate generation
    setTimeout(() => {
      setAgreementStep('success');
    }, 2000);
  };

  const restartTour = () => {
    setTourIndex(0);
    setTourOpen(true);
    setTourDismissed(false);
    localStorage.removeItem('Homtu_owner_onboarding_dismissed');
  };

  const finishTour = async () => {
    setTourOpen(false);
    setTourDismissed(true);
    localStorage.setItem('Homtu_owner_onboarding_dismissed', 'true');
    await onMarkOnboardingComplete?.();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  } as const;


  return (
    <div className="flex min-h-screen bg-[#F8F5EE] text-slate-800 transition-colors duration-300">
      
      {/* Toast Reminder Alert */}
      <AnimatePresence>
        {reminderSentMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-brand-mint" />
            <span>UPI Reminders sent to {reminderTarget} via Autopay gateway.</span>
          </motion.div>
        )}

        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-mint animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* Sidebar Container */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 flex-col justify-between shrink-0 fixed top-0 left-0 h-full z-40 p-5 shadow-sm">
          <div>
            <div className="flex flex-col gap-2 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Rent<span className="text-brand-purple">Edge</span>
              </span>
              <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-brand-purple/10 border border-purple-100 dark:border-brand-purple/20 text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                Owner Portal
              </span>
            </div>

            {/* Nav Links */}
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 no-scrollbar">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    data-tour={item.id === 'properties' ? 'nav-properties' : item.id === 'tenants' ? 'nav-tenants' : item.id === 'rent-management' ? 'nav-payments' : undefined}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/45 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-mint' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <OwnerUserDropdown 
              onLogout={onLogout} 
              onSwitchToTenant={onSwitchToTenant} 
              onViewChange={setActiveTab} 
              compact={false}
            />
          </div>
      </aside>

      {/* Dashboard Content */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-64 overflow-x-hidden">
        
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="lg:hidden relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-purple text-white font-bold shrink-0">
              <span className="text-xs font-extrabold tracking-tighter">RE</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Owner Portal
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2 ml-auto">
            {/* Real-time Notifications Bell */}
            <OwnerNotificationBell 
              requests={allRequests}
              onUpdateRequest={handleUpdateJoinRequestStatus}
            />

            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-655 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={restartTour}
              className="p-2 rounded-xl text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Restart onboarding tour"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Whole Accounts Button (Mobile Only) */}
            <div className="lg:hidden shrink-0">
              <OwnerUserDropdown
                onLogout={onLogout}
                onSwitchToTenant={onSwitchToTenant}
                onViewChange={setActiveTab}
                align="bottom"
                compact={true}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          {!tourDismissed && (
            <div className="mb-6">
              <OnboardingChecklist items={onboardingChecklist} />
            </div>
          )}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
                data-tour="owner-dashboard"
              >
                
                {/* 1. Property Selector Carousel */}
                <div className="flex overflow-x-auto gap-4 pt-3 pb-4 px-1 no-scrollbar items-center -mx-1">
                  {myProperties.map(prop => {
                    const pendingRequestsCount = allRequests.filter(r => r.properties.id === prop.id && r.status === 'pending').length;
                    return (
                      <button
                        key={prop.id}
                        onClick={() => setSelectedPropertyId(prop.id)}
                        className={`relative min-w-[200px] p-4 rounded-2xl border transition-all cursor-pointer text-left shrink-0 ${
                          selectedPropertyId === prop.id 
                            ? 'bg-brand-purple text-white border-brand-purple shadow-md' 
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-brand-purple/50'
                        }`}
                      >
                        {pendingRequestsCount > 0 && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white dark:border-slate-900 z-10">
                            {pendingRequestsCount}
                          </div>
                        )}
                        <h3 className="font-black text-sm truncate pr-3">{prop.property_name || prop.title}</h3>
                        <p className={`text-[10px] mt-1 font-extrabold uppercase tracking-widest ${selectedPropertyId === prop.id ? 'text-purple-200' : 'text-slate-450 dark:text-slate-400'}`}>
                          {prop.property_code || 'No Code'}
                        </p>
                      </button>
                    );
                  })}
                  {myProperties.length === 0 && (
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-500 w-full flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      No properties found. Please list a property to start managing.
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* 2. Global Tenant Panel (Left sidebar on desktop, stacked on mobile) */}
                  <div className="w-full xl:w-80 shrink-0 flex flex-col">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs flex flex-col min-h-[400px] xl:h-[calc(100vh-14rem)] sticky top-6">
                      <div className="mb-4">
                        <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-mint" />
                          Global Tenant Directory
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">All tenants across your portfolio</p>
                      </div>
                      
                      <div className="relative mb-4 shrink-0">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          placeholder="Search tenant..." 
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-brand-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar pb-4">
                        {allTenants.length > 0 ? allTenants.map(t => (
                          <div key={t.id} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 transition-colors hover:border-brand-purple/30 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate pr-2">{t.users.full_name}</h4>
                               <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 border ${
                                 t.rent_status === 'paid'
                                 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                                 : t.rent_status === 'pending'
                                 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                                 : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50'
                               }`}>
                                 {t.rent_status || 'due'}
                               </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {t.properties.property_name}
                            </p>
                            
                            {/* Actions visible on hover */}
                            <div className="hidden group-hover:flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">

                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleSendReminder(t.users.full_name); }}
                                 className="text-[8.5px] flex-1 py-1.5 px-1 font-black rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-purple hover:border-brand-purple/30 transition-colors uppercase tracking-widest"
                               >
                                 Remind
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleRemoveTenant(t.id); }}
                                 className="text-[8.5px] flex-1 py-1.5 px-1 font-black rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 transition-colors uppercase tracking-widest"
                               >
                                 Remove
                               </button>
                            </div>
                          </div>
                        )) : (
                          <div className="flex flex-col items-center justify-center h-32 text-center">
                            <Users className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-2" />
                            <p className="text-xs font-bold text-slate-400">No tenants found.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Selected Property Workspace */}
                  <div className="flex-1 min-w-0 space-y-6">
                    {myProperties.length > 0 && selectedPropertyId ? (
                      <>
                        {/* Property Overview */}
                        {(() => {
                          const activeProp = myProperties.find(p => p.id === selectedPropertyId);
                          if (!activeProp) return null;
                          return (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 dark:bg-brand-purple/10 rounded-bl-full -z-10" />
                              <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-brand-purple" />
                                Property Overview
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                  <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mb-1.5">Property Name</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{activeProp.property_name || activeProp.title}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mb-1.5">Access Code</p>
                                  <p className="text-xs font-black text-brand-purple dark:text-brand-purple bg-purple-50 dark:bg-brand-purple/10 px-2 py-1 rounded w-fit border border-purple-100 dark:border-brand-purple/20">{activeProp.property_code || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mb-1.5">Property Type</p>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-300 capitalize">{activeProp.property_type || 'Unknown'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mb-1.5">Listing Status</p>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${activeProp.status === 'published' ? 'bg-brand-mint' : 'bg-amber-500'}`} />
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 capitalize">{activeProp.status || 'Draft'}</p>
                                  </div>
                                </div>
                                <div className="col-span-2 md:col-span-4 mt-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                                  <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mb-1.5">Location Address</p>
                                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{activeProp.address || activeProp.location || 'Address not specified'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Property Tenants & Pending Requests Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Property Tenants */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col min-h-[300px]">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-5 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-violet-500" />
                                Active Tenants
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-[9px]">
                                {allTenants.filter(t => t.properties.id === selectedPropertyId).length}
                              </span>
                            </h3>
                            <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
                              {(() => {
                                const propTenants = allTenants.filter(t => t.properties.id === selectedPropertyId);
                                if (propTenants.length === 0) return (
                                  <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                                    <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">No active tenants</p>
                                  </div>
                                );
                                return propTenants.map(t => (
                                  <div key={t.id} className="p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black text-xs">
                                        {t.users.full_name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{t.users.full_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">{t.users.phone || 'No phone'}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setActiveTab('tenants')} className="text-[9px] font-black text-brand-purple hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-brand-purple/10 dark:hover:bg-brand-purple/20 px-2.5 py-1.5 rounded-lg transition-colors uppercase tracking-widest cursor-pointer">View</button>
                                      <button onClick={() => handleRemoveTenant(t.id)} className="text-[9px] font-black text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 px-2.5 py-1.5 rounded-lg transition-colors uppercase tracking-widest cursor-pointer">Remove</button>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>

                          {/* Pending Requests */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col min-h-[300px]">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-5 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <BellRing className="w-4 h-4 text-amber-500" />
                                Join Requests
                              </span>
                              <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[9px]">
                                {allRequests.filter(r => r.properties.id === selectedPropertyId && r.status === 'pending').length}
                              </span>
                            </h3>
                            <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
                              {(() => {
                                const propRequests = allRequests.filter(r => r.properties.id === selectedPropertyId && r.status === 'pending');
                                if (propRequests.length === 0) return (
                                  <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                                    <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">No pending requests</p>
                                  </div>
                                );
                                return propRequests.map(r => (
                                  <div key={r.id} className="p-4 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{r.users.full_name}</p>
                                      </div>
                                      <span className="text-[9px] font-black text-slate-500">Just now</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      {approvingRequestId === r.id ? (
                                        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 space-y-2.5">
                                          <div>
                                            <label className="block text-[9px] uppercase font-extrabold text-slate-500 tracking-wider mb-1">Rent Cycle Start Date</label>
                                            <input
                                              type="date"
                                              value={requestLeaseStartDate}
                                              onChange={(e) => setRequestLeaseStartDate(e.target.value)}
                                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={async () => {
                                                await handleUpdateJoinRequestStatus(r.id, 'approved', requestLeaseStartDate);
                                                setApprovingRequestId(null);
                                              }}
                                              className="flex-1 py-1.5 bg-brand-mint hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-2xs"
                                            >
                                              Confirm
                                            </button>
                                            <button
                                              onClick={() => { setApprovingRequestId(null); setRequestLeaseStartDate(new Date().toISOString().split('T')[0]); }}
                                              className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => {
                                              setApprovingRequestId(r.id);
                                              setRequestLeaseStartDate(new Date().toISOString().split('T')[0]);
                                            }}
                                            className="flex-1 py-2 bg-brand-mint text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-emerald-600 transition-colors shadow-sm"
                                          >
                                            Approve
                                          </button>
                                          <button 
                                            onClick={() => handleUpdateJoinRequestStatus(r.id, 'rejected')}
                                            className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-900/50 text-[10px] font-black rounded-xl cursor-pointer transition-colors"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Rent Management Panel Removed from here, moved to its own tab */}
                      </>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[600px] shadow-xs">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                          <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No Property Selected</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-2 max-w-sm">Select a property from the carousel above to view its overview, manage tenants, review requests, and track rent collections.</p>
                      </div>
                    )}
                  </div>

                </div>

              </motion.div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div data-tour="properties-tab">
                <PropertyManagement />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <OwnerMyProfile onViewChange={setActiveTab} />
              </motion.div>
            )}

            {/* Tenants Tab */}
            {activeTab === 'tenants' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <TenantRequests />
                <TenantManagement />
              </motion.div>
            )}

            {/* Rent Management Tab */}
            {activeTab === 'rent-management' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RentManagement />
              </motion.div>
            )}

            {/* Other tabs placeholders */}
            {activeTab !== 'dashboard' && activeTab !== 'properties' && activeTab !== 'settings' && activeTab !== 'tenants' && activeTab !== 'rent-management' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-xs text-center flex flex-col items-center min-h-[350px] justify-center"
              >
                <div className="w-12 h-12 bg-purple-50 text-brand-purple rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm font-semibold">
                  Track collections, generate instant invoices, audit compliance, and retrieve background verification logs directly from Indian bureaus.
                </p>
              </motion.div>
            )}
        </AnimatePresence>
        </main>
      </div>

      <OwnerTourOverlay
        open={tourOpen}
        step={currentTourStep}
        onClose={() => {
          setTourOpen(false);
          setTourDismissed(true);
          localStorage.setItem('Homtu_owner_onboarding_dismissed', 'true');
        }}
        onPrev={() => setTourIndex((i) => Math.max(i - 1, 0))}
        onNext={() => {
          if (tourIndex >= tourSteps.length - 1) {
            void finishTour();
            return;
          }
          setTourIndex((i) => Math.min(i + 1, tourSteps.length - 1));
        }}
        onFinish={() => void finishTour()}
      />

      {/* Generate Agreement Simulated Modal */}
      <AnimatePresence>
        {isGeneratingAgreement && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative overflow-hidden"
            >
              {agreementStep === 'form' ? (
                <form onSubmit={handleGenerateAgreement} className="space-y-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-purple mb-2">
                    <FileCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Generate Smart Agreement</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">Draft an instant verified digital e-stamped contract.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Tenant Name</label>
                      <input 
                        type="text" 
                        required 
                        value={agreementTenant}
                        onChange={(e) => setAgreementTenant(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                        placeholder="Tenant Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Property Name</label>
                      <input 
                        type="text" 
                        required 
                        value={agreementProperty}
                        onChange={(e) => setAgreementProperty(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                        placeholder="Property Name"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsGeneratingAgreement(false)}
                      className="px-4 py-2 border border-white/10 text-white rounded-xl text-xs hover:bg-white/5 cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-brand-purple text-white rounded-xl text-xs font-black hover:bg-purple-750 transition-colors shadow-md cursor-pointer"
                    >
                      Generate Stamp Draft
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-brand-mint text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-lg font-black text-white">Lease Agreement Drafted!</h3>
                  <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed font-semibold">
                    The Smart Agreement for {agreementTenant} has been generated and queued for e-stamping. Autopay mandate sent.
                  </p>

                  <div className="mt-6 p-4 bg-white/5 rounded-2xl flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-300">Contract Reference ID</span>
                    <span className="text-sm font-extrabold text-brand-purple mt-1.5 font-mono">CONTRACT-BG-9831</span>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={() => setIsGeneratingAgreement(false)}
                      className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-md cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Bottom Nav ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1F14]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 pt-2.5 pb-safe px-4 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 px-2 py-1 cursor-pointer relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveOwner"
                  className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
              <span className={`text-[9px] font-black uppercase tracking-wide truncate max-w-[60px] text-center ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
                {item.id === 'dashboard' ? 'Home' : item.id === 'properties' ? 'Props' : item.id === 'tenants' ? 'Tenants' : 'Legal'}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
