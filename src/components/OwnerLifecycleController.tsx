'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import OwnerDashboard from './OwnerDashboard';
import { api } from './api';

interface OwnerLifecycleControllerProps {
  onLogout: () => void;
  onSwitchToTenant?: () => void;
}

export default function OwnerLifecycleController({ onLogout, onSwitchToTenant }: OwnerLifecycleControllerProps) {
  const [loading, setLoading] = useState(true);
  const [paymentSetupComplete, setPaymentSetupComplete] = useState(false);
  const [setupForm, setSetupForm] = useState({
    accountHolderName: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    checkPaymentInfo();
  }, []);

  const checkPaymentInfo = async () => {
    try {
      const token = localStorage.getItem('rentedge_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await fetch('http://localhost:5000/api/users/payment-info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setPaymentSetupComplete(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch payment info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (setupForm.bankAccountNumber !== setupForm.confirmAccountNumber) {
      setSetupError('Bank account numbers do not match.');
      return;
    }

    setSetupLoading(true);
    try {
      const token = localStorage.getItem('rentedge_token');
      const res = await fetch('http://localhost:5000/api/users/payment-info', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          accountHolderName: setupForm.accountHolderName,
          bankAccountNumber: setupForm.bankAccountNumber,
          ifscCode: setupForm.ifscCode,
          upiId: setupForm.upiId
        })
      });

      if (res.ok) {
        setPaymentSetupComplete(true);
      } else {
        const data = await res.json();
        setSetupError(data.message || 'Failed to save payment details.');
      }
    } catch (err) {
      setSetupError('Server error occurred.');
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (paymentSetupComplete) {
    return <OwnerDashboard onLogout={onLogout} onSwitchToTenant={onSwitchToTenant} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-slate-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="mb-8">
          <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Set Up Payment Routing
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Add your bank details so we can automatically route rent collections and deposits to you.
          </p>
        </div>

        {setupError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl">
            {setupError}
          </div>
        )}

        <form onSubmit={handleSetupSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-400">Account Holder Name</label>
            <input 
              type="text" 
              required
              placeholder="As per bank records"
              value={setupForm.accountHolderName}
              onChange={e => setSetupForm({...setupForm, accountHolderName: e.target.value})}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-400">Account Number</label>
              <input 
                type="text" 
                required
                placeholder="000012345678"
                value={setupForm.bankAccountNumber}
                onChange={e => setSetupForm({...setupForm, bankAccountNumber: e.target.value.replace(/\D/g, '')})}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-400">Confirm Account Number</label>
              <input 
                type="password" 
                required
                placeholder="000012345678"
                value={setupForm.confirmAccountNumber}
                onChange={e => setSetupForm({...setupForm, confirmAccountNumber: e.target.value.replace(/\D/g, '')})}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-400">IFSC Code</label>
              <input 
                type="text" 
                required
                placeholder="HDFC0001234"
                value={setupForm.ifscCode}
                onChange={e => setSetupForm({...setupForm, ifscCode: e.target.value.toUpperCase()})}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-400">UPI ID (Optional)</label>
              <input 
                type="text" 
                placeholder="name@okhdfc"
                value={setupForm.upiId}
                onChange={e => setSetupForm({...setupForm, upiId: e.target.value})}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={setupLoading}
              className="w-full py-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {setupLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Payment Routing
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
