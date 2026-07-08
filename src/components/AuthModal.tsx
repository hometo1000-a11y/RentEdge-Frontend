'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Check, Building2, Home, Mail, Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { api } from './api';
import { supabase } from '@/lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const roleOptions = [
  {
    id: 'tenant',
    label: 'Tenant',
    desc: 'Browse and rent a property',
    icon: Home,
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 'owner',
    label: 'Landlord / Owner',
    desc: 'List and let people discover your property',
    icon: Building2,
    accent: 'from-emerald-500 to-teal-500',
  },
];

type SignupStep = 'form' | 'email_verification';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<'tenant' | 'owner'>('tenant');
  const [isLoading, setIsLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('form');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showStatus = (text: string, type: 'error' | 'success' | 'info' = 'error') => {
    setStatusMessage({ text, type });
    if (type !== 'error') {
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const persistLocalSession = (user: any) => {
    const role = user?.user_metadata?.role || user?.role || 'tenant';
    localStorage.setItem('Homtu_authenticated', 'true');
    localStorage.setItem(
      'Homtu_user_fullname',
      user?.fullName || user?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.fullName || ''
    );
    localStorage.setItem('Homtu_user_email', user?.email || email);
    localStorage.setItem('Homtu_user_role', role);
  };

  const handleStartSignup = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      showStatus('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      showStatus('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showStatus('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      console.info('[auth][signup] running pre-check', { email });
      const checkRes = await api.preCheck({ email, phone });
      if (checkRes.status === 'exists') {
        console.info('[auth][signup] pre-check found existing account', { email, reason: checkRes.message });
        showStatus('This account already exists. Please log in.', 'error');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          data: {
            full_name: fullName,
            phone,
            role: selectedRoleId,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        localStorage.setItem('Homtu_pending_signup_role', selectedRoleId);
        localStorage.setItem('Homtu_pending_signup_name', fullName);
        localStorage.setItem('Homtu_pending_signup_email', email);
      }

      if (data.session) {
        const response = await api.completeSignup({
          fullName,
          role: selectedRoleId,
          supabaseAccessToken: data.session.access_token,
        });
        persistLocalSession(response.user);
        showStatus('Account created successfully.', 'success');
        onSuccess(response.user);
        onClose();
        return;
      }

      setSignupStep('email_verification');
      showStatus('Account created. Please verify your email to continue.', 'success');
    } catch (err: any) {
      console.error(err);
      const message = String(err?.message || '');
      if (/already registered|already exists|user already exists|duplicate/i.test(message)) {
        console.warn('[auth][signup] Supabase auth account already exists', { email, message });
        showStatus('An authentication account already exists for this email. Please log in instead.', 'error');
        return;
      }
      showStatus(err.message || 'Failed to initiate signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      console.info('[auth][login] attempting sign-in', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (!data.session) {
        showStatus('Please verify the email link, then log in again.');
        return;
      }

      const verified = Boolean(data.session.user.email_confirmed_at || data.session.user.confirmed_at);
      if (!verified) {
        showStatus('Email is not verified yet. Please check your inbox.');
        return;
      }

      const response = await api.completeSignup({
        fullName: fullName || data.session.user.user_metadata?.full_name || '',
        role: selectedRoleId,
        supabaseAccessToken: data.session.access_token,
      });

      persistLocalSession(response.user);
      onSuccess(response.user);
      onClose();
      showStatus('Email verified successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || 'Verification check failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      showStatus('Enter your email address first.');
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      showStatus('Verification email resent successfully.', 'success');
    } catch (err: any) {
      showStatus(err.message || 'Failed to resend email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showStatus('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (!data.session) {
        showStatus('Login completed, but no session was returned.');
        return;
      }

      const response = await api.login({
        supabaseAccessToken: data.session.access_token,
      });

      persistLocalSession(response.user);
      onSuccess(response.user);
      onClose();
    } catch (err: any) {
      showStatus(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      showStatus('Please enter a valid email address in the email field to reset your password.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
      if (error) throw error;
      showStatus('Password reset email sent. Please check your inbox.', 'success');
    } catch (err: any) {
      showStatus(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup') {
      if (signupStep === 'form') {
        await handleStartSignup();
      } else {
        await handleVerifyEmail();
      }
    } else {
      await handleLogin();
    }
  };

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setSignupStep('form');
    setStatusMessage(null);
  };

  const formContainerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ type: 'spring', duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#06130C]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(1,65,28,0.10)] z-10 text-white overflow-hidden text-left"
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-purple/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-mint/10 rounded-full blur-[60px] pointer-events-none" />

            <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center z-20 border border-white/5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <motion.div initial={{ rotate: -5, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} className="flex items-center gap-1.5 justify-center mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white text-slate-900 font-bold shadow-md">
                  <span className="text-sm font-extrabold tracking-tighter">RE</span>
                </div>
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  Rent<span className="text-brand-purple">Edge</span>
                </span>
              </motion.div>
              <p className="text-xs text-slate-400 font-medium max-w-xs mt-1">
                Zero Brokerage. Fintech Billing. Auto Escrows.
              </p>
            </div>

            <div className="bg-slate-950/60 p-1.5 rounded-2xl flex mb-6 relative border border-white/5">
              <button type="button" onClick={() => switchTab('login')} className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider relative z-10 text-center transition-colors cursor-pointer">
                <span className={activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>Login</span>
                {activeTab === 'login' && <motion.div layoutId="authActiveTab" className="absolute inset-0 bg-[#06130C] border border-white/10 rounded-xl -z-10 shadow-lg" transition={{ type: 'spring', stiffness: 350, damping: 25 }} />}
              </button>

              <button type="button" onClick={() => switchTab('signup')} className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider relative z-10 text-center transition-colors cursor-pointer">
                <span className={activeTab === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>Sign Up</span>
                {activeTab === 'signup' && <motion.div layoutId="authActiveTab" className="absolute inset-0 bg-[#06130C] border border-white/10 rounded-xl -z-10 shadow-lg" transition={{ type: 'spring', stiffness: 350, damping: 25 }} />}
              </button>
            </div>

            <AnimatePresence>
              {statusMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mb-4 px-4 py-2.5 rounded-xl text-[11px] font-semibold border ${statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' : statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-brand-purple/10 border-brand-purple/20 text-purple-300'}`}>
                  {statusMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form variants={formContainerVariants} initial="hidden" animate="show" onSubmit={handleSubmit} className="flex flex-col gap-5">
              <AnimatePresence initial={false}>
                {activeTab === 'signup' && signupStep === 'form' && (
                  <motion.div variants={formItemVariants} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Select Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {roleOptions.map((opt) => {
                          const IconComp = opt.icon;
                          const isSelected = selectedRoleId === opt.id;
                          return (
                            <button key={opt.id} type="button" onClick={() => setSelectedRoleId(opt.id as 'tenant' | 'owner')} className={`group/role relative p-2.5 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition-all duration-300 ${isSelected ? 'border-brand-purple bg-brand-purple/10 shadow-[0_0_20px_rgba(124,58,237,0.1)]' : 'border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-white/10'}`}>
                              <div className={`p-2 rounded-xl bg-gradient-to-tr ${opt.accent} ${isSelected ? 'opacity-100 text-white' : 'opacity-60 text-slate-300 group-hover/role:opacity-100'} transition-opacity shadow shrink-0`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="text-left flex-1 min-w-0 pr-1">
                                <span className="block text-[11px] font-black text-white leading-tight">{opt.label}</span>
                                <span className="block text-[8px] leading-normal text-slate-400 mt-0.5">{opt.desc}</span>
                              </div>
                              {isSelected && <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-purple rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white stroke-[3px]" /></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                        <input type="text" required placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
                        <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Phone className="w-4 h-4" /></div>
                        <input type="tel" required pattern="[0-9]{10}" placeholder="10 digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                        <input type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="Enter security key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer focus:outline-none">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                        <input type={showConfirmPassword ? 'text' : 'password'} required minLength={6} placeholder="Confirm security key" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer focus:outline-none">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'signup' && signupStep === 'email_verification' && (
                <motion.div variants={formItemVariants} className="space-y-4 text-center py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mx-auto w-12 h-12 bg-brand-purple/20 text-brand-purple rounded-full flex items-center justify-center mb-2">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Verify Your Email</h3>
                  <p className="text-[11px] text-slate-400 font-medium max-w-xs mx-auto">
                    A verification link has been sent to <span className="text-white">{email}</span>. Please click the link to complete your registration.
                  </p>
                  <div className="pt-2 flex justify-center">
                    <button type="button" onClick={handleResendEmail} className="text-[10px] text-brand-purple font-bold hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none">
                      Resend Verification Email
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'login' && (
                <motion.div variants={formItemVariants} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
                      <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
                      <button type="button" onClick={handleForgotPassword} className="text-[10px] text-brand-purple font-semibold hover:underline cursor-pointer focus:outline-none bg-transparent border-none p-0">Forgot?</button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                      <input type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-brand-primary rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div variants={formItemVariants} className="pt-2">
                <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-brand-purple text-white text-xs font-bold rounded-xl shadow-lg hover:bg-[#003B1F] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:bg-purple-800 cursor-pointer">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Processing...
                    </>
                  ) : (
                    activeTab === 'login'
                      ? 'Secure Login Gateway'
                      : signupStep === 'form'
                        ? 'Create Account'
                        : 'I\'ve Verified My Email'
                  )}
                </button>
              </motion.div>
            </motion.form>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Protected by e-verification APIs. By continuing, you agree to our <span className="hover:text-slate-350 cursor-pointer underline">Terms</span> and <span className="hover:text-slate-350 cursor-pointer underline">Privacy Guidelines</span>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
