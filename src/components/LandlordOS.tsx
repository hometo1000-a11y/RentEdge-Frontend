'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  ShieldCheck,
  Inbox,
  User,
  ChevronRight,
  ChevronDown,
  LogOut,
  Layers,
  Settings,
  AlertTriangle,
  FileCheck,
  XCircle,
  Copy,
  Trash2,
  KeyRound,
  ArrowLeftRight,
  Home,
  Sun,
  Moon,
  BellRing,
  Phone,
  IndianRupee
} from 'lucide-react';
import OwnerMyProfile from './OwnerMyProfile';
import ListingWizard from './ListingWizard';
import PropertyDetail from './PropertyDetail';
import TenantManagement from './TenantManagement';
import FinancialManagement from './FinancialManagement';
import { Property, mockProperties } from './propertiesData';
import { api } from './api';

interface LandlordOSProps {
  onListAnotherProperty?: () => void;
  onLogout?: () => void;
  expectedRent?: number;
  propertyTitle?: string;
  totalUnits?: number;
}

// Removed AccessCodeEntry

// ─── Owner Account Dropdown (bottom-left corner) ──────────────────────────────
function OwnerUserDropdown({ 
  onLogout, 
  onSwitchToTenant,
  onViewChange,
  align = 'top',
  compact = false
}: { 
  onLogout?: () => void; 
  onSwitchToTenant?: () => void; 
  onViewChange?: (view: 'dashboard' | 'properties' | 'tenants' | 'financials' | 'settings') => void;
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
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
    localStorage.removeItem('Homtu_lifecycle_state');
    localStorage.removeItem('Homtu_selected_property_id');
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
    <div ref={ref} className="relative">
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
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">{userName}</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{userEmail}</p>
              <span className="inline-block text-[8px] uppercase tracking-wider font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mt-1.5">
                Verified Owner
              </span>
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
        className={`p-2 rounded-xl text-slate-655 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 relative ${
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
                        <p className="text-[11px] font-bold text-slate-850 dark:text-slate-200 leading-tight">
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
                              className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
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
                            className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-350 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-900/50 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
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

export default function LandlordOS({ 
  onListAnotherProperty, 
  onLogout,
  expectedRent = 25000,
  propertyTitle = 'Skyline Heights, BHK-2, Sector 62',
  totalUnits = 1
}: LandlordOSProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'tenants' | 'financials' | 'settings'>('dashboard');
  const [selectedProperty, setSelectedProperty] = useState<boolean>(false);
  const [showWizardInline, setShowWizardInline] = useState<boolean>(false);
  const [currentExpectedRent, setCurrentExpectedRent] = useState<number>(expectedRent);
  const [currentPropertyTitle, setCurrentPropertyTitle] = useState<string>(propertyTitle);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('Homtu_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
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

  // Toast confirmation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Properties State
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [selectedRegistryPropertyId, setSelectedRegistryPropertyId] = useState<string>('prop-1');
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  useEffect(() => {
    async function loadLandlordData() {
      try {
        const email = localStorage.getItem('Homtu_user_email') || '';
        const [allProps, requestsData, tenantsData] = await Promise.all([
          api.getProperties(),
          api.getJoinRequests(),
          api.getPropertyTenants()
        ]);
        const landlordProps = allProps.filter((p: any) => p.ownerEmail === email && p.status !== 'archived');
        setMyProperties(landlordProps);
        setAllRequests(requestsData);
        setAllTenants(tenantsData);
        if (landlordProps.length > 0) {
          setSelectedRegistryPropertyId(landlordProps[0].id);
        }
      } catch (err) {
        console.error('Error loading landlord data:', err);
      }
    }
    loadLandlordData();
  }, []);

  // Keep selectedRegistryPropertyId updated if myProperties changes and it becomes empty or invalid
  React.useEffect(() => {
    if (myProperties.length > 0 && !myProperties.some(p => p.id === selectedRegistryPropertyId)) {
      setSelectedRegistryPropertyId(myProperties[0].id);
    }
  }, [myProperties, selectedRegistryPropertyId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateJoinRequestStatus = async (requestId: string, status: 'approved' | 'rejected', leaseDate?: string) => {
    try {
      // Approve uses the leaseDate from the date picker
      const dateToSend = status === 'approved' ? (leaseDate || new Date().toISOString().split('T')[0]) : undefined;
      await api.updateJoinRequestStatus(requestId, status, dateToSend);
      showToast(`Join request successfully ${status}`);
      // Update local request status
      setAllRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      // Re-fetch landlord properties / data since approval might affect listing states or active tenants
      const email = localStorage.getItem('Homtu_user_email') || '';
      const allProps = await api.getProperties();
      const landlordProps = allProps.filter((p: any) => p.ownerEmail === email);
      setMyProperties(landlordProps);
    } catch (err: any) {
      console.error('Failed to update request:', err);
      showToast(err.message || 'Failed to update request status');
    }
  };

  // Removed handleGenerateCodeForUnit and handleRevokeCodeForUnit

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: Building2 },
    { id: 'properties', label: 'Properties', icon: Layers },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 120, damping: 15 } 
    }
  } as const;

  const handleMarkPaidInline = async (tenantId: string) => {
    try {
      await api.updateTenantRentStatus(tenantId, 'paid');
      showToast('Rent marked as paid!');
      const updatedTenants = await api.getPropertyTenants();
      setAllTenants(updatedTenants);
    } catch (err: any) {
      showToast(err.message || 'Failed to update rent status');
    }
  };

  const handleRemoveTenantInline = async (tenantId: string) => {
    if (!confirm('Are you sure you want to remove this tenant?')) return;
    try {
      await api.removeTenant(tenantId);
      showToast('Tenant removed successfully');
      setAllTenants(prev => prev.filter(t => t.id !== tenantId));
    } catch (err: any) {
      showToast(err.message || 'Failed to remove tenant');
    }
  };

  const activeRegProp = myProperties.find(p => p.id === selectedRegistryPropertyId) || myProperties[0];
  const propertyTenants = allTenants.filter(t => t.properties?.id === activeRegProp?.id && t.status === 'active');
  const propertyRequests = allRequests.filter(r => r.property_id === activeRegProp?.id && r.status === 'pending');
  const allActiveTenants = allTenants.filter(t => t.status === 'active');

  return (
    <div className="flex min-h-screen bg-[#F8F5EE] dark:bg-[#06130C] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-white/10 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-mint animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex-col justify-between shrink-0 fixed top-0 left-0 h-full z-40">
        <div className="p-6 space-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Rent<span className="text-brand-purple">Edge</span>
            </span>
            <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Owner Portal
            </span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedProperty(false);
                    setShowWizardInline(false);
                  }}
                  className={`w-full flex items-start text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative border border-transparent ${
                    isActive
                      ? 'bg-brand-purple text-white shadow-md shadow-sm dark:bg-brand-purple/20 dark:text-white dark:border-brand-purple/35 dark:shadow-[0_0_20px_rgba(1,65,28,0.10)]'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-850 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActive"
                      className="absolute inset-0 bg-brand-purple dark:bg-brand-purple/15 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom-left account dropdown */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <OwnerUserDropdown 
            onLogout={onLogout} 
            onSwitchToTenant={() => {
              localStorage.setItem('Homtu_user_role', 'tenant');
              onLogout?.();
            }} 
            onViewChange={(view) => setActiveTab(view)}
          />
        </div>
      </aside>

      {/* ─── Main Content Area ──────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-60">
        
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand + Portal badge */}
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

          {/* Controls: Theme Switcher + Whole Accounts Button */}
          <div className="flex items-center gap-2">
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
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Whole Accounts Button (Mobile Only) */}
            <div className="lg:hidden shrink-0">
              <OwnerUserDropdown
                onLogout={onLogout}
                onSwitchToTenant={() => {
                  localStorage.setItem('Homtu_user_role', 'tenant');
                  onLogout?.();
                }}
                onViewChange={(view) => setActiveTab(view)}
                align="bottom"
                compact={true}
              />
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0 p-4 sm:p-8">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW / DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {showWizardInline ? (
                  <ListingWizard 
                    onCancel={() => setShowWizardInline(false)}
                    onCompleteListing={async (data) => {
                      setShowWizardInline(false);
                      try {
                        const newProp = await api.createProperty({
                          title: data.address,
                          type: data.category,
                          price: data.rent,
                          depositMonths: 2,
                          totalUnits: data.totalUnits || 1,
                          images: data.images || []
                        });
                        
                        const email = localStorage.getItem('Homtu_user_email') || '';
                        const allProps = await api.getProperties();
                        const landlordProps = allProps.filter((p: any) => p.ownerEmail === email || p.ownerName === 'Rajvardhan Pawar');
                        setMyProperties(landlordProps);
                        
                        
                        const unitsCount = data.totalUnits || 1;
                        
                        setCurrentExpectedRent(data.rent);
                        setCurrentPropertyTitle(data.address);
                        setSelectedRegistryPropertyId(newProp.id);
                        showToast(`Property "${newProp.title}" listed successfully with ${newProp.totalUnits} unit(s)!`);
                      } catch (err: any) {
                        alert(err.message || 'Failed to list property');
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
                    {/* SECTION 1: Horizontal Property Selector Carousel */}
                    <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar scroll-smooth">
                      {myProperties.map(prop => {
                        const isSelected = prop.id === selectedRegistryPropertyId;
                        const propActiveTenants = allTenants.filter(t => t.properties?.id === prop.id && t.status === 'active').length;
                        return (
                          <button 
                            key={prop.id}
                            onClick={() => setSelectedRegistryPropertyId(prop.id)}
                            className={`shrink-0 w-64 p-4 rounded-3xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-sm' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-purple/50 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <img src={prop.images?.[0] || 'https://via.placeholder.com/150'} alt={prop.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-sm truncate">{prop.title}</h4>
                                <p className={`text-[10px] font-bold mt-0.5 truncate ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                                  {prop.property_code || prop.id.slice(0, 6)} • {prop.type}
                                </p>
                              </div>
                            </div>
                            <div className={`mt-4 pt-3 border-t flex justify-between items-center text-[11px] font-extrabold ${
                              isSelected ? 'border-purple-500/30 text-purple-100' : 'border-slate-100 dark:border-slate-800 text-slate-500'
                            }`}>
                              <span>Active Tenants</span>
                              <span className={`px-2 py-0.5 rounded-md ${
                                isSelected ? 'bg-purple-500/30 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>{propActiveTenants}</span>
                            </div>
                          </button>
                        );
                      })}
                      {myProperties.length === 0 && (
                        <div className="text-xs text-slate-400 p-4 font-bold border border-dashed rounded-3xl w-full text-center py-8">
                          No active properties. Create one to get started.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* SECTION 2: GLOBAL TENANT DIRECTORY (Moves below on Mobile) */}
                      <div className="w-full lg:w-72 shrink-0 order-3 lg:order-1 flex flex-col gap-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Global Directory</h3>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
                           {allActiveTenants.length > 0 ? allActiveTenants.map(t => (
                             <div key={t.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-2">
                               <div className="min-w-0">
                                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{t.users?.full_name}</p>
                                  <p className="text-[10px] text-brand-purple font-extrabold truncate">{t.properties?.property_name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${t.rent_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                      {t.rent_status}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">Due: {t.next_due_date ? new Date(t.next_due_date).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                               </div>
                               <div className="flex flex-col gap-1 shrink-0">
                                  <button className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Call">
                                    <Phone className="w-3.5 h-3.5"/>
                                  </button>
                               </div>
                             </div>
                           )) : (
                             <p className="text-xs text-slate-400 text-center py-8 font-bold">No active tenants across portfolio.</p>
                           )}
                        </div>
                      </div>

                      {/* Property Workspace Main Area */}
                      <div className="flex-1 flex flex-col gap-6 order-2 lg:order-2 min-w-0">
                        {activeRegProp ? (
                          <>
                          {/* SECTION 3: PROPERTY OVERVIEW */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                             <div>
                               <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeRegProp.title}</h2>
                               <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                                 <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase">{activeRegProp.property_code || activeRegProp.id.slice(0, 6)}</span>
                                 <span>{activeRegProp.type}</span>
                                 <span>•</span>
                                 <span className="text-brand-purple">₹{(activeRegProp.price || 0).toLocaleString()}/mo</span>
                               </p>
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto">
                               <button 
                                 onClick={() => {
                                   setCurrentPropertyTitle(activeRegProp.title);
                                   setCurrentExpectedRent(activeRegProp.price);
                                   setActiveTab('properties');
                                   setSelectedProperty(true);
                                 }}
                                 className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-black rounded-xl transition-colors cursor-pointer"
                               >
                                 Manage
                               </button>
                               <button 
                                 onClick={async () => {
                                   if(confirm('Are you sure you want to archive this property? It will be hidden from tenants.')) {
                                     try {
                                       await api.deleteProperty(activeRegProp.id);
                                       window.location.reload();
                                     } catch (e: any) { alert(e.message); }
                                   }
                                 }} 
                                 className="flex-1 sm:flex-none px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-[11px] font-black rounded-xl transition-colors cursor-pointer"
                               >
                                 Archive
                               </button>
                             </div>
                          </div>

                          {/* SECTION 6: PROPERTY INSIGHTS */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-3xl relative overflow-hidden group">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <IndianRupee className="w-3.5 h-3.5" /> Expected Collection
                                </p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                                  ₹{propertyTenants.reduce((sum, t) => sum + (t.agreed_rent_amount || activeRegProp.price), 0).toLocaleString()}
                                </p>
                             </div>
                             <div className="bg-white dark:bg-slate-900 border border-brand-purple/20 p-5 rounded-3xl relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-purple to-purple-400"></div>
                                <p className="text-[10px] text-brand-purple font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5" /> Active Tenants
                                </p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                                  {propertyTenants.length}
                                </p>
                             </div>
                             <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/30 p-5 rounded-3xl relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Dues Pending
                                </p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                                  {propertyTenants.filter(t => t.rent_status === 'due').length}
                                </p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* SECTION 5: ACTIVE TENANTS */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
                               <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-slate-900 dark:text-white flex items-center justify-between">
                                 <span>Active Tenants</span>
                                 <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md text-[9px]">{propertyTenants.length}</span>
                               </h3>
                               <div className="space-y-3 overflow-y-auto pr-2 flex-1 no-scrollbar">
                                 {propertyTenants.length > 0 ? propertyTenants.map(t => (
                                   <div key={t.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                                     <div className="flex justify-between items-start gap-4">
                                       <div className="min-w-0">
                                         <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{t.users?.full_name}</p>
                                         <p className="text-[10px] text-slate-500 font-bold mt-1">
                                           ₹{(t.agreed_rent_amount || 0).toLocaleString()} • Next Due: <span className="text-slate-700 dark:text-slate-300">{t.next_due_date ? new Date(t.next_due_date).toLocaleDateString() : 'N/A'}</span>
                                         </p>
                                       </div>
                                       <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${t.rent_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                         {t.rent_status}
                                       </span>
                                     </div>
                                     <div className="flex gap-2 mt-4">
                                       {t.rent_status === 'due' && (
                                         <button onClick={() => handleMarkPaidInline(t.id)} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer shadow-2xs">
                                           Mark Paid
                                         </button>
                                       )}
                                       <button onClick={() => handleRemoveTenantInline(t.id)} className="flex-1 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-[10px] font-black rounded-lg transition-colors cursor-pointer">
                                         Remove
                                       </button>
                                     </div>
                                   </div>
                                 )) : (
                                   <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                                        <Users className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                      </div>
                                      <p className="text-xs font-bold text-slate-400">No active tenants yet.</p>
                                      <p className="text-[10px] text-slate-400 mt-1">Approve join requests to see them here.</p>
                                   </div>
                                 )}
                               </div>
                            </div>

                            {/* SECTION 4: JOIN REQUESTS */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
                               <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-slate-900 dark:text-white flex items-center justify-between">
                                 <span>Join Requests</span>
                                 {propertyRequests.length > 0 && (
                                   <span className="bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-md text-[9px] animate-pulse">{propertyRequests.length} Pending</span>
                                 )}
                               </h3>
                               <div className="space-y-3 overflow-y-auto pr-2 flex-1 no-scrollbar">
                                 {propertyRequests.length > 0 ? propertyRequests.map(r => (
                                   <div key={r.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-xs">
                                     <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-brand-purple flex items-center justify-center text-xs font-black">
                                          {r.users?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                          <p className="font-bold text-sm text-slate-900 dark:text-white">{r.users?.full_name}</p>
                                          <p className="text-[10px] text-slate-400 font-bold">Requested: {new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-2">
                                       <button 
                                         onClick={() => {
                                           // We re-use the OwnerNotificationBell's state to approve
                                           const date = prompt('Enter rent cycle start date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
                                           if(date) handleUpdateJoinRequestStatus(r.id, 'approved', date);
                                         }} 
                                         className="flex-1 py-1.5 bg-brand-purple hover:bg-purple-650 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer shadow-2xs"
                                       >
                                         Approve
                                       </button>
                                       <button 
                                         onClick={() => handleUpdateJoinRequestStatus(r.id, 'rejected')} 
                                         className="flex-1 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                                       >
                                         Reject
                                       </button>
                                     </div>
                                   </div>
                                 )) : (
                                   <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                      </div>
                                      <p className="text-xs font-bold text-slate-400">All caught up.</p>
                                      <p className="text-[10px] text-slate-400 mt-1">No pending requests for this property.</p>
                                   </div>
                                 )}
                               </div>
                            </div>

                          </div>
                          </>
                        ) : (
                          <div className="py-12 text-center text-slate-400 font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                             Select a property to view workspace.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: PROPERTIES PORTFOLIO & DETAILS */}
            {activeTab === 'properties' && (
              <motion.div
                key="properties-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {selectedProperty ? (
                  <PropertyDetail 
                    propertyTitle={currentPropertyTitle}
                    onBack={() => setSelectedProperty(false)}
                    onDeleteSuccess={() => {
                      setSelectedProperty(false);
                      const updated = myProperties.filter(p => p.title !== currentPropertyTitle);
                      setMyProperties(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('Homtu_properties', JSON.stringify(updated));
                        
                        // Sync with all properties for tenant discovery
                        const savedAll = localStorage.getItem('Homtu_all_properties');
                        if (savedAll) {
                          try {
                            const allProps: Property[] = JSON.parse(savedAll);
                            localStorage.setItem('Homtu_all_properties', JSON.stringify(allProps.filter(p => p.title !== currentPropertyTitle)));
                          } catch (e) {}
                        }
                      }
                      if (updated.length > 0) {
                        setCurrentPropertyTitle(updated[0].title);
                        setCurrentExpectedRent(updated[0].price);
                      } else {
                        setCurrentPropertyTitle('No Properties Registered');
                        setCurrentExpectedRent(0);
                      }
                    }}
                  />
                ) : (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Properties Portfolio
                        </h3>
                        <p className="text-[10px] text-slate-455 font-bold mt-1">
                          Review unit specifications, active leases, and deletion guard states.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowWizardInline(true);
                        }}
                        className="px-3 py-1.5 bg-[#01411C] hover:bg-[#003B1F] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New
                      </button>
                    </div>

                    {myProperties.length > 0 ? (
                      <div className="space-y-4">
                        {myProperties.map((prop) => (
                          <div 
                            key={prop.id}
                            onClick={() => {
                              setCurrentPropertyTitle(prop.title);
                              setCurrentExpectedRent(prop.price);
                              setSelectedProperty(true);
                            }}
                            className="p-5 border border-slate-200 hover:border-[#01411C] bg-slate-50/50 hover:bg-white rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-650 shrink-0">
                                <Building2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">{prop.title}</h4>
                                <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                                  {prop.type} &bull; {prop.bhk || 2} BHK Config &bull; {prop.area || prop.city} &bull; ₹{prop.price.toLocaleString('en-IN')}/mo &bull; {(prop as any).totalUnits || prop.beds || 1} Unit(s)
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
                        <span>No properties registered in portfolio.</span>
                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            setShowWizardInline(true);
                          }}
                          className="block mx-auto text-indigo-600 hover:underline text-[11px]"
                        >
                          + Create first listing
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: SETTINGS HUB */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OwnerMyProfile onViewChange={(view) => setActiveTab(view as any)} />
              </motion.div>
            )}

            {/* TAB 4: TENANTS HUB */}
            {activeTab === 'tenants' && (
              <motion.div
                key="tenants-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TenantManagement />
              </motion.div>
            )}

            {/* TAB 5: FINANCIALS HUB */}
            {activeTab === 'financials' && (
              <motion.div
                key="financials-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FinancialManagement />
              </motion.div>
            )}

          </AnimatePresence>
          
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1F14]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 pt-2.5 pb-safe px-6 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedProperty(false);
                setShowWizardInline(false);
              }}
              className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActive"
                  className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
              <span className={`text-[10px] font-black uppercase tracking-wide truncate max-w-[80px] text-center ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
                {item.label === 'Overview' ? 'Overview' : item.label === 'Properties' ? 'Props' : item.label === 'Tenants' ? 'Tenants' : 'Settings'}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
