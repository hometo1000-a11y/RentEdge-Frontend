import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, Loader2, FileText, ChevronLeft, ChevronRight, Hash, CheckCircle2, History } from 'lucide-react';
import { api } from './api';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'owner' | 'tenant';
  propertyId?: string; // Optional filter
  tenantUserId?: string; // Optional filter (for owner)
}

export default function PaymentHistoryModal({ isOpen, onClose, role, propertyId, tenantUserId }: PaymentHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    if (!isOpen) return;

    async function loadHistory() {
      setLoading(true);
      try {
        const response = await api.getPaymentHistory({
          role,
          property_id: propertyId,
          tenant_user_id: tenantUserId,
          page,
          limit
        });
        
        if (response.data) {
          setHistory(response.data.data || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load payment history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isOpen, role, propertyId, tenantUserId, page]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-purple" />
              Payment History
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Review approved historical rent payments.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-48 space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">No payment history</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">There are no approved payments to display.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-purple/30 transition-colors shadow-xs group">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-3">
                      {/* Badge / Top Row */}
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                        {record.payment_method === 'Owner Override' && (
                          <span className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple rounded-md text-[9px] font-black uppercase tracking-widest border border-brand-purple/20 flex items-center gap-1.5">
                            Manual Verification
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(record.billing_period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Cycle
                        </span>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {role === 'owner' && (
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tenant</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200">{record.users?.full_name || 'Unknown'}</p>
                          </div>
                        )}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Property</p>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{record.properties?.property_name}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Paid On</p>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-200">{new Date(record.payment_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Method</p>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-200">{record.payment_method}</p>
                        </div>
                        {role === 'owner' && (
                          <div className="col-span-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Hash className="w-3 h-3" /> Ref. Number</p>
                              <p className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">{record.reference_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Verified At</p>
                              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{new Date(record.verified_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-between items-end sm:items-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Amount</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-500">₹{Number(record.amount_paid).toLocaleString('en-IN')}</p>
                      </div>
                      
                      {record.screenshot_url ? (
                        <a 
                          href={record.screenshot_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] font-black text-brand-purple hover:text-purple-700 uppercase tracking-wider underline-offset-4 hover:underline"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          No Receipt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
// Add lucide-react imports appropriately in target file
