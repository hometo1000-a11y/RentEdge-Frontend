'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, LogOut, User, ChevronDown, FilePlus2, ArrowLeftRight, FileText, Sun, Moon } from 'lucide-react';
import { api } from './api';
export type TenantView = 'listings' | 'my-properties' | 'my-documents' | 'profile';

interface TenantShellProps {
  activeView: TenantView;
  onViewChange: (view: TenantView) => void;
  onLogout?: () => void;
  onSwitchToOwner?: () => void;
  children: React.ReactNode;
}

const navItems: { id: TenantView; label: string; mobileLabel: string; icon: React.ElementType }[] = [
  { id: 'listings', label: 'Listings', mobileLabel: 'Listings', icon: Search },
  { id: 'my-properties', label: 'My Properties', mobileLabel: 'Properties', icon: Home },
  { id: 'my-documents', label: 'My Documents / My Rent Agreements', mobileLabel: 'Documents', icon: FileText },
];

function UserDropdown({ 
  onLogout, 
  onSwitchToOwner, 
  onViewChange,
  align = 'top',
  compact = false
}: { 
  onLogout?: () => void; 
  onSwitchToOwner?: () => void; 
  onViewChange?: (view: TenantView) => void;
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
        localStorage.setItem('rentedge_user_fullname', userData.fullName);
        localStorage.setItem('rentedge_user_email', userData.email);
      } catch (err) {
        setUserName(localStorage.getItem('rentedge_user_fullname') || 'User');
        setUserEmail(localStorage.getItem('rentedge_user_email') || '');
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
    localStorage.removeItem('rentedge_authenticated');
    localStorage.removeItem('rentedge_user_role');
    localStorage.removeItem('rentedge_lifecycle_state');
    localStorage.removeItem('rentedge_selected_property_id');
    localStorage.removeItem('rentedge_user_fullname');
    localStorage.removeItem('rentedge_user_email');
    onLogout?.();
    setOpen(false);
  };

  const doSwitchOwner = () => {
    localStorage.setItem('rentedge_user_role', 'owner');
    onSwitchToOwner?.();
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
                  onViewChange?.('profile');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:text-brand-purple transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-slate-850 group-hover:bg-purple-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-purple font-black" />
                </div>
                <span className="flex-1">My Profile</span>
              </button>

              {/* Switch to Property Owner */}
              <button
                onClick={doSwitchOwner}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-75 dark:hover:text-violet-350 transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-slate-850 group-hover:bg-violet-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="flex-1">Switch to Property Owner</span>
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
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Tenant</p>
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
            </div>

            {/* My Profile */}
            <button
              onClick={() => {
                onViewChange?.('profile');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:text-brand-purple transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-slate-850 group-hover:bg-purple-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <User className="w-3.5 h-3.5 text-brand-purple font-black" />
              </div>
              <span className="flex-1">My Profile</span>
            </button>

            {/* Switch to Property Owner */}
            <button
              onClick={doSwitchOwner}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-75 dark:hover:text-violet-350 transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-slate-850 group-hover:bg-violet-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="flex-1">Switch to Property Owner</span>
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

export default function TenantShell({ activeView, onViewChange, onLogout, onSwitchToOwner, children }: TenantShellProps) {
  const [userName, setUserName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('rentedge_user_fullname');
    setUserName(storedName || 'User');

    const savedTheme = localStorage.getItem('rentedge_theme');
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
      localStorage.setItem('rentedge_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rentedge_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F5EE] dark:bg-[#06130C] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex-col justify-between shrink-0 fixed top-0 left-0 h-full z-40">
        {/* Brand */}
        <div className="p-6 space-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Rent<span className="text-brand-purple">Edge</span>
            </span>
            <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-brand-purple/10 border border-purple-100 dark:border-brand-purple/20 text-[10px] font-bold uppercase tracking-wider text-brand-purple">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
              Tenant Portal
            </span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
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

            {/* Create Rent Agreement */}
            <button
              onClick={() => alert('Smart rental agreement creation interface coming soon!')}
              className="w-full flex items-start text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-850 dark:hover:text-white cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
              <span>Create Rent Agreement</span>
            </button>
          </nav>
        </div>

        {/* Sidebar User Dropdown */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <UserDropdown onLogout={onLogout} onSwitchToOwner={onSwitchToOwner} onViewChange={onViewChange} />
        </div>
      </aside>

      {/* ─── Main Content Area ──────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-60">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand + Tenant Portal badge */}
          <div className="flex items-center gap-2">
            <div className="lg:hidden relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-purple text-white font-bold shrink-0">
              <span className="text-xs font-extrabold tracking-tighter">RE</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-brand-purple/10 border border-purple-100 dark:border-brand-purple/20 text-[9px] font-bold uppercase tracking-wider text-brand-purple shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse shrink-0" />
              Tenant Portal
            </span>
          </div>

          {/* Controls: Theme Switcher + Whole Accounts Button */}
          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-650 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Whole Accounts Button (Mobile Only) */}
            <div className="lg:hidden shrink-0">
              <UserDropdown
                onLogout={onLogout}
                onSwitchToOwner={onSwitchToOwner}
                onViewChange={onViewChange}
                align="bottom"
                compact={true}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1F14]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 pt-2.5 pb-safe px-6 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {/* Listings */}
        <button
          onClick={() => onViewChange('listings')}
          className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer relative"
        >
          {activeView === 'listings' && (
            <motion.div
              layoutId="mobileActive"
              className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Search className={`w-5 h-5 transition-colors ${activeView === 'listings' ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wide truncate max-w-[80px] text-center ${activeView === 'listings' ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
            Listings
          </span>
        </button>

        {/* Properties */}
        <button
          onClick={() => onViewChange('my-properties')}
          className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer relative"
        >
          {activeView === 'my-properties' && (
            <motion.div
              layoutId="mobileActive"
              className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Home className={`w-5 h-5 transition-colors ${activeView === 'my-properties' ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wide truncate max-w-[80px] text-center ${activeView === 'my-properties' ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
            Properties
          </span>
        </button>

        {/* Agreement */}
        <button
          onClick={() => alert('Smart rental agreement creation interface coming soon!')}
          className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer relative"
        >
          <FilePlus2 className="w-5 h-5 text-slate-450 dark:text-slate-400 transition-colors hover:text-brand-purple" />
          <span className="text-[10px] font-black uppercase tracking-wide truncate max-w-[80px] text-center text-slate-450 dark:text-slate-400">
            Agreement
          </span>
        </button>

        {/* Documents */}
        <button
          onClick={() => onViewChange('my-documents')}
          className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer relative"
        >
          {activeView === 'my-documents' && (
            <motion.div
              layoutId="mobileActive"
              className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <FileText className={`w-5 h-5 transition-colors ${activeView === 'my-documents' ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wide truncate max-w-[80px] text-center ${activeView === 'my-documents' ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
            Documents
          </span>
        </button>
      </nav>
    </div>
  );
}
