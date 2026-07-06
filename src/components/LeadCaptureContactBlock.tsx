'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, CheckCircle2, MessageSquare, X, Shield, ArrowRight } from 'lucide-react';

interface LeadCaptureContactBlockProps {
  propertyId: string;
  ownerPhoneMasked: string;
  ownerPhoneFull: string;
  ownerName: string;
  onUnlocked?: () => void;
  isUnlockedInitially?: boolean;
}

export default function LeadCaptureContactBlock({
  propertyId,
  ownerPhoneMasked,
  ownerPhoneFull,
  ownerName,
  onUnlocked,
  isUnlockedInitially = false
}: LeadCaptureContactBlockProps) {
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedInitially);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedNumber, setDisplayedNumber] = useState(ownerPhoneMasked);

  // Sync initial state from localStorage if enquired previously
  useEffect(() => {
    const isAuthed = localStorage.getItem('Homtu_authenticated') === 'true';
    const enquired = isAuthed || localStorage.getItem(`Homtu_enquired_${propertyId}`) === 'true';
    if (enquired || isUnlockedInitially) {
      setIsUnlocked(true);
      setDisplayedNumber(ownerPhoneFull);
    }
  }, [propertyId, ownerPhoneFull, isUnlockedInitially]);

  const handleOpenModal = () => {
    if (isUnlocked) return;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setIsUnlocked(true);
      
      // Save leads validation
      localStorage.setItem(`Homtu_enquired_${propertyId}`, 'true');
      
      // Scramble reveal animation
      triggerScramble(ownerPhoneFull);

      if (onUnlocked) {
        onUnlocked();
      }
    }, 1200);
  };

  // High-fidelity character scrambling effect — converts masked → revealed
  const triggerScramble = (targetNum: string) => {
    // Extract only digit positions from the target number string
    const digitPositions = targetNum
      .split('')
      .map((char, i) => ({ char, i }))
      .filter(({ char }) => /\d/.test(char))
      .map(({ i }) => i);

    let revealedCount = 0;

    const interval = setInterval(() => {
      setDisplayedNumber(() => {
        const chars = targetNum.split('');
        return chars
          .map((char, index) => {
            // Always preserve: '+', ' ', static prefix digits (+91)
            if (char === '+' || char === ' ') return char;
            if (index < 4) return char; // Keep '+91 ' prefix intact

            const positionInDigits = digitPositions.indexOf(index);

            if (positionInDigits === -1) return char; // Not a digit position

            // Already revealed: lock it
            if (positionInDigits < revealedCount) {
              return targetNum[index];
            }

            // Scramble remaining digits
            return Math.floor(Math.random() * 10).toString();
          })
          .join('');
      });

      revealedCount += 0.8; // Gradual unlock speed

      if (revealedCount >= digitPositions.length + 2) {
        setDisplayedNumber(targetNum);
        clearInterval(interval);
      }
    }, 50);
  };

  return (
    <div className="w-full text-left space-y-4">
      {/* Visual Glassmorphic Contact Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 text-left space-y-4 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-black text-slate-700">Owner Direct Contact</span>
          </div>
          {isUnlocked ? (
            <span className="text-[9px] uppercase font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Unlocked
            </span>
          ) : (
            <span className="text-[9px] uppercase font-black text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              Encrypted
            </span>
          )}
        </div>

        {/* Monospaced Digit Field */}
        <div className="font-mono text-base font-extrabold tracking-wider text-slate-800 bg-white border border-slate-150 rounded-xl px-4 py-3 flex items-center justify-between shadow-inner">
          <span>{displayedNumber}</span>
          {!isUnlocked && (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        <p className="text-[10.5px] text-slate-500 font-semibold leading-normal">
          {isUnlocked
            ? `Direct number unlocked. Contact landlord ${ownerName} to set up visits.`
            : "Protected via Homtu Privacy Shield. Verify WhatsApp to reveal number."
          }
        </p>

        {/* Primary Action Trigger */}
        {!isUnlocked && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenModal}
            className="w-full py-3.5 bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-black rounded-xl shadow-md shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
          >
            <span>Unlock Owner Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}

        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-emerald-50/70 border border-emerald-100 text-[#01411C] text-[10.5px] rounded-xl font-bold flex items-center gap-2 justify-center"
          >
            <CheckCircle2 className="w-4 h-4 text-[#01411C]" />
            <span>Landlord notified of your interest.</span>
          </motion.div>
        )}
      </div>

      {/* LEAD CAPTURE MODAL / BOTTOM SHEET */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              // Swipe-down configuration for mobile bottom-sheet dismissal
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.7 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 150) {
                  handleCloseModal();
                }
              }}
              className="relative w-full sm:max-w-md bg-white border border-slate-150 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl z-10 text-slate-800 overflow-hidden text-left"
            >
              {/* Swipe handle indicator for mobile devices */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 block sm:hidden cursor-row-resize" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-brand-purple">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Unlock Landlord Details</h4>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center cursor-pointer border border-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-semibold leading-normal mb-5">
                Enter your 10-digit WhatsApp number to instantly view the owner's contact info.
              </p>

              <form onSubmit={handleSubmitLead} className="space-y-4">
                {/* Prefix input grid wrapper */}
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-xs font-black text-slate-400 select-none border-r border-slate-150 pr-2.5">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="WhatsApp Mobile Number"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-16 pr-4 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-purple transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#01411C] hover:bg-[#01411C]/95 disabled:bg-emerald-300 text-white text-xs font-black rounded-xl shadow-md shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 fill-white" />
                      <span>Unlock Number</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Escrow & Landlord credentials</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
