'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, Building2, ChevronRight, Check } from 'lucide-react';

export default function RentScoreSimulator() {
  const [monthlyRent, setMonthlyRent] = useState<number>(35000);
  const [leaseDuration, setLeaseDuration] = useState<number>(11);
  const [isAutoPay, setIsAutoPay] = useState<boolean>(true);

  // Dynamic calculations
  const basePoints = Math.round((monthlyRent / 5000) * (leaseDuration / 11));
  const autoPayBonus = isAutoPay ? 35 : 0;
  const scoreBoost = Math.min(120, basePoints + autoPayBonus);
  const projectedScore = 680 + scoreBoost;
  
  // Credit Limit unlocked (approx. rent value * multiplier)
  const creditLimit = Math.round((monthlyRent * 3) + (scoreBoost * 1500));
  const isZeroDepositEligible = projectedScore >= 720;
  const yearlyCashback = Math.round((monthlyRent * 12 * 0.015) + (isAutoPay ? 1200 : 0));

  return (
    <section id="simulator" className="w-full px-4 py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-brand-mint/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 relative">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-mint bg-brand-mint/10 border border-brand-mint/20 px-3 py-1 rounded-full">
            Fintech Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 font-sans text-white">
            Simulate Your Rent Score™
          </h2>
          <p className="text-slate-400 mt-4 text-base font-normal">
            Rent is your largest recurring cost. Move the sliders to see how paying rent via RentEdge builds credit points and unlocks direct financial benefits.
          </p>
        </div>

        {/* Simulator Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Controls: Left Panel (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-mint animate-pulse" />
              Interactive Parameters
            </h3>

            <div className="flex flex-col gap-8">
              {/* Monthly Rent Slider */}
              <div className="text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Rent Amount</span>
                  <span className="text-lg font-extrabold text-brand-mint">
                    ₹{monthlyRent.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-mint"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-2">
                  <span>₹10,000</span>
                  <span>₹75,000</span>
                  <span>₹1,50,000+</span>
                </div>
              </div>

              {/* Lease Duration Slider */}
              <div className="text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lease Duration</span>
                  <span className="text-lg font-extrabold text-brand-purple">
                    {leaseDuration} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="36"
                  step="1"
                  value={leaseDuration}
                  onChange={(e) => setLeaseDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-2">
                  <span>11 Months (Std)</span>
                  <span>24 Months</span>
                  <span>36 Months (Long)</span>
                </div>
              </div>

              {/* Auto Pay via UPI Switch */}
              <div 
                onClick={() => setIsAutoPay(!isAutoPay)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-white/5 cursor-pointer hover:border-brand-purple/20 transition-all select-none text-left"
              >
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl border transition-colors ${isAutoPay ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">Enable Auto-pay via UPI Debit</span>
                    <span className="block text-xs text-slate-400 font-normal mt-0.5">Reported on-time credit status + extra points guarantee</span>
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${isAutoPay ? 'bg-brand-mint' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isAutoPay ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            <div className="mt-8 text-xs text-slate-500 text-left leading-relaxed">
              * Rent Score projections are based on actual credit bureau algorithm parameters (CIBIL/Experian) and payment verification logs.
            </div>
          </div>

          {/* Outputs: Right Panel (5 cols) */}
          <div className="lg:col-span-5 bg-[#06130C] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Background highlights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-[60px]" />
            
            <div className="text-left z-10 relative">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Projected Outcomes</span>
              
              {/* Score Meter */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Projected Rent Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-extrabold text-white tracking-tight">{projectedScore}</span>
                    <span className="text-xs font-bold text-brand-mint flex items-center gap-0.5 bg-brand-mint/10 px-2 py-0.5 rounded">
                      +{scoreBoost} pts
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>

              {/* Progress visual line */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  className="bg-brand-primary h-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((projectedScore - 300) / 550) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1">
                <span>300 (Poor)</span>
                <span>850 (Exceptional)</span>
              </div>
            </div>

            {/* Unlocked Benefits list */}
            <div className="mt-8 flex flex-col gap-3.5 z-10 relative text-left">
              
              {/* Unlocked credit limit */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Credit Line Unlocked</span>
                  <span className="block text-base font-extrabold text-white">₹{creditLimit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Zero deposit status */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isZeroDepositEligible ? 'bg-brand-mint/10 text-brand-mint' : 'bg-slate-800 text-slate-500'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Zero-Deposit Lease Eligibility</span>
                  <span className={`block text-xs font-extrabold ${isZeroDepositEligible ? 'text-brand-mint' : 'text-slate-400'}`}>
                    {isZeroDepositEligible ? '✅ Fully Qualified (Score > 720)' : '❌ Needs Score > 720'}
                  </span>
                </div>
              </div>

              {/* Cashback points */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Yearly UPI Cashbacks (Est.)</span>
                  <span className="block text-base font-extrabold text-white">₹{yearlyCashback.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Action CTA */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full py-4 bg-brand-mint text-brand-primary text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
            >
              Boost My Score
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

        </div>

      </div>
    </section>
  );
}
