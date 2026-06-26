'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Clock, Search, MapPin, Mail, Phone, Calendar, Hash } from 'lucide-react';
import { api } from './api';

interface JoinRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  properties: {
    id: string;
    property_name: string;
    property_code: string;
  };
}

export default function TenantRequests() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getJoinRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load join requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [leaseStartDate, setLeaseStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(requestId);
      const dateToSend = status === 'approved' ? leaseStartDate : undefined;
      await api.updateJoinRequestStatus(requestId, status, dateToSend);
      // Update local state
      setRequests(requests.map(req => req.id === requestId ? { ...req, status } : req));
      setApprovingId(null);
      setLeaseStartDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      console.error('Failed to update request:', err);
      alert(err.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.status === 'pending' && (
      r.users.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.properties.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.properties.property_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg text-left relative overflow-hidden">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-purple" />
            Tenant Join Requests
          </h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold mt-1">
            Review and approve property access requests from tenants using your property codes.
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
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-brand-purple rounded-xl text-xs font-bold outline-none transition-colors"
        />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">Loading requests...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200/70 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-800/20 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-white dark:hover:bg-slate-800/50 hover:border-brand-purple/40 hover:shadow-xs transition-all text-left"
            >
              {/* Identity & Contact */}
              <div className="flex items-start gap-4 xl:w-1/3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-mint p-[1.5px] shrink-0">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-black text-slate-800 dark:text-white text-xs">
                    {req.users.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <span className="font-black text-slate-900 dark:text-white text-sm block truncate">{req.users.full_name}</span>
                  
                  <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {req.users.email}
                    </span>
                    {req.users.phone && (
                      <span className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {req.users.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Property & Request Details */}
              <div className="flex flex-col sm:flex-row gap-6 xl:w-1/2">
                <div className="space-y-1 flex-1">
                  <span className="block text-[9px] uppercase font-extrabold text-slate-400">Target Property</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{req.properties.property_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Hash className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                      {req.properties.property_code}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:w-32 shrink-0">
                  <span className="block text-[9px] uppercase font-extrabold text-slate-400">Request Date</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  
                  <div className="mt-2">
                    {req.status === 'pending' && (
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 rounded text-[9px] font-black text-amber-600 uppercase tracking-wider inline-flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Pending
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[9px] font-black text-emerald-600 uppercase tracking-wider inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="px-2 py-0.5 bg-red-50 border border-red-100 rounded text-[9px] font-black text-red-600 uppercase tracking-wider inline-flex items-center gap-1">
                        <XCircle className="w-2.5 h-2.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 xl:w-auto shrink-0 border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
                {req.status === 'pending' ? (
                  approvingId === req.id ? (
                    <div className="space-y-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 min-w-[200px]">
                      <div>
                        <label className="block text-[9px] uppercase font-extrabold text-slate-500 tracking-wider mb-1">Rent Cycle Start Date</label>
                        <input
                          type="date"
                          value={leaseStartDate}
                          onChange={(e) => setLeaseStartDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                        />
                        <p className="text-[9px] text-slate-400 font-medium mt-1">First rent due: {(() => {
                          const d = new Date(leaseStartDate);
                          const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
                          const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
                          const day = Math.min(d.getDate(), lastDay);
                          return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        })()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'approved')}
                          disabled={updatingId === req.id}
                          className="flex-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          Confirm Approval
                        </button>
                        <button
                          onClick={() => { setApprovingId(null); setLeaseStartDate(new Date().toISOString().split('T')[0]); }}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setApprovingId(req.id); setLeaseStartDate(new Date().toISOString().split('T')[0]); }}
                        disabled={updatingId === req.id}
                        className="flex-1 xl:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        disabled={updatingId === req.id}
                        className="flex-1 xl:flex-none px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )
                ) : (
                   <span className="text-[10px] font-bold text-slate-400 italic">
                     Request {req.status}
                   </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/30 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            No join requests found.
          </div>
        )}
      </div>
    </div>
  );
}
