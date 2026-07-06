'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  X, 
  Clock, 
  Mail, 
  Phone,
  Sparkles,
  Calendar,
  IndianRupee,
  AlertTriangle,
  Trash2,
  CreditCard
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  property: string;
  propertyRent: number;
  // Rent cycle fields
  leaseStartDate: string | null;
  billingDay: number | null;
  nextDueDate: string | null;
  lastPaidDate: string | null;
  agreedRent: number | null;
  rentStatus: string;
  joinedAt: string;
  hasCycleSetup: boolean;
}


export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await api.getPropertyTenants();
      const mappedTenants: Tenant[] = data.map((t: any) => ({
        id: t.id,
        name: t.users.full_name,
        avatar: t.users.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        email: t.users.email,
        phone: t.users.phone || 'N/A',
        property: t.properties.property_name,
        propertyRent: t.properties.rent_amount || 0,
        leaseStartDate: t.lease_start_date || null,
        billingDay: t.billing_day || null,
        nextDueDate: t.next_due_date || null,
        lastPaidDate: t.last_paid_date || null,
        agreedRent: t.agreed_rent_amount || null,
        rentStatus: t.rent_status || 'paid',
        joinedAt: t.joined_at,
        hasCycleSetup: !!(t.billing_day && t.next_due_date)
      }));
      setTenants(mappedTenants);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  
  // Notification Toast state
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };



  const handleRemoveTenant = async (tenantId: string) => {
    try {
      setActionLoadingId(tenantId);
      await api.removeTenant(tenantId);
      triggerNotification('Tenant removed successfully.');
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      setConfirmRemoveId(null);
    } catch (err: any) {
      console.error('Failed to remove tenant:', err);
      triggerNotification(err.message || 'Failed to remove tenant.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg text-left relative">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold pointer-events-auto border border-slate-800"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-purple" />
            Tenant Management
          </h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold mt-1">
            Track rent cycles, mark payments, and manage active tenants across your properties.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="mb-6 relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by tenant name, email, or property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-brand-primary rounded-xl text-xs font-bold outline-none transition-colors"
        />
      </div>

      {/* Tenant List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">Loading tenants...</span>
          </div>
        ) : filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200/70 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-800/20 rounded-2xl p-5 hover:bg-white dark:hover:bg-slate-800/50 hover:border-brand-purple/40 hover:shadow-xs transition-all text-left space-y-4"
            >
              {/* Top Row: Identity + Status Badge */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-brand-primary p-[1.5px] shrink-0">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-black text-slate-800 dark:text-white text-xs">
                      {tenant.avatar}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 dark:text-white text-sm leading-none">{tenant.name}</span>
                      
                      {/* Rent Status Badge */}
                      {tenant.hasCycleSetup ? (
                        tenant.rentStatus === 'due' ? (
                          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-full text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider inline-flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Rent Due
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-full text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Paid
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider inline-flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Setup Required
                        </span>
                      )}
                    </div>
                    
                    <span className="block text-[11px] text-brand-purple dark:text-brand-purple font-extrabold uppercase tracking-wider">
                      {tenant.property}
                    </span>

                    <div className="flex items-center gap-3 pt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500 font-semibold flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {tenant.email}
                      </span>
                      {tenant.phone !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          {tenant.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Rent Cycle Data + Actions */}
              {tenant.hasCycleSetup ? (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Rent Cycle Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">
                    <div>
                      <span className="block text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Agreed Rent</span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                        ₹{(tenant.agreedRent || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Billing Day</span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {tenant.billingDay}{getOrdinalSuffix(tenant.billingDay!)} of every month
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Lease Start</span>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        {formatDate(tenant.leaseStartDate)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Last Paid</span>
                      <span className={`block text-xs font-bold mt-0.5 ${!tenant.lastPaidDate ? 'text-amber-600 dark:text-amber-400 italic' : 'text-slate-700 dark:text-slate-300'}`}>
                        {tenant.lastPaidDate ? formatDate(tenant.lastPaidDate) : 'Never Paid'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Next Due</span>
                      <span className={`block text-xs font-extrabold mt-0.5 ${
                        tenant.rentStatus === 'due' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {formatDate(tenant.nextDueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black rounded-xl inline-flex items-center gap-1.5">
                      {tenant.rentStatus === 'paid' ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cycle Current</>
                      ) : tenant.rentStatus === 'pending' ? (
                        <><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Proof Pending</>
                      ) : (
                        <><CreditCard className="w-3.5 h-3.5 text-red-500" /> Rent Due</>
                      )}
                    </span>

                    {confirmRemoveId === tenant.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRemoveTenant(tenant.id)}
                          disabled={actionLoadingId === tenant.id}
                          className="px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveId(tenant.id)}
                        className="p-2 border border-slate-200 dark:border-slate-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                        title="Remove Tenant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Legacy tenant without rent cycle setup */
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Rent cycle not configured. Remove and re-approve this tenant to set up billing.</span>
                  </div>
                  {confirmRemoveId === tenant.id ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRemoveTenant(tenant.id)}
                        disabled={actionLoadingId === tenant.id}
                        className="px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemoveId(tenant.id)}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer shrink-0"
                      title="Remove Tenant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs bg-slate-50/30 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            No tenants found
          </div>
        )}
      </div>
    </div>
  );
}
