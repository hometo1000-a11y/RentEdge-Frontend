import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Wallet, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  X,
  CreditCard,
  FileText,
  Clock,
  History
} from 'lucide-react';
import { api } from './api';
import { Property } from './propertiesData';
import PaymentHistoryModal from './PaymentHistoryModal';

export default function RentManagement() {
  const [properties, setProperties] = useState<any[]>([]);
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [currentProof, setCurrentProof] = useState<any | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [props, tenantsData] = await Promise.all([
        api.getProperties(),
        api.getPropertyTenants()
      ]);
      setProperties(props);
      setAllTenants(tenantsData);
      
      // Update selected tenant reference if it exists
      if (selectedTenant) {
        const updated = tenantsData.find((t: any) => t.id === selectedTenant.id);
        if (updated) setSelectedTenant(updated);
      }
    } catch (err) {
      console.error('Failed to load rent management data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRentAction = async (action: 'approve_proof' | 'reject_proof' | 'manual_override') => {
    if (!selectedTenant) return;
    try {
      if (action === 'approve_proof' && currentProof) {
        await api.approvePaymentProof(currentProof.id);
      } else if (action === 'reject_proof') {
        await api.markTenantDue(selectedTenant.id);
      } else if (action === 'manual_override') {
        await api.updateTenantRentStatus(selectedTenant.id, 'paid');
      }
      // Refresh data
      await loadData();
    } catch (err: any) {
      console.error(`Failed to execute ${action}:`, err);
      alert(`Action failed: ${err.message || 'Please try again.'}`);
    }
  };

  useEffect(() => {
    async function loadProof() {
      if (!selectedTenant) return;
      if (selectedTenant.rent_status === 'pending' || selectedTenant.rent_status === 'paid') {
        setLoadingProof(true);
        try {
          const proof = await api.getCurrentPaymentProof(selectedTenant.id);
          setCurrentProof(proof?.data || null);
        } catch (err) {
          console.error('Failed to load payment proof:', err);
          setCurrentProof(null);
        } finally {
          setLoadingProof(false);
        }
      } else {
        setCurrentProof(null);
      }
    }
    loadProof();
  }, [selectedTenant]);

  const filteredTenants = selectedPropertyId === 'all' 
    ? allTenants 
    : allTenants.filter(t => t.properties.id === selectedPropertyId);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 flex flex-col lg:flex-row lg:h-[80vh] gap-6">
      
      {/* LEFT COLUMN: Property Selector & Tenant List */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Header & Filter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Rent Management
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Review pending payments and track rent cycles.</p>
          </div>
          
          <div className="w-full sm:w-64">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-purple/20 cursor-pointer"
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.property_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tenant List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 custom-scrollbar p-6">
            <div className="grid grid-cols-1 gap-3">
              {filteredTenants.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">No tenants found</h3>
                </div>
              ) : (
                filteredTenants.map(t => {
                  const isSelected = selectedTenant?.id === t.id;
                  const status = t.rent_status || 'paid'; // Fallback if null
                  
                  return (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTenant(t)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-brand-purple/5 border-brand-purple shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                          status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          status === 'due' ? 'bg-red-100 text-red-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {t.users?.full_name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{t.users?.full_name}</h4>
                          <p className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">{t.properties?.property_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Rent Amount</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-300">₹{(t.agreed_rent_amount || t.properties?.rent_amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        
                        <div className="w-28 flex justify-end">
                          {status === 'pending' && (
                            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
                            </span>
                          )}
                          {status === 'due' && (
                            <span className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[9px] font-black text-red-600 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Due
                            </span>
                          )}
                          {status === 'paid' && (
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-colors ${isSelected ? 'text-brand-purple' : 'text-slate-300 group-hover:text-slate-400'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Detail View */}
      <AnimatePresence mode="wait">
        {selectedTenant ? (
          <motion.div 
            key={selectedTenant.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg shrink-0 flex flex-col overflow-hidden h-[600px] lg:h-auto"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Tenant Overview</h3>
                <p className="text-xs font-semibold text-slate-500">{selectedTenant.users?.full_name}</p>
              </div>
              <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* STATUS: DUE */}
              {(selectedTenant.rent_status === 'due' || !selectedTenant.rent_status) && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">This month's rent is due.</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Due Date: {new Date(selectedTenant.next_due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* STATUS: PENDING OR PAID */}
              {(selectedTenant.rent_status === 'pending' || selectedTenant.rent_status === 'paid') && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border ${
                    selectedTenant.rent_status === 'pending' 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {selectedTenant.rent_status === 'pending' ? (
                        <Clock className="w-5 h-5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      <h4 className="text-sm font-black">
                        {selectedTenant.rent_status === 'pending' ? 'Verification Required' : 'Payment Verified'}
                      </h4>
                    </div>
                    {selectedTenant.rent_status === 'paid' && (
                      <p className="text-[10px] font-bold opacity-80">
                        Next Due Date: {new Date(selectedTenant.next_due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {loadingProof ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                  ) : currentProof ? (
                    <div className="space-y-5">
                      {/* Screenshot */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] relative group">
                        <img src={currentProof.screenshot_url} alt="Payment Proof" className="w-full h-full object-cover" />
                        <a 
                          href={currentProof.screenshot_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black uppercase tracking-wider backdrop-blur-sm"
                        >
                          View Full Size
                        </a>
                      </div>

                      {/* Details Grid */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Method</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">{currentProof.payment_method}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ref No.</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">{currentProof.reference_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</span>
                          <span className="text-xs font-black text-emerald-600">₹{Number(currentProof.amount_paid).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paid On</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">{new Date(currentProof.payment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted</span>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{new Date(currentProof.submitted_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs font-bold text-slate-400">No proof submitted for current cycle.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col gap-3">
              {selectedTenant.rent_status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleRentAction('approve_proof')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-colors shadow-sm cursor-pointer">
                    Approve Payment
                  </button>
                  <button onClick={() => handleRentAction('reject_proof')} className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-black rounded-xl transition-colors cursor-pointer">
                    Reject / Mark Due
                  </button>
                </div>
              )}
              
              {selectedTenant.rent_status === 'paid' && (
                <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" />
                  See all payment history
                </button>
              )}

              {selectedTenant.rent_status === 'due' && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-1">Awaiting tenant action</p>
                  <button onClick={() => handleRentAction('manual_override')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-xs font-black rounded-xl transition-colors cursor-pointer">
                    Manual Cash Override (Mark Paid)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full lg:w-96 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shrink-0 flex flex-col items-center justify-center p-8 text-center h-[300px] lg:h-auto"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Select a tenant</h3>
            <p className="text-xs font-semibold text-slate-500 mt-2">Click on a tenant from the list to view their payment proof and rent cycle details.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentHistoryModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)} 
        role="owner"
        propertyId={selectedPropertyId !== 'all' ? selectedPropertyId : undefined}
        tenantUserId={selectedTenant?.users?.id} // Filter specifically to the selected tenant if we want, or just leave undefined
      />
    </div>
  );
}
