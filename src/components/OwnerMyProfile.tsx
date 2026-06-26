'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Settings,
  KeyRound,
  X,
  Mail,
  Phone,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  CreditCard,
  BarChart3,
  Home,
  PlusCircle,
  Hash,
  Landmark,
  Building2,
  ExternalLink
} from 'lucide-react';
import { api } from './api';
import { auth } from './firebaseConfig';
import { 
  verifyBeforeUpdateEmail, 
  sendPasswordResetEmail,
  RecaptchaVerifier,
  PhoneAuthProvider,
  updatePhoneNumber,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  firebase_uid: string;
  is_owner: boolean;
  is_tenant: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
}

export default function OwnerMyProfile({ onViewChange }: { onViewChange?: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'account' | 'payment'>('overview');
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [ownerStats, setOwnerStats] = useState({ total: 0, active: 0, codesGenerated: 0 });
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    accountHolderName: '',
    bankAccountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [savingPayment, setSavingPayment] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailSyncLoading, setEmailSyncLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('rentedge_token');
      if (!token) return;

      const [res, props, paymentRes] = await Promise.all([
        fetch('http://localhost:5000/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } }),
        api.getProperties().catch(() => []),
        api.getPaymentInfo().catch(() => ({ exists: false, data: null }))
      ]);
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFullName(data.full_name || '');
        setNewEmail('');
        setNewPhone('');
      }

      if (paymentRes.exists) {
        setPaymentInfo(paymentRes.data);
        setPaymentForm({
          accountHolderName: paymentRes.data.account_holder_name || '',
          bankAccountNumber: paymentRes.data.bank_account_number || '',
          ifscCode: paymentRes.data.ifsc_code || '',
          upiId: paymentRes.data.upi_id || ''
        });
      }

      if (props && Array.isArray(props)) {
        setOwnerStats({
          total: props.length,
          active: props.filter((p:any) => p.status === 'active').length,
          codesGenerated: props.filter((p:any) => p.property_code).length
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    try {
      await api.savePaymentInfo(paymentForm);
      showMessage('success', 'Payment info saved successfully!');
      await fetchProfile();
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to save payment info');
    }
    setSavingPayment(false);
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const syncBackend = async (updates: any) => {
    const token = localStorage.getItem('rentedge_token');
    const res = await fetch('http://localhost:5000/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to sync database');
    return res.json();
  };

  const handleUpdateName = async () => {
    if (fullName === profile?.full_name) return;
    setSavingName(true);
    try {
      await syncBackend({ full_name: fullName });
      showMessage('success', 'Full name updated successfully.');
      await fetchProfile();
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to update name.');
    }
    setSavingName(false);
  };

  const handleVerifyEmail = async () => {
    if (!newEmail || newEmail === profile?.email) {
      showMessage('info', 'Please enter a different email address.');
      return;
    }
    try {
      if (!auth.currentUser) throw new Error('Firebase session missing. Please log in again.');
      
      const token = localStorage.getItem('rentedge_token');
      const checkRes = await fetch('http://localhost:5000/api/users/check-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
      });
      
      if (!checkRes.ok) {
        const errData = await checkRes.json();
        throw new Error(errData.message || 'Email change validation failed.');
      }

      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      showMessage('info', `Verification link sent to ${newEmail}. Please click the link to verify. After verifying, click "Refresh Sync" below.`);
      setNewEmail('');
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to send verification email.');
    }
  };

  const handleRefreshEmailSync = async () => {
    setEmailSyncLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const firebaseEmail = auth.currentUser.email;
        if (firebaseEmail && firebaseEmail !== profile?.email && auth.currentUser.emailVerified) {
          await syncBackend({ email: firebaseEmail });
          showMessage('success', 'Email change verified and synced successfully!');
          await fetchProfile();
        } else {
          showMessage('info', 'No verified email change detected yet. If you clicked the link, it might take a moment.');
        }
      }
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to sync email status.');
    }
    setEmailSyncLoading(false);
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleVerifyPhone = async () => {
    if (!newPhone || newPhone === profile?.phone) {
      showMessage('info', 'Please enter a different phone number.');
      return;
    }
    try {
      if (!auth.currentUser) throw new Error('Firebase session missing. Please log in again.');

      const token = localStorage.getItem('rentedge_token');
      const checkRes = await fetch('http://localhost:5000/api/users/check-phone-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPhone })
      });
      
      if (!checkRes.ok) {
        const errData = await checkRes.json();
        throw new Error(errData.message || 'Phone change validation failed.');
      }

      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      let formattedPhone = newPhone.replace(/[\s\-\+]/g, '');
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
      
      const provider = new PhoneAuthProvider(auth);
      const vid = await provider.verifyPhoneNumber(formattedPhone, appVerifier);
      setVerificationId(vid);
      setShowOtpModal(true);
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to send OTP.');
    }
  };

  const verifyPhoneOtp = async () => {
    if (!otpCode || !verificationId) return;
    setOtpLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      if (auth.currentUser) {
        await updatePhoneNumber(auth.currentUser, credential);
        // Successful verification -> sync with backend
        let formattedPhone = newPhone.replace(/[\s\-\+]/g, '');
        formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
        await syncBackend({ phone: formattedPhone });
        showMessage('success', 'Phone number updated successfully.');
        await fetchProfile();
        setShowOtpModal(false);
        setNewPhone('');
      }
    } catch (err: any) {
      showMessage('error', err.message || 'Invalid OTP code.');
    } finally {
      setOtpLoading(false);
      setOtpCode('');
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    try {
      await sendPasswordResetEmail(auth, profile.email);
      showMessage('success', 'Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to send reset email.');
    }
  };

  if (loading || !profile) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg text-left">
      
      {/* Settings Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand-purple" />
          Account Management Portal
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-1 flex items-center gap-2">
          Roles Active: 
          {profile.is_tenant && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Tenant</span>}
          {profile.is_owner && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Owner</span>}
        </p>
      </div>

      {/* Alert Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3 rounded-xl mb-6 text-xs font-bold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800 rounded-2xl mb-6 w-full max-w-2xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[120px] py-2.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview' 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Overview
          </div>
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 min-w-[120px] py-2.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'personal' 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Personal Info
          </div>
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 min-w-[120px] py-2.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'account' 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Account & Security
          </div>
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex-1 min-w-[120px] py-2.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'payment' 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Payment Routing
          </div>
        </button>
      </div>

      {/* Tab viewport panel */}
      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 0: Overview & Stats */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 w-full max-w-4xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Properties Listed</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{ownerStats.total}</h3>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Listings</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{ownerStats.active}</h3>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <Hash className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Property Codes</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{ownerStats.codesGenerated}</h3>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-wider">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => onViewChange?.('dashboard')} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-all group text-left">
                    <div className="flex items-center gap-3">
                      <PlusCircle className="w-5 h-5 text-brand-purple" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">List New Property</p>
                        <p className="text-[10px] text-slate-500">Launch the creation wizard</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-purple transition-colors" />
                  </button>
                  <button onClick={() => onViewChange?.('properties')} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-all group text-left">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">View My Properties</p>
                        <p className="text-[10px] text-slate-500">Manage existing portfolio</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </button>
                  <button onClick={() => setActiveTab('payment')} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-all group text-left sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Manage Payment Routing</p>
                        <p className="text-[10px] text-slate-500">Update where rent collections are sent</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: Personal Info */}
          {activeTab === 'personal' && (
            <motion.div
              key="personal-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-xl"
            >
              {/* Full Name Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-2 block">Full Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-brand-purple rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors"
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={savingName || fullName === profile.full_name}
                    className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {savingName ? 'Saving...' : 'Update Name'}
                  </button>
                </div>
              </div>

              {/* Email Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">Email Address</label>
                  {profile.email_verified ? (
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>
                  ) : (
                    <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Unverified</span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Current</span>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full pl-16 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">New</span>
                      <input
                        type="email"
                        value={newEmail}
                        placeholder="Enter new email"
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-brand-purple rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleVerifyEmail}
                      disabled={!newEmail || newEmail === profile.email}
                      className="px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      Send Verification
                    </button>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleRefreshEmailSync}
                      disabled={emailSyncLoading}
                      className="text-[10px] font-bold text-slate-500 hover:text-brand-purple flex items-center gap-1 transition-colors"
                    >
                      {emailSyncLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Refresh Sync Status
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">Phone Number</label>
                  {profile.phone_verified ? (
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>
                  ) : (
                    <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Unverified</span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Current</span>
                    <input
                      type="text"
                      disabled
                      value={profile.phone}
                      className="w-full pl-16 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">New</span>
                      <input
                        type="text"
                        value={newPhone}
                        placeholder="e.g. 9876543210"
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-brand-purple rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleVerifyPhone}
                      disabled={!newPhone || newPhone === profile.phone}
                      className="px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      Verify with OTP
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: Password & Account */}
          {activeTab === 'account' && (
            <motion.div
              key="account-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-xl"
            >
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Password Management</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Request a secure link to reset your account password via Firebase Auth.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handlePasswordReset}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-brand-purple text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Send Password Reset Email
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Database Synchronization</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Your identity verification states mirrored from Firebase Auth.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" /> Email Verified
                    </span>
                    {profile.email_verified ? (
                      <span className="text-[10px] uppercase font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">✅ Verified</span>
                    ) : (
                      <span className="text-[10px] uppercase font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">❌ Not Verified</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> Phone Verified
                    </span>
                    {profile.phone_verified ? (
                      <span className="text-[10px] uppercase font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">✅ Verified</span>
                    ) : (
                      <span className="text-[10px] uppercase font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">❌ Not Verified</span>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: Payment Routing */}
          {activeTab === 'payment' && (
            <motion.div
              key="payment-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-xl"
            >
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-slate-600 pb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Rent Collection Routing</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Configure where your rent payments will be settled.
                    </p>
                  </div>
                  {paymentInfo && (
                    <div className="ml-auto">
                      <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded border border-emerald-200">
                        {paymentInfo.verification_status || 'Linked'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1 block">Account Holder Name</label>
                    <input
                      type="text"
                      value={paymentForm.accountHolderName}
                      onChange={(e) => setPaymentForm({...paymentForm, accountHolderName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors"
                      placeholder="Name exactly as per bank"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1 block">Account Number</label>
                      <input
                        type="password"
                        value={paymentForm.bankAccountNumber}
                        onChange={(e) => setPaymentForm({...paymentForm, bankAccountNumber: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors font-mono"
                        placeholder="••••••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1 block">IFSC Code</label>
                      <input
                        type="text"
                        value={paymentForm.ifscCode}
                        onChange={(e) => setPaymentForm({...paymentForm, ifscCode: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors font-mono uppercase"
                        placeholder="e.g. SBIN0001234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1 block">UPI ID (Optional)</label>
                    <input
                      type="text"
                      value={paymentForm.upiId}
                      onChange={(e) => setPaymentForm({...paymentForm, upiId: e.target.value.toLowerCase()})}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors"
                      placeholder="e.g. name@bank"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSavePayment}
                      disabled={savingPayment || !paymentForm.accountHolderName || !paymentForm.bankAccountNumber || !paymentForm.ifscCode}
                      className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20"
                    >
                      {savingPayment ? 'Saving Routing Details...' : 'Save Payment Routing'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div id="recaptcha-container"></div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Verify Phone Number</h3>
                <p className="text-xs text-slate-500 mt-2">
                  We've sent an OTP to the new number.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-purple"
                />
                
                <button
                  onClick={verifyPhoneOtp}
                  disabled={otpLoading || otpCode.length < 6}
                  className="w-full py-3 bg-brand-purple text-white text-sm font-black rounded-xl hover:bg-brand-purple/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {otpLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify & Update Sync'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
