'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wallet, 
  Bell, 
  Plus, 
  LogOut, 
  Search, 
  X, 
  Check, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  unread: boolean;
}

export default function RentEdgeLayout({ children, onLogout }: LayoutProps) {
  // Navigation tabs
  const navigationTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'wallet', label: 'Payment History', icon: Wallet }
  ];

  // Active state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Notification Panel State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Overdue Rent Nudge',
      desc: 'Priya Nair (HSR Co-Living) rent is overdue by 3 days. Send UPI reminder.',
      time: '10m ago',
      type: 'alert',
      unread: true
    },
    {
      id: '2',
      title: 'Smart Lease Signed',
      desc: 'Aarav Sharma completed e-Stamping for Bandra Skyloft.',
      time: '2h ago',
      type: 'success',
      unread: true
    },
    {
      id: '3',
      title: 'Rent Collected',
      desc: 'Received ₹35,000 from Rohan Gupta via autopay NPCI node.',
      time: '1d ago',
      type: 'success',
      unread: false
    },
    {
      id: '4',
      title: 'Tenant Verification Cleared',
      desc: 'Neha Verma credit bureau and PAN logs verified successfully.',
      time: '2d ago',
      type: 'info',
      unread: false
    }
  ]);

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Custom Toasts State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'alert' }[]>([]);

  // Add a toast helper
  const addToast = (message: string, type: 'success' | 'alert' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Mock Form State
  const [newProperty, setNewProperty] = useState({ name: '', location: '', units: '', rent: '' });
  const [newTenant, setNewTenant] = useState({ name: '', property: '', rent: '', email: '', phone: '' });
  const [newUnit, setNewUnit] = useState({ property: '', unitNo: '', rent: '', deposit: '' });
  const [newPayment, setNewPayment] = useState({ tenant: '', amount: '', date: '', method: 'UPI' });

  // Mock Database State to make mock pages interactive
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);

  // Derived Values
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast('All notifications marked as read', 'success');
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Header Title mapping
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Landlord OS';
      case 'properties':
        return 'Properties';
      case 'tenants':
        return 'Tenants';
      case 'wallet':
        return 'Payment History';
      default:
        return 'RentEdge';
    }
  };

  // Context-aware big button info
  const getBigButtonInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { label: 'Add Property', id: 'add-property' };
      case 'properties':
        return { label: 'Add Unit', id: 'add-unit' };
      case 'tenants':
        return { label: 'New Tenant', id: 'add-tenant' };
      case 'wallet':
        return { label: 'Record Payment', id: 'add-payment' };
      default:
        return { label: 'Add Property', id: 'add-property' };
    }
  };

  // Form Submissions
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.name || !newProperty.location) return;

    const newObj = {
      id: Math.random().toString(),
      name: newProperty.name,
      location: newProperty.location,
      units: `${newProperty.units || 1} Units`,
      rent: `₹${parseInt(newProperty.rent || '15000').toLocaleString('en-IN')}/mo`,
      occupied: 0,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    };

    setPropertiesList([newObj, ...propertiesList]);
    addToast(`Property "${newProperty.name}" added successfully!`, 'success');
    setNewProperty({ name: '', location: '', units: '', rent: '' });
    setActiveModal(null);
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.property) return;

    const newObj = {
      id: Math.random().toString(),
      name: newTenant.name,
      property: newTenant.property,
      rent: `₹${parseInt(newTenant.rent || '25000').toLocaleString('en-IN')}`,
      score: 710,
      status: 'Cleared',
      phone: newTenant.phone || '+91 99999 88888',
      email: newTenant.email || 'tenant@rentedge.in'
    };

    setTenantsList([newObj, ...tenantsList]);
    addToast(`Tenant "${newTenant.name}" registered successfully!`, 'success');
    setNewTenant({ name: '', property: '', rent: '', email: '', phone: '' });
    setActiveModal(null);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.property || !newUnit.unitNo) return;

    // Update units count in property
    setPropertiesList((prev) =>
      prev.map((p) => {
        if (p.name === newUnit.property) {
          const num = parseInt(p.units) + 1;
          return { ...p, units: `${num} Units` };
        }
        return p;
      })
    );

    addToast(`Unit ${newUnit.unitNo} added to ${newUnit.property}!`, 'success');
    setNewUnit({ property: '', unitNo: '', rent: '', deposit: '' });
    setActiveModal(null);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.tenant || !newPayment.amount) return;

    const newObj = {
      id: Math.random().toString(),
      tenant: newPayment.tenant,
      amount: `₹${parseInt(newPayment.amount).toLocaleString('en-IN')}`,
      date: newPayment.date || 'Today',
      status: 'Settled',
      method: newPayment.method
    };

    setPaymentsList([newObj, ...paymentsList]);
    addToast(`UPI Payment of ${newObj.amount} recorded from ${newPayment.tenant}.`, 'success');
    setNewPayment({ tenant: '', amount: '', date: '', method: 'UPI' });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F19] text-[#0F172A] dark:text-slate-100 font-sans antialiased relative overflow-x-hidden">
      
      {/* TOAST SYSTEM */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
                toast.type === 'success'
                  ? 'bg-slate-900 border-white/10 text-white'
                  : 'bg-red-500 border-red-600 text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[#10B981] animate-pulse' : 'bg-white'}`} />
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-2 hover:opacity-85"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[260px] bg-[#0F172A] text-slate-300 flex-col justify-between border-r border-slate-800 z-30">
        <div>
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white font-black shadow-lg">
              <span className="text-base tracking-tighter">RE</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
              </span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">
                Rent<span className="text-[#A78BFA]">Edge</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                Landlord Node v1.4
              </span>
            </div>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="p-4 space-y-1.5 mt-4">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-200 focus:outline-none cursor-pointer ${
                    isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {/* Sliding Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 bg-[#7C3AED]/20 border-l-4 border-[#7C3AED] rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}

                  {/* Soft Hover Pill */}
                  {!isActive && hoveredTab === tab.id && (
                    <motion.div
                      layoutId="sidebarHoverPill"
                      className="absolute inset-0 bg-slate-800/50 rounded-xl -z-10"
                      transition={{ duration: 0.15 }}
                    />
                  )}

                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-[#A78BFA] scale-105' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Avatar & LogOut) */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#10B981] p-[2px] shadow-md">
                <div className="w-full h-full bg-[#0F172A] rounded-full flex items-center justify-center font-bold text-white text-xs">
                  RP
                </div>
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">Rajvardhan Pawar</span>
                <span className="block text-[10px] text-slate-500 font-semibold tracking-wide truncate">Landlord OS Premium</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (onLogout) onLogout();
                else addToast('Signing out secure landlord session...', 'success');
              }}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* OMNIPRESENT HEADER */}
      <header className="fixed top-0 left-0 right-0 md:left-[260px] h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 z-20">
        {/* Left Side: Page Title */}
        <div className="flex items-center gap-3">
          {/* Logo element visible only on mobile */}
          <div className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg bg-[#0F172A] text-white font-bold text-xs mr-1 shadow-sm">
            RE
          </div>
          <h1 className="text-base md:text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            {getHeaderTitle()}
          </h1>
        </div>

        {/* Right Side: Notification & Big Action Button */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          {/* THE BIG BUTTON CONCEPT */}
          <button
            onClick={() => setActiveModal(getBigButtonInfo().id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span className="hidden sm:inline">{getBigButtonInfo().label}</span>
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40 flex items-center justify-around px-4 pb-2">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2.5 w-20 h-full text-slate-400 transition-colors focus:outline-none cursor-pointer"
            >
              {/* Active sliding background pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileActivePill"
                  className="absolute inset-x-2 inset-y-1.5 bg-[#7C3AED]/10 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              {/* Glowing Top Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute top-0 w-8 h-1 bg-[#7C3AED] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              <Icon className={`w-5 h-5 transition-all duration-250 ${isActive ? 'text-[#7C3AED] scale-110' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-1 tracking-wide transition-colors duration-250 ${isActive ? 'text-[#7C3AED]' : 'text-slate-500/70'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* NOTIFICATION DRAWER / PANEL */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-[#7C3AED]" />
                  <span className="font-bold text-sm text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-[#7C3AED] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleNotificationClick(item.id);
                      if (item.id === '1') {
                        setActiveTab('dashboard');
                        setShowNotifications(false);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      item.unread
                        ? 'bg-[#7C3AED]/5 border-[#7C3AED]/20 shadow-xs'
                        : 'bg-slate-50/50 border-slate-100'
                    } hover:border-[#7C3AED]/30`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[11px] font-extrabold tracking-tight ${
                        item.type === 'alert'
                          ? 'text-red-500'
                          : item.type === 'success'
                          ? 'text-[#10B981]'
                          : 'text-[#7C3AED]'
                      }`}>
                        {item.title}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    {item.id === '1' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToast('UPI Autopay reminder dispatched successfully!', 'success');
                          handleNotificationClick('1');
                        }}
                        className="mt-2.5 px-3 py-1 bg-[#7C3AED] text-white text-[9px] font-extrabold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Nudge Now
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Secure RBI Ledger Logs
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DYNAMIC CONTENT AREA WITH CORRECT PADDING */}
      <main className="min-h-screen pt-20 pb-24 md:pb-6 px-4 md:px-8 md:pl-[284px] transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {/* If children are passed, we render children, otherwise we render the full interactive sub-pages */}
            {children ? (
              children
            ) : (
              <div>
                
                {/* 1. DASHBOARD VIEW */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="relative bg-[#0F172A] rounded-3xl p-6 text-white overflow-hidden shadow-xl border border-white/5">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#7C3AED]/25 via-indigo-600/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />
                      <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-1 bg-[#7C3AED]/30 text-[#A78BFA] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#7C3AED]/30">
                          <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                          Fintech Compliance Active
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                          Welcome Back, Rajvardhan
                        </h2>
                        <p className="text-xs text-slate-400 max-w-md font-medium">
                          Your automated NPCI UPI nodes are running. The system has automatically cleared 3 transactions this month.
                        </p>
                      </div>
                    </div>

                    {/* KPI Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      
                      {/* Metric 1 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#7C3AED]/20 transition-all duration-300">
                        <div>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Expected Collection
                          </span>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
                              ₹2,80,000
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              Expected
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-[10px] text-slate-500 font-bold">Monthly target rate</span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            +100% Reach
                          </span>
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#7C3AED]/20 transition-all duration-300">
                        <div>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Collected (UPI Rails)
                          </span>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-2xl font-black text-[#10B981] tracking-tight font-mono">
                              ₹2,45,000
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              87.5% Cleared
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#10B981] h-full rounded-full" style={{ width: '87.5%' }} />
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">3 of 4 Renters</span>
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#7C3AED]/20 transition-all duration-300">
                        <div>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Outstanding Dues
                          </span>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-2xl font-black text-red-500 tracking-tight font-mono">
                              ₹35,000
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                              1 Renter Pending
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-[10px] text-slate-400 font-semibold truncate">
                            Priya Nair rent overdue
                          </span>
                          <button
                            onClick={() => {
                              addToast('UPI Autopay remainder dispatched successfully!', 'success');
                            }}
                            className="text-[10px] font-extrabold text-[#7C3AED] hover:underline"
                          >
                            Nudge UPI
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Quick Overview Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Tenant Roster */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                            Active Tenant Roster
                          </span>
                          <button
                            onClick={() => setActiveTab('tenants')}
                            className="text-xs font-bold text-[#7C3AED] hover:underline"
                          >
                            View All
                          </button>
                        </div>

                        <div className="overflow-x-auto no-scrollbar">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                                <th className="pb-3 pl-2">Tenant</th>
                                <th className="pb-3">Property</th>
                                <th className="pb-3">Monthly Rent</th>
                                <th className="pb-3">Rent Score</th>
                                <th className="pb-3 text-right pr-2">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                              {tenantsList.length > 0 ? (
                                tenantsList.slice(0, 4).map((tenant) => (
                                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 pl-2">
                                      <span className="font-bold text-slate-800 block">{tenant.name}</span>
                                      <span className="text-[9px] text-slate-400 font-medium">{tenant.phone}</span>
                                    </td>
                                    <td className="py-3.5 text-slate-500 font-medium truncate max-w-[120px]">
                                      {tenant.property}
                                    </td>
                                    <td className="py-3.5 font-mono text-slate-800">{tenant.rent}</td>
                                    <td className="py-3.5">
                                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                                        tenant.score >= 740 ? 'text-[#7C3AED]' : 'text-slate-600'
                                      }`}>
                                        <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                                        {tenant.score}
                                      </span>
                                    </td>
                                    <td className="py-3.5 text-right pr-2">
                                      {tenant.status === 'Pending' ? (
                                        <button
                                          onClick={() => {
                                            addToast(`UPI remainder request pushed to ${tenant.name}`, 'success');
                                          }}
                                          className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[9px] font-extrabold rounded-lg shadow-sm transition-colors"
                                        >
                                          Remind
                                        </button>
                                      ) : (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-[#10B981] uppercase">
                                          Paid
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold">
                                    No tenants found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Quick Insights */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm space-y-4">
                        <span className="block text-xs uppercase font-extrabold tracking-wider text-slate-400">
                          RentEdge Insights
                        </span>
                        
                        <div className="space-y-3">
                          
                          <div className="p-3 bg-[#7C3AED]/5 border border-[#7C3AED]/10 rounded-xl space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED]">
                              <Sparkles className="w-4 h-4" />
                              <span>Rent Score Hub</span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 leading-normal font-medium">
                              All active tenants have verified credit scores. Average network score is <strong className="text-slate-800">731</strong> (Tier-1 Excellent).
                            </p>
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Autopay Mandates</span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 leading-normal font-medium">
                              3 of 4 tenants have activated e-Mandate auto-debit. Funds are deposited directly to your registered nodal bank account.
                            </p>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span>Agreement Expirations</span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 leading-normal font-medium">
                              HSR Smart Co-Living agreement expires in 45 days. Use the agreement portal to issue a renewal draft.
                            </p>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. PROPERTIES VIEW */}
                {activeTab === 'properties' && (
                  <div className="space-y-6">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Asset Management</span>
                        <h3 className="text-base font-extrabold text-slate-800 mt-0.5">Properties Portfolio</h3>
                      </div>
                      <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Total Registered Units: <strong className="text-slate-800">{propertiesList.length} Structures</strong>
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {propertiesList.map((prop) => (
                        <div
                          key={prop.id}
                          className="bg-white rounded-3xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-md hover:border-[#7C3AED]/20 transition-all duration-300 flex flex-col group"
                        >
                          <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                            <img
                              src={prop.image}
                              alt={prop.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/10">
                              {prop.units}
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-extrabold text-sm text-slate-800 tracking-tight leading-snug">
                                {prop.name}
                              </h4>
                              <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{prop.location}</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                              <div>
                                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Avg. Rental</span>
                                <span className="text-slate-800 font-mono font-extrabold">{prop.rent}</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Active Status</span>
                                <span className="text-slate-800 font-semibold">
                                  {prop.occupied} Units Active
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TENANTS VIEW */}
                {activeTab === 'tenants' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Occupancy Node</span>
                        <h3 className="text-base font-extrabold text-slate-800 mt-0.5">Tenant Registry</h3>
                      </div>
                      <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Total Renters: <strong className="text-slate-800">{tenantsList.length} Tenants</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {tenantsList.map((tenant) => (
                        <div
                          key={tenant.id}
                          className="bg-white p-5 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#7C3AED]/20 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 font-extrabold text-slate-800 text-sm flex items-center justify-center border border-slate-200">
                                {tenant.name ? tenant.name.split(' ').map((n: string) => n[0]).join('') : ''}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">{tenant.name}</h4>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-bold bg-[#7C3AED]/10 text-[#7C3AED] uppercase">
                                  Score: {tenant.score}
                                </span>
                              </div>
                            </div>
                            
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              tenant.status === 'Cleared'
                                ? 'bg-emerald-50 text-[#10B981]'
                                : 'bg-amber-50 text-amber-600'
                            }`}>
                              {tenant.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-500 font-semibold pt-2 border-t border-slate-50">
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Property</span>
                              <span className="text-slate-700 truncate max-w-[200px]">{tenant.property}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Rent</span>
                              <span className="text-slate-900 font-mono font-bold">{tenant.rent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Phone</span>
                              <span className="text-slate-700">{tenant.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
                              <span className="text-slate-700">{tenant.email}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                addToast(`Autopay pull request sent to ${tenant.name}`, 'success');
                              }}
                              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-extrabold shadow-sm transition-all duration-200"
                            >
                              Nudge UPI
                            </button>
                            <a
                              href={`tel:${tenant.phone}`}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-extrabold flex items-center justify-center transition-all duration-200"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. WALLET VIEW */}
                {activeTab === 'wallet' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      <div className="bg-white p-5 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between space-y-4 md:col-span-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Settlement Node</span>
                            <h4 className="text-base font-extrabold text-slate-800">Financial Ledger</h4>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                            UPI Router: IDFC-02Node
                          </span>
                        </div>

                        {/* Chart Mock */}
                        <div className="h-48 w-full bg-slate-50 rounded-2xl relative flex items-end p-4 border border-slate-100/60">
                          {/* Y Axis Mock */}
                          <div className="absolute left-3 top-3 bottom-3 flex flex-col justify-between text-[9px] text-slate-400 font-mono font-bold">
                            <span>₹3L</span>
                            <span>₹2L</span>
                            <span>₹1L</span>
                            <span>0</span>
                          </div>

                          {/* SVG Path Sparkline */}
                          <div className="w-full h-full pl-8 pr-4 py-2 relative">
                            <svg className="w-full h-full text-[#7C3AED]" viewBox="0 0 100 50" preserveAspectRatio="none">
                              {/* Grid lines */}
                              <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                              <line x1="0" y1="25" x2="100" y2="25" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                              <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                              
                              <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              
                              <path
                                d="M 0 45 Q 20 35 40 18 T 80 12 L 100 8"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />

                              <path
                                d="M 0 45 Q 20 35 40 18 T 80 12 L 100 8 L 100 50 L 0 50 Z"
                                fill="url(#chartGrad)"
                              />
                            </svg>
                            
                            {/* Points */}
                            <div className="absolute top-1/4 right-[2%] w-2 h-2 rounded-full bg-[#10B981] border border-white ring-4 ring-[#10B981]/25 animate-pulse" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold pt-2">
                          <span className="text-slate-400">Net Annual Yield</span>
                          <span className="text-slate-800 font-mono font-black text-sm">₹29,40,000 Expected</span>
                        </div>
                      </div>

                      {/* Summary Info */}
                      <div className="bg-[#0F172A] text-white p-5 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-44 h-44 bg-gradient-to-tr from-[#10B981]/15 to-transparent rounded-full -mr-12 -mb-12" />
                        
                        <div className="space-y-3.5 relative z-10">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPI Auto Settlement</span>
                          <h4 className="text-base font-black text-white">Nodal Escrow Wallet</h4>
                          
                          <div className="space-y-1">
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Ledger Balance</span>
                            <span className="text-2xl font-black text-white font-mono">₹2,45,000</span>
                          </div>

                          <div className="text-xs text-slate-400 leading-normal font-medium bg-white/5 border border-white/10 p-3 rounded-2xl">
                            All collections are secured via RBI regulated Nodal bank rails. Transfers are auto-settled to registered bank accounts in 6 hours.
                          </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-slate-800">
                          <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>UPI Node ID</span>
                            <span className="font-mono text-white">rentedge@icici</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Transaction Logs */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                          Recent Collections Ledger
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Showing last 4 logs
                        </span>
                      </div>

                      <div className="space-y-3">
                        {paymentsList.map((pay) => (
                          <div
                            key={pay.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-[#7C3AED]/20 transition-all duration-200 gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                pay.status === 'Settled'
                                  ? 'bg-emerald-50 text-[#10B981]'
                                  : 'bg-red-50 text-red-500'
                              }`}>
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs text-slate-800 block">{pay.tenant}</span>
                                <span className="text-[9.5px] text-slate-400 font-semibold">{pay.date} &bull; {pay.method}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <span className="font-mono text-xs font-black text-slate-800">{pay.amount}</span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                pay.status === 'Settled'
                                  ? 'bg-emerald-50 text-[#10B981]'
                                  : 'bg-red-50 text-red-500'
                              }`}>
                                {pay.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --------------------- MODALS & DIALOGS --------------------- */}

      <AnimatePresence>
        {activeModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
            />

            {/* Modal Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="pointer-events-auto bg-[#0F172A] border border-white/10 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-4"
              >
                {/* Modal Title Banner */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/10 rounded-xl text-[#A78BFA]">
                      {activeModal === 'add-property' && <Building2 className="w-5 h-5" />}
                      {activeModal === 'add-unit' && <Building className="w-5 h-5" />}
                      {activeModal === 'add-tenant' && <Users className="w-5 h-5" />}
                      {activeModal === 'add-payment' && <Wallet className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold tracking-tight text-white capitalize">
                        {activeModal.replace('-', ' ')}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {activeModal === 'add-property' && 'Add a new building to your portfolio.'}
                        {activeModal === 'add-unit' && 'Add an apartment or room unit to a property.'}
                        {activeModal === 'add-tenant' && 'Onboard a new renter and issue background logs.'}
                        {activeModal === 'add-payment' && 'Record an manual transaction into the ledger.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Forms Content */}
                {activeModal === 'add-property' && (
                  <form onSubmit={handleAddProperty} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Property Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newProperty.name}
                        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        placeholder="e.g. Prestige Heights Apartment"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Location / Address
                      </label>
                      <input
                        type="text"
                        required
                        value={newProperty.location}
                        onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        placeholder="e.g. Koramangala, Bengaluru"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Total Units
                        </label>
                        <input
                          type="number"
                          value={newProperty.units}
                          onChange={(e) => setNewProperty({ ...newProperty, units: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Avg. Monthly Rent
                        </label>
                        <input
                          type="number"
                          value={newProperty.rent}
                          onChange={(e) => setNewProperty({ ...newProperty, rent: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. 25000"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Create Property
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'add-unit' && (
                  <form onSubmit={handleAddUnit} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Select Property
                      </label>
                      <select
                        required
                        value={newUnit.property}
                        onChange={(e) => setNewUnit({ ...newUnit, property: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      >
                        <option value="" disabled>Choose property...</option>
                        {propertiesList.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Unit No / Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newUnit.unitNo}
                          onChange={(e) => setNewUnit({ ...newUnit, unitNo: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. 402-A"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Monthly Rent (₹)
                        </label>
                        <input
                          type="number"
                          value={newUnit.rent}
                          onChange={(e) => setNewUnit({ ...newUnit, rent: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. 28000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Security Deposit Guarantee (₹)
                      </label>
                      <input
                        type="number"
                        value={newUnit.deposit}
                        onChange={(e) => setNewUnit({ ...newUnit, deposit: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        placeholder="e.g. 50000"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Add Unit
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'add-tenant' && (
                  <form onSubmit={handleAddTenant} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Tenant Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        placeholder="e.g. Ananya Sen"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Select Building Property
                      </label>
                      <select
                        required
                        value={newTenant.property}
                        onChange={(e) => setNewTenant({ ...newTenant, property: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      >
                        <option value="" disabled>Choose property...</option>
                        {propertiesList.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Monthly Rent (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={newTenant.rent}
                          onChange={(e) => setNewTenant({ ...newTenant, rent: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. 25000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={newTenant.phone}
                          onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. +91 99887 76655"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newTenant.email}
                        onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        placeholder="e.g. tenant@domain.com"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Onboard Tenant
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'add-payment' && (
                  <form onSubmit={handleAddPayment} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Renter / Tenant
                      </label>
                      <select
                        required
                        value={newPayment.tenant}
                        onChange={(e) => setNewPayment({ ...newPayment, tenant: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      >
                        <option value="" disabled>Choose tenant...</option>
                        {tenantsList.map((t) => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Amount Received (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                          placeholder="e.g. 35000"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={newPayment.method}
                          onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                        >
                          <option value="UPI">UPI Autopay</option>
                          <option value="UPI Intent">UPI Intent</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash">Cash / Ledger Manual</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={newPayment.date}
                        onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Record Payment
                      </button>
                    </div>
                  </form>
                )}

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
