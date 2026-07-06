'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Upload, 
  MapPin, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  X,
  FileText,
  AlertCircle,
  TrendingUp,
  Mail,
  Phone,
  ArrowRight,
  Plus,
  Compass,
  Calendar,
  Zap,
  Link,
  CreditCard,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Camera,
  Check,
  Activity,
  FileCode,
  Shield,
  HelpCircle,
  Eye,
  Server
} from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import LandlordOS from './LandlordOS';

// Form State Structure
interface OnboardingState {
  kyc: {
    legalName: string;
    pan: string;
    aadhaar: string;
    panFile: string | null;
    aadhaarFile: string | null;
  };
  property: {
    type: 'Apartment' | 'Villa' | 'PG';
    address: string;
    bhk: number;
    photos: string[];
    rent: number;
    deposit: number;
    minScore: number;
    totalUnits?: number;
  };
}

interface TenantApplication {
  id: string;
  name: string;
  avatar: string;
  propertyTitle: string;
  score: number;
  income: string;
  reference: string;
  moveInDate: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'declined';
}

export default function LandlordOnboardingPipeline({ onLogout }: { onLogout?: () => void }) {
  // Current view state
  const [pipelineState, setPipelineState] = useState<'KYC_DIGIO' | 'BANK_RAZORPAY' | 'WIZARD' | 'INBOX'>('KYC_DIGIO');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  // State 2 (Wizard) Sub-Step: 1, 2, 3
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Clean, structured form state
  const [formData, setFormData] = useState<OnboardingState>({
    kyc: {
      legalName: '',
      pan: '',
      aadhaar: '',
      panFile: null,
      aadhaarFile: null,
    },
    property: {
      type: 'Apartment',
      address: '',
      bhk: 2,
      photos: [],
      rent: 35000,
      deposit: 100000,
      minScore: 720,
      totalUnits: 1,
    }
  });


  // Phase 2 Digio KYC States
  const [digioState, setDigioState] = useState<'not_started' | 'session_init' | 'digilocker' | 'selfie' | 'webhook_triggering' | 'verified'>('not_started');
  const [digioAadhaarInput, setDigioAadhaarInput] = useState('');
  const [digioAadhaarOtp, setDigioAadhaarOtp] = useState('');
  const [livenessCheckProgress, setLivenessCheckProgress] = useState(0);
  const [selfieCapturedData, setSelfieCapturedData] = useState<string | null>(null);
  const [digioLogs, setDigioLogs] = useState<string[]>([]);
  const [selfiePhotoCaptured, setSelfiePhotoCaptured] = useState(false);
  const [selfieStreamActive, setSelfieStreamActive] = useState(false);
  const [isReceivingWebhook, setIsReceivingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);

  // Phase 3 Razorpay States
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankHolderInputName, setBankHolderInputName] = useState('');
  const [pennyDropState, setPennyDropState] = useState<'idle' | 'depositing' | 'verifying' | 'matching' | 'success' | 'mismatch'>('idle');
  const [pennyDropProgress, setPennyDropProgress] = useState(0);
  const [pennyDropLogs, setPennyDropLogs] = useState<string[]>([]);
  const [fetchedBankName, setFetchedBankName] = useState('');
  const [razorpayRouteSetup, setRazorpayRouteSetup] = useState(false);

  // UI helpers
  const [kycErrors, setKycErrors] = useState<string[]>([]);
  const [dragActivePan, setDragActivePan] = useState(false);
  const [dragActiveAadhaar, setDragActiveAadhaar] = useState(false);

  // UPI Setup State
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [razorpayLinked, setRazorpayLinked] = useState(false);
  const [linkingRazorpay, setLinkingRazorpay] = useState(false);

  const bankOptions = [
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏦', upiSuffix: '@hdfcbank' },
    { id: 'icici', name: 'ICICI Bank', logo: '🏛️', upiSuffix: '@icici' },
    { id: 'sbi', name: 'State Bank of India', logo: '🏧', upiSuffix: '@sbi' },
    { id: 'axis', name: 'Axis Bank', logo: '💳', upiSuffix: '@axisbank' },
    { id: 'kotak', name: 'Kotak Mahindra', logo: '🏢', upiSuffix: '@kotak' },
    { id: 'idfc', name: 'IDFC First Bank', logo: '⚡', upiSuffix: '@idfcbank' },
  ];

  const handleVerifyUpi = () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      setUpiError('Please enter a valid UPI ID (e.g. name@hdfcbank)');
      return;
    }
    setUpiError('');
    setUpiVerifying(true);
    setTimeout(() => {
      setUpiVerifying(false);
      setUpiVerified(true);
    }, 1800);
  };

  const handleLinkRazorpay = () => {
    setLinkingRazorpay(true);
    setTimeout(() => {
      setLinkingRazorpay(false);
      setRazorpayLinked(true);
    }, 2200);
  };

  const handleUpiComplete = () => {
    setPipelineState('WIZARD');
  };
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=80'
  ]);
  
  // Applications Queue
  const [applications, setApplications] = useState<TenantApplication[]>([
    {
      id: 'app-1',
      name: 'Aarav Sharma',
      avatar: 'AS',
      propertyTitle: 'Bandra Skyloft Apartment',
      score: 784,
      income: '₹1,80,000 / month',
      reference: 'Verified (Ex-Landlord: K. Mehta)',
      moveInDate: '15 June 2026',
      email: 'aarav.sharma@gmail.com',
      phone: '+91 98332 99827',
      status: 'pending'
    },
    {
      id: 'app-2',
      name: 'Priya Nair',
      avatar: 'PN',
      propertyTitle: 'Bandra Skyloft Apartment',
      score: 712,
      income: '₹2,20,000 / month',
      reference: 'Verified (Ex-Landlord: S. Godrej)',
      moveInDate: '01 July 2026',
      email: 'priya.nair@outlook.com',
      phone: '+91 97728 11092',
      status: 'pending'
    },
    {
      id: 'app-3',
      name: 'Rohan Malhotra',
      avatar: 'RM',
      propertyTitle: 'Khar Oasis Suite',
      score: 645,
      income: '₹95,000 / month',
      reference: 'Not Provided',
      moveInDate: '20 June 2026',
      email: 'rohan.m@yahoo.com',
      phone: '+91 88291 00291',
      status: 'pending'
    }
  ]);
  const [selectedAppId, setSelectedAppId] = useState<string>('app-1');
  const selectedApp = applications.find(a => a.id === selectedAppId);

  // KYC Validation
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!formData.kyc.legalName.trim()) {
      errors.push('Full Legal Name is required.');
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.kyc.pan)) {
      errors.push('Invalid PAN Card format (e.g. ABCDE1234F).');
    }
    if (!/^\d{4}\s\d{4}\s\d{4}$/.test(formData.kyc.aadhaar) && !/^\d{12}$/.test(formData.kyc.aadhaar)) {
      errors.push('Aadhaar must be a valid 12-digit number.');
    }
    if (!formData.kyc.panFile) {
      errors.push('Please upload PAN front image.');
    }
    if (!formData.kyc.aadhaarFile) {
      errors.push('Please upload Aadhaar front image.');
    }

    if (errors.length > 0) {
      setKycErrors(errors);
    } else {
      setKycErrors([]);
      // Transition to Digio KYC
      setPipelineState('KYC_DIGIO');
    }
  };

  // Auto format Aadhaar with spaces
  const handleAadhaarChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 12);
    let formatted = '';
    for (let i = 0; i < clean.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += clean[i];
    }
    setFormData(prev => ({
      ...prev,
      kyc: { ...prev.kyc, aadhaar: formatted }
    }));
  };

  // Mock upload functions
  const simulateUpload = (type: 'pan' | 'aadhaar') => {
    setFormData(prev => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        [`${type}File`]: `${type}_front_verified.jpg`
      }
    }));
  };

  // Wizard action helpers
  const handlePublishProperty = () => {
    // Inject the newly created property to the list, then route to the inbox
    setPipelineState('INBOX');
    setHasCompletedOnboarding(true);
  };

  // Decline/Approve Actions
  const handleApplicationAction = (appId: string, action: 'approved' | 'declined') => {
    setApplications(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, status: action };
      }
      return a;
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#06130C] text-[#06130C] dark:text-slate-100 relative flex flex-col font-sans">
      
      {/* Dev Mode Notification Strip */}
      {!hasCompletedOnboarding && (
        <div className="bg-slate-900 text-white py-2.5 px-4 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 border-b border-white/5 relative z-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Landlord Pipeline State: <strong className="text-indigo-400">{pipelineState}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mr-2">Jump State</span>
            {[
              { state: 'KYC_DIGIO', label: '1. Digio KYC' },
              { state: 'BANK_RAZORPAY', label: '2. Penny Drop' },
              { state: 'WIZARD', label: '3. Wizard' },
              { state: 'INBOX', label: '4. LandlordOS' }
            ].map((btn) => (
              <button
                key={btn.state}
                onClick={() => {
                  setPipelineState(btn.state as any);
                  if (btn.state === 'WIZARD') setWizardStep(1);
                  if (btn.state === 'INBOX') setHasCompletedOnboarding(true);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                  pipelineState === btn.state
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
            {onLogout && (
              <button 
                onClick={onLogout}
                className="ml-4 px-2 py-1 bg-red-600 hover:bg-red-750 text-white text-[10px] font-extrabold rounded-md uppercase cursor-pointer"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* ================= PHASE 2: IDENTITY HARDENING (DIGIO PRE-ONBOARDING KYC) ================= */}
        {pipelineState === 'KYC_DIGIO' && (
          <m.div
            key="digio-kyc"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Progress bar indication */}
              <div className="flex gap-1.5 mb-6">
                <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                <div className="h-1 flex-1 rounded-full bg-slate-100" />
              </div>

              {digioState === 'not_started' && (
                <m.div key="digio-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Phase 2 — Identity Hardening
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
                      Digio Identity Gateway
                    </h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                      Because you will collect tenant payments, we must verify your legal identity via DigiLocker and an automated liveness selfie check.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 font-bold text-xs">
                      OKYC
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="block text-xs font-black text-slate-800">Digio Secure SDK Verification</span>
                      <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">
                        RentEdge connects with Digio Sandbox OKYC API to generate a temporary identity authorization token.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDigioState('session_init');
                      setTimeout(() => {
                        setDigioState('digilocker');
                      }, 1200);
                    }}
                    className="w-full py-3.5 bg-[#01411C] hover:bg-[#003B1F] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-sm"
                  >
                    Start Verification Session
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </m.div>
              )}

              {digioState === 'session_init' && (
                <m.div key="digio-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                  <div>
                    <h4 className="text-sm font-black text-slate-850">Initializing Digio Sandbox...</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Generating unique access token via Node API gateway</p>
                  </div>
                </m.div>
              )}

              {digioState === 'digilocker' && (
                <m.div key="digio-digilocker" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-left">
                  {/* Mock Digio Portal interface header */}
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-white font-extrabold flex items-center justify-center text-xs">DL</div>
                      <div>
                        <span className="block text-xs font-black text-[#C9A42F]">DigiLocker KYC Gateway</span>
                        <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Powered by Digio Sandbox</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 uppercase">Ref ID: dg_sandbox_99a81</span>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Aadhaar / Virtual ID Card</label>
                      <input
                        type="text"
                        placeholder="XXXX XXXX XXXX (12 Digits)"
                        maxLength={12}
                        value={digioAadhaarInput}
                        onChange={(e) => setDigioAadhaarInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Aadhaar OTP Pin</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP code sent to card"
                        maxLength={6}
                        value={digioAadhaarOtp}
                        onChange={(e) => setDigioAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (digioAadhaarInput.length !== 12 || digioAadhaarOtp.length !== 6) return;
                      setDigioState('selfie');
                    }}
                    disabled={digioAadhaarInput.length !== 12 || digioAadhaarOtp.length !== 6}
                    className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#C9A42F] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Confirm DigiLocker Sync
                  </button>
                </m.div>
              )}

              {digioState === 'selfie' && (
                <m.div key="digio-selfie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-left">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-2.5">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="block text-xs font-black text-emerald-800">Video Liveness Check</span>
                      <span className="block text-[10px] text-slate-450 leading-relaxed font-semibold">Keep your face within the camera ring. Do not blink during scan.</span>
                    </div>
                  </div>

                  {/* Camera sandbox interface */}
                  <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-dashed border-indigo-500 flex items-center justify-center bg-slate-950">
                    {selfiePhotoCaptured ? (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Selfie Liveness Checked</span>
                        <span className="text-[8px] text-slate-500">Match score: 99.2% Liveness verified</span>
                      </div>
                    ) : selfieStreamActive ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        {/* Scanning visual overlay */}
                        <div className="absolute inset-0 border-2 border-emerald-500 rounded-full animate-pulse opacity-50" />
                        <span className="text-white text-xs font-bold font-mono animate-pulse">Liveness Scan: {livenessCheckProgress}%</span>
                        <div className="w-3/4 bg-white/20 h-1 rounded-full overflow-hidden mt-2">
                          <div className="bg-emerald-500 h-full" style={{ width: `${livenessCheckProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelfieStreamActive(true);
                          const iv = setInterval(() => {
                            setLivenessCheckProgress((p) => {
                              if (p >= 100) {
                                clearInterval(iv);
                                setSelfiePhotoCaptured(true);
                                return 100;
                              }
                              return p + 10;
                            });
                          }, 250);
                        }}
                        className="text-white text-[11px] font-black uppercase tracking-wider hover:text-indigo-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-6 h-6 animate-bounce" />
                        <span>Launch Camera Sandbox</span>
                      </button>
                    )}
                  </div>

                  {selfiePhotoCaptured && (
                    <button
                      onClick={() => {
                        setDigioState('webhook_triggering');
                        setIsReceivingWebhook(true);
                        const logs = [
                          'Webhook dispatched: digio.kyc.session_completed',
                          'POST http://localhost:3000/api/webhooks/digio...',
                          'Payload received, verifying signature (JWT key index)...',
                          'Extracted Legal Name: Aarav Sharma',
                          'Extracted address: Flat 402, Sea Breeze, Bandra West, Mumbai',
                          'Encrypting compliance payload via AES-256...',
                          'Uploading doc file to ImageKit compliance path: ok_kyc_anshul_signed.pdf',
                          'Updating Supabase auth row to: IDENTITY_VERIFIED'
                        ];
                        let idx = 0;
                        const iv = setInterval(() => {
                          if (idx >= logs.length) {
                            clearInterval(iv);
                            setIsReceivingWebhook(false);
                            setDigioState('verified');
                            // Populate form data with verified KYC details
                            setFormData(prev => ({
                              ...prev,
                              kyc: {
                                ...prev.kyc,
                                legalName: 'Aarav Sharma',
                                pan: 'ABCDE1234F',
                                aadhaar: '9833 2998 2712'
                              }
                            }));
                            return;
                          }
                          setWebhookLogs((prev) => [...prev, logs[idx]]);
                          idx++;
                        }, 500);
                      }}
                      className="w-full py-3.5 bg-[#01411C] hover:bg-[#003B1F] text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Complete KYC
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </m.div>
              )}

              {digioState === 'webhook_triggering' && (
                <m.div key="digio-webhook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                      Receiving Webhook Payload...
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Listening on webhook port inside mock background thread</p>
                  </div>

                  <div className="bg-[#06130C] rounded-2xl p-4 border border-white/5 font-mono text-[9px] text-slate-350 space-y-1 min-h-[140px]">
                    {webhookLogs.map((log, i) => (
                      <p key={i} className={
                        log.includes('SUCCESS') || log.includes('Aarav Sharma') || log.includes('verified')
                          ? 'text-emerald-400'
                          : log.includes('POST')
                          ? 'text-indigo-400'
                          : 'text-slate-400'
                      }>
                        &gt; {log}
                      </p>
                    ))}
                  </div>
                </m.div>
              )}

              {digioState === 'verified' && (
                <m.div key="digio-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-left">
                  <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Identity Hardened Successfully</h4>
                      <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">Digio OKYC completed. Legal name & address verified.</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 font-semibold">
                      <span className="text-slate-450">Verified Name:</span>
                      <span className="text-slate-900 font-black">Aarav Sharma</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 font-semibold">
                      <span className="text-slate-450">KYC Status:</span>
                      <span className="text-emerald-600 font-extrabold uppercase">Hardened</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-450">Compliance Doc:</span>
                      <span className="text-indigo-600 font-bold">ImageKit Encrypted Upload ✓</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPipelineState('BANK_RAZORPAY')}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    Proceed to Routing Setup
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </m.div>
              )}
            </div>
          </m.div>
        )}

        {/* ================= PHASE 3: BANKING INTEGRATION & ROUTING SETUP (RAZORPAY PENNY DROP) ================= */}
        {pipelineState === 'BANK_RAZORPAY' && (
          <m.div
            key="bank-razorpay"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Progress bar indication */}
              <div className="flex gap-1.5 mb-6">
                <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                <div className="h-1 flex-1 rounded-full bg-emerald-600" />
              </div>

              {pennyDropState === 'idle' && (
                <m.div key="bank-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                      <CreditCard className="w-3.5 h-3.5" />
                      Phase 3 — Rent Collection Setup
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
                      Routing & Bank Setup
                    </h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                      Enter the bank details where you want your 99% rent cut to be automatically routed. RazorpayX will instantly initiate a penny drop check to verify.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="Legal Name (Must match KYC name)"
                        value={bankHolderInputName}
                        onChange={(e) => setBankHolderInputName(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Bank Account Number</label>
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value.replace(/\D/g, ''))}
                          className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">IFSC Routing Code</label>
                        <input
                          type="text"
                          placeholder="SBIN0001234"
                          maxLength={11}
                          value={bankIfscCode}
                          onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                          className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!bankAccountNo || !bankIfscCode || !bankHolderInputName) return;
                      setPennyDropState('depositing');
                      setPennyDropProgress(0);
                      
                      const logsList = [
                        'Dispatched POST /api/payments/penny-drop to RazorpayX API...',
                        'NPCI routing lookup completed: SBIN -> State Bank of India',
                        'Initiating electronic fund transfer: ₹1.00 credit transaction...',
                        'Settlement channel verified. Polling destination routing net...',
                        'Bank account returned status: active_success',
                        'Extracted true legal name: AARAV SHARMA',
                        'Running verification name matching engine...'
                      ];

                      let idx = 0;
                      const iv = setInterval(() => {
                        if (idx >= logsList.length) {
                          clearInterval(iv);
                          
                          // Check name matching logic
                          const matches = bankHolderInputName.toLowerCase().replace(/\s+/g, '') === 'aaravsharma';
                          if (matches) {
                            setPennyDropState('matching');
                            setTimeout(() => {
                              setPennyDropState('success');
                              setRazorpayRouteSetup(true);
                            }, 1200);
                          } else {
                            setPennyDropState('matching');
                            setTimeout(() => {
                              setPennyDropState('mismatch');
                              setFetchedBankName('AARAV SHARMA');
                            }, 1200);
                          }
                          return;
                        }
                        setPennyDropLogs((prev) => [...prev, logsList[idx]]);
                        setPennyDropProgress((p) => Math.min(100, p + 15));
                        idx++;
                      }, 500);
                    }}
                    disabled={!bankAccountNo || !bankIfscCode || !bankHolderInputName}
                    className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    Link & Verify Bank Account
                  </button>
                </m.div>
              )}

              {pennyDropState === 'depositing' && (
                <m.div key="depositing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#01411C]" />
                      RazorpayX Penny Drop Active...
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Depositing ₹1 into account to fetch true legal registration</p>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#01411C] h-full" style={{ width: `${pennyDropProgress}%` }} />
                  </div>

                  <div className="bg-[#06130C] rounded-2xl p-4 border border-white/5 font-mono text-[9px] text-slate-350 space-y-1 min-h-[140px]">
                    {pennyDropLogs.map((log, i) => (
                      <p key={i} className={log.includes('AARAV SHARMA') ? 'text-emerald-400' : 'text-slate-450'}>
                        &gt; {log}
                      </p>
                    ))}
                  </div>
                </m.div>
              )}

              {pennyDropState === 'matching' && (
                <m.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <div>
                    <h4 className="text-sm font-black text-slate-850">Cross-referencing Name Matches...</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Comparing verified Digio KYC name & Bank account returned string</p>
                  </div>
                </m.div>
              )}

              {pennyDropState === 'success' && (
                <m.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-left">
                  <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Bank Routing Confirmed</h4>
                      <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">₹1 deposit successfully fetched & matched AARAV SHARMA.</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 font-semibold">
                      <span className="text-slate-450">Destination Bank:</span>
                      <span className="text-slate-900 font-bold">State Bank of India</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 font-semibold">
                      <span className="text-slate-450">Name Match Score:</span>
                      <span className="text-emerald-600 font-extrabold uppercase">100% Perfect Match</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-450">Razorpay Route Account:</span>
                      <span className="text-indigo-600 font-bold">Account linked (acc_sh_929a)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPipelineState('WIZARD');
                      setWizardStep(1);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#01411C] to-[#01411C] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    Proceed to Property Listing
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </m.div>
              )}

              {pennyDropState === 'mismatch' && (
                <m.div key="mismatch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-left">
                  <div className="bg-red-50 border border-red-150 p-5 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto text-xl font-bold">!</div>
                    <div>
                      <h4 className="text-sm font-black text-red-900">Verification Match Failed</h4>
                      <p className="text-[10.5px] text-red-700 font-medium mt-0.5">The bank account holder name returned does not match KYC.</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 font-semibold">
                      <span className="text-slate-450">KYC Legal Name:</span>
                      <span className="text-slate-900 font-bold">Aarav Sharma</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 font-semibold">
                      <span className="text-slate-450">Bank Account Name:</span>
                      <span className="text-rose-600 font-extrabold">{fetchedBankName || 'Unknown'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPennyDropState('idle');
                      setBankHolderInputName('Aarav Sharma'); // Auto correction help
                    }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Reset & Retry (Use 'Aarav Sharma')
                  </button>
                </m.div>
              )}
            </div>
          </m.div>
        )}

        {/* ================= STATE 3: THE "ZERO-TO-ONE" LISTING WIZARD ================= */}
        {pipelineState === 'WIZARD' && (
          <m.div
            key="listing-wizard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-2xl bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-lg text-left relative overflow-hidden">
              
              {/* Progress Stepper Header */}
              <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Property Onboarding Wizard
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Create Your First Listing
                  </h2>
                </div>

                {/* Horizontal Step labels */}
                <div className="flex items-center gap-2 text-xs font-bold font-sans">
                  {[
                    { s: 1, name: 'Basics' },
                    { s: 2, name: 'Media' },
                    { s: 3, name: 'Financials' }
                  ].map((step) => (
                    <React.Fragment key={step.s}>
                      {step.s > 1 && <span className="text-slate-300">&bull;</span>}
                      <span className={`transition-colors ${
                        wizardStep === step.s 
                          ? 'text-indigo-600' 
                          : wizardStep > step.s 
                            ? 'text-emerald-500' 
                            : 'text-slate-400'
                      }`}>
                        {step.s}. {step.name}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Top Progress Bar */}
              <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden mb-8">
                <m.div 
                  className="bg-indigo-600 h-full rounded-full"
                  animate={{ width: `${(wizardStep / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="min-h-[260px]">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Basics */}
                  {wizardStep === 1 && (
                    <m.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Property Type selection */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block">Property Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Apartment', 'Villa', 'PG'].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  property: { ...prev.property, type: t as any }
                                }))}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                  formData.property.type === t
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block">Configuration (BHK)</label>
                          <select
                            value={formData.property.bhk}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              property: { ...prev.property, bhk: parseInt(e.target.value) }
                            }))}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none"
                          >
                            <option value={1}>1 BHK Studio</option>
                            <option value={2}>2 BHK Apartment</option>
                            <option value={3}>3 BHK Premium</option>
                            <option value={4}>4 BHK Penthouse</option>
                          </select>
                        </div>

                        {/* Address */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block">Premises Address</label>
                          <input
                            type="text"
                            placeholder="e.g. Bandra Skyloft Apartment, 12th Floor, Bandra West, Mumbai"
                            value={formData.property.address}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              property: { ...prev.property, address: e.target.value }
                            }))}
                            className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
                          />
                        </div>

                        {/* Total Units */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block">Total Units to Broadcast</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={formData.property.totalUnits || 1}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              property: { ...prev.property, totalUnits: Math.max(1, Number(e.target.value)) }
                            }))}
                            className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-850 font-bold focus:outline-none"
                          />
                        </div>

                      </div>

                      {/* Mock Google Maps visual pin card */}
                      <div className="bg-slate-100 border border-slate-200/60 rounded-2xl h-36 relative overflow-hidden flex items-center justify-center text-slate-400 font-semibold group cursor-pointer">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-100 to-slate-200/80 pointer-events-none" />
                        
                        {/* Interactive maps layout grids */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4B554F_1px,transparent_1px),linear-gradient(to_bottom,#4B554F_1px,transparent_1px)] bg-[size:14px_24px]" />

                        <div className="relative flex flex-col items-center gap-1.5 z-10 text-slate-600">
                          <MapPin className="w-8 h-8 text-indigo-600 animate-bounce" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            Interactive Pin Placed in Bandra West
                          </span>
                          <span className="text-[9px] text-slate-450">Latitude: 19.0543 &bull; Longitude: 72.8224</span>
                        </div>
                      </div>
                    </m.div>
                  )}

                  {/* Step 2: Media Dropzone */}
                  {wizardStep === 2 && (
                    <m.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block text-left">
                        Property Photos & Floorplans
                      </label>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {/* Live preview cards */}
                        {uploadedPhotos.map((url, i) => (
                          <div key={i} className="relative h-28 rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200">
                            <img src={url} alt="Listing preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-1.5 right-1.5 p-1 bg-slate-900/85 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Dropzone trigger */}
                        <div
                          onClick={() => {
                            setUploadedPhotos(prev => [
                              ...prev,
                              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80'
                            ]);
                          }}
                          className="h-28 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-slate-500 font-semibold"
                        >
                          <Plus className="w-6 h-6 text-slate-400" />
                          <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Add Mock</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 text-[10.5px] text-slate-650 rounded-2xl leading-normal font-semibold text-left">
                        💡 <strong>Media Checklist:</strong> Clean, high-contrast photos taken during daylight improve applicant approval speed by up to 40% on the RentEdge ecosystem.
                      </div>
                    </m.div>
                  )}

                  {/* Step 3: Financials */}
                  {wizardStep === 3 && (
                    <m.div
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Rent Expected */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block">Expected Monthly Rent</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.property.rent}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                property: { ...prev.property, rent: parseInt(e.target.value) || 0 }
                              }))}
                              className="w-full p-3.5 pl-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none"
                            />
                            <span className="absolute left-3.5 top-3.5 font-bold text-slate-400 text-xs">₹</span>
                          </div>
                        </div>

                        {/* Security Deposit */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide block">Security Deposit Expected</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.property.deposit}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                property: { ...prev.property, deposit: parseInt(e.target.value) || 0 }
                              }))}
                              className="w-full p-3.5 pl-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none"
                            />
                            <span className="absolute left-3.5 top-3.5 font-bold text-slate-400 text-xs">₹</span>
                          </div>
                        </div>

                        {/* Min RentEdge Score */}
                        <div className="space-y-1 sm:col-span-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wide">
                              Minimum applicant rentedge score
                            </label>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {formData.property.minScore} &bull; Verified Tier
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min={600}
                            max={850}
                            step={10}
                            value={formData.property.minScore}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              property: { ...prev.property, minScore: parseInt(e.target.value) }
                            }))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-1">
                            <span>600 (Risky)</span>
                            <span>720 (Zero-Deposit Limit)</span>
                            <span>850 (Ultra Safe)</span>
                          </div>
                        </div>

                      </div>
                    </m.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Action Wizard Buttons */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between gap-4">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-250 text-slate-650 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishProperty}
                    className="px-6 py-3 bg-[#01411C] hover:bg-[#01411C] text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-sm animate-pulse"
                  >
                    <Compass className="w-4 h-4" />
                    Publish to Live Network
                  </button>
                )}
              </div>

            </div>
          </m.div>
        )}

        {/* ================= STATE 3: THE POST-ONBOARDING LANDLORD OS DASHBOARD ================= */}
        {pipelineState === 'INBOX' && (
          <m.div
            key="landlord-os-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <LandlordOS 
              onLogout={onLogout} 
              expectedRent={formData.property.rent} 
              propertyTitle={formData.property.address || 'Bandra Skyloft Apartment'} 
              totalUnits={formData.property.totalUnits || 1}
              onListAnotherProperty={() => {
                // Smoothly reset listing form state and jump back to step 1
                setWizardStep(1);
                setPipelineState('WIZARD');
              }}
            />
          </m.div>
        )}

      </AnimatePresence>

    </div>
  );
}
