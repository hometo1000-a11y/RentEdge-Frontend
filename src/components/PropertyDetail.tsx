'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Trash2, 
  AlertOctagon, 
  X, 
  ShieldAlert, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  FileText,
  RefreshCw,
  MapPin
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  daysRemaining: number;
}

interface PropertyDetailProps {
  onBack?: () => void;
  onDeleteSuccess?: () => void;
  propertyTitle?: string;
  initialTenantsCount?: number;
}

export default function PropertyDetail({ 
  onBack,
  onDeleteSuccess,
  propertyTitle = '',
  initialTenantsCount = 0
}: PropertyDetailProps) {
  const [activeTenantsCount, setActiveTenantsCount] = useState<number>(initialTenantsCount);
  const [showDeletionToast, setShowDeletionToast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Lease renewal state
  const [selectedTenantForRenewal, setSelectedTenantForRenewal] = useState<Tenant | null>(null);
  const [renewalRent, setRenewalRent] = useState<string>('27500'); // Proposed 10% hike
  const [isSendingRenewal, setIsSendingRenewal] = useState(false);

  // Success toast state
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Mock Tenant List
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);

  const triggerSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDeleteClick = () => {
    if (activeTenantsCount > 0) {
      // Trigger the Framer Motion error toast
      setShowDeletionToast(true);
      setTimeout(() => {
        setShowDeletionToast(false);
      }, 5000);
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmDeleteProperty = () => {
    setShowConfirmModal(false);
    if (onDeleteSuccess) onDeleteSuccess();
    alert('Property successfully deleted from portfolio.');
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingRenewal(true);
    
    setTimeout(() => {
      setIsSendingRenewal(false);
      setSelectedTenantForRenewal(null);
      triggerSuccess(`Renewal agreement for ₹${Number(renewalRent).toLocaleString('en-IN')}/mo sent to ${tenantsList[0].name}.`);
      
      // Update tenant list status in state to simulate sent contract
      setTenantsList(prev => prev.map(t => 
        t.id === 'ten-1' 
          ? { ...t, leaseEnd: 'Pending Signature', daysRemaining: 365, rent: Number(renewalRent) }
          : t
      ));
    }, 1800);
  };

  return (
    <div className="w-full bg-[#F8F9FA] rounded-3xl overflow-hidden shadow-xl text-left relative flex flex-col gap-6">
      
      {/* Top Fixed Floating Errors & Success Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none">
        
        {/* Error Deletion Guard Toast */}
        <AnimatePresence>
          {showDeletionToast && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, y: -10 }}
              className="bg-red-950 border border-red-800 text-red-200 px-4.5 py-3.5 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm pointer-events-auto"
            >
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-black uppercase tracking-wider text-red-300">Action Denied</h5>
                <p className="text-[10px] font-semibold leading-normal">
                  You cannot delete a property with active leases. Please initiate move-outs or wait for lease expiry.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Action Toast */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, y: -10 }}
              className="bg-slate-900 border border-slate-800 text-white px-4.5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-sm pointer-events-auto"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold">{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION A: THE LIVE PREVIEW (Pure White Card Container) */}
      <div className="bg-white p-6 sm:p-8 border-b border-slate-200/50 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>

          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide">
              Live on Network
            </span>
            
            {/* Live lease control simulator */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <select 
                value={activeTenantsCount} 
                onChange={(e) => setActiveTenantsCount(Number(e.target.value))}
                className="text-[9px] font-black text-indigo-650 bg-transparent outline-none border-none cursor-pointer"
              >
                <option value={1}>1 Active Tenant (Locked)</option>
                <option value={0}>0 Active Tenants (Eligible)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mini Preview Box representing public tenant view */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/50 border border-slate-250/40 rounded-3xl p-5">
          
          {/* Hero Property Photo preview */}
          <div className="md:col-span-4 h-32 md:h-28 rounded-2xl overflow-hidden relative border border-slate-200 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80" 
              alt="Live Listing hero preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Details columns */}
          <div className="md:col-span-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-[#7C3AED] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                2 BHK config
              </span>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                {propertyTitle}
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Sector 62, Noida, Uttar Pradesh</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 shrink-0 text-left md:text-right">
              <span className="text-[9px] font-extrabold uppercase text-slate-400">Current Market Rate</span>
              <span className="text-xl font-black text-slate-900 font-mono">₹25,000<span className="text-xs font-semibold text-slate-450">/mo</span></span>
              
              <button
                onClick={() => triggerSuccess('Redirecting to RentEdge public link...')}
                className="mt-1 px-3 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-white text-slate-650 hover:text-slate-900 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                View Public Link
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION B: MANAGEMENT VIEW (Light Gray Card Container) */}
      <div className="p-6 sm:p-8 bg-slate-50/40 border-b border-slate-200/50 space-y-4">
        
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          Private Occupancy Ledger ({activeTenantsCount})
        </h3>

        <div className="overflow-hidden border border-slate-200 bg-white rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <th className="p-3.5 font-extrabold">Tenant Profile</th>
                  <th className="p-3.5 font-extrabold">Rent Amount</th>
                  <th className="p-3.5 font-extrabold">Lease Status Timeline</th>
                  <th className="p-3.5 font-extrabold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTenantsCount > 0 ? (
                  tenantsList.map((ten) => (
                    <tr key={ten.id} className="border-b border-slate-100 hover:bg-slate-50/20 font-semibold">
                      
                      {/* Name Profile */}
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#10B981] p-[1.5px] shrink-0">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-slate-800 text-[10px]">
                            {ten.avatar}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block font-black text-slate-900">{ten.name}</span>
                          <span className="block text-[9.5px] text-slate-400 font-bold">{ten.email}</span>
                        </div>
                      </td>

                      {/* Rent Value */}
                      <td className="p-3.5 font-mono text-slate-950 font-black">
                        ₹{ten.rent.toLocaleString('en-IN')}/mo
                      </td>

                      {/* Status / Near Expiry indicator */}
                      <td className="p-3.5 space-y-1 max-w-[200px]">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          {ten.leaseEnd === 'Pending Signature' ? (
                            <span className="text-indigo-600 font-extrabold">Agreement Draft Sent</span>
                          ) : (
                            <>
                              <span className="text-slate-400 font-extrabold">Expires: {ten.leaseEnd}</span>
                              <span className="text-amber-600 font-black">Expires in 15 Days</span>
                            </>
                          )}
                        </div>
                        
                        {/* Lease timeline slider track */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          {ten.leaseEnd === 'Pending Signature' ? (
                            <div className="w-full h-full bg-indigo-500 animate-pulse" />
                          ) : (
                            <div className="w-[95%] h-full bg-gradient-to-r from-emerald-500 to-amber-500" />
                          )}
                        </div>
                      </td>

                      {/* Update/Renew Button */}
                      <td className="p-3.5 text-right">
                        {ten.leaseEnd !== 'Pending Signature' && (
                          <button
                            onClick={() => setSelectedTenantForRenewal(ten)}
                            className="px-3.5 py-2 bg-amber-550 hover:bg-amber-650 text-white text-[10.5px] font-black rounded-xl transition-all cursor-pointer shadow-sm hover:scale-102 flex items-center gap-1.5 ml-auto"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Update / Renew Lease
                          </button>
                        )}
                        {ten.leaseEnd === 'Pending Signature' && (
                          <span className="text-[10px] text-indigo-650 font-extrabold italic bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                            Awaiting e-Sign
                          </span>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                      No active tenants assigned to this property unit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SECTION C: THE DELETION GUARD (Danger Zone container at the bottom) */}
      <div className="p-6 sm:p-8 bg-red-50/20 border-t border-red-100 rounded-b-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Zoning Danger Zone
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold max-w-lg leading-normal">
            Removing this listing will delist it from the tenant Walled Garden search index. Deletions are blocked if lease nodes remain active.
          </p>
        </div>

        <button
          onClick={handleDeleteClick}
          className="px-4.5 py-2.5 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-750 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          Delist &amp; Delete Property
        </button>
      </div>

      {/* Lease Renewal Proposed Rental Hike Modal */}
      <AnimatePresence>
        {selectedTenantForRenewal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full relative text-left"
            >
              <button
                onClick={() => setSelectedTenantForRenewal(null)}
                className="absolute top-4 right-4 p-1 text-slate-450 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Renew Lease Contract
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Propose rent adjustments and dispatch legal drafts.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRenewSubmit} className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1 text-xs">
                  <span className="block text-[8px] uppercase font-black text-slate-400">Target Tenant</span>
                  <span className="block text-slate-900 font-black">{selectedTenantForRenewal.name}</span>
                  <span className="block text-[9.5px] text-slate-450 font-bold">{propertyTitle}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Current Rent</span>
                    <span className="block text-slate-900 font-black font-mono">₹{selectedTenantForRenewal.rent.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block">Proposed Rent (INR)</label>
                    <input
                      type="number"
                      required
                      value={renewalRent}
                      onChange={(e) => setRenewalRent(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTenantForRenewal(null)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRenewal}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    {isSendingRenewal ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Draft...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        Send Renewal Agreement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal (Only shown if activeTenantsCount === 0) */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white max-w-sm w-full border border-slate-100 rounded-3xl p-6 shadow-2xl relative text-left space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Confirm Asset Removal</h4>
                  <p className="text-[10.5px] text-slate-500 font-semibold leading-normal mt-1">
                    Are you sure you want to permanently delete this listing? This action is irreversible.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProperty}
                  className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Delete Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
