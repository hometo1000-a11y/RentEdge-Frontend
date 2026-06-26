'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Zap, CheckCircle2, UserCheck, Receipt, ArrowUpRight } from 'lucide-react';

const features = [
  {
    title: 'Verified Landlords Only',
    badge: '100% Broker-Free',
    description: 'We perform automated land registry verification on every property. No duplicate postings, no phantom listings, and absolutely no middleman charges.',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/10',
    borderHover: 'hover:border-emerald-500/30',
    glow: 'bg-emerald-500/15',
    visual: (
      <div className="relative w-full h-32 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex flex-col p-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
              AS
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800">Ananya Sharma</span>
              <span className="block text-[9px] text-slate-400">Landlord Since 2024</span>
            </div>
          </div>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-mint/10 text-[9px] font-bold text-brand-mint">
            <UserCheck className="w-2.5 h-2.5" />
            Verified Owner
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100/50">
            <span className="text-[10px] text-slate-500 font-medium">Registry Doc Verification</span>
            <span className="text-[10px] text-brand-mint font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Pass
            </span>
          </div>
          <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100/50">
            <span className="text-[10px] text-slate-500 font-medium">Tenant Anti-Harassment Guarantee</span>
            <span className="text-[10px] text-brand-mint font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Build Your Rent Score™',
    badge: 'Bureau Integrations',
    description: 'We report your on-time rent payments directly to CIBIL and Experian. Turn your biggest monthly expense into financial leverage to secure cheaper loans.',
    icon: TrendingUp,
    color: 'from-violet-500/20 to-purple-500/10',
    borderHover: 'hover:border-brand-purple/30',
    glow: 'bg-brand-purple/15',
    visual: (
      <div className="relative w-full h-32 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex flex-col p-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Financial Profile</span>
          <span className="text-[9px] font-bold text-slate-400">Bureau Score Status</span>
        </div>
        <div className="mt-2.5 flex items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-brand-purple"
                strokeDasharray="80, 100"
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: "78, 100" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-extrabold text-slate-800">782</span>
              <span className="text-[7px] font-bold text-brand-mint uppercase tracking-wider">Excellent</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1 text-[10px]">
            <div className="flex justify-between items-center text-slate-600">
              <span>Next Check-In</span>
              <span className="font-bold text-slate-800">Jun 10</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Points Earned</span>
              <span className="font-bold text-brand-purple">+28 pts</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Loan Multiplier</span>
              <span className="font-bold text-brand-mint">1.4x</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'UPI & Automated Receipts',
    badge: '1-Click HRA Exemption',
    description: 'Pay instantly via UPI or auto-debit. We split rent immediately into landlord transfer, society dues, and instantly dispatch HRA-compliant tax receipts.',
    icon: Zap,
    color: 'from-amber-500/20 to-orange-500/10',
    borderHover: 'hover:border-amber-500/30',
    glow: 'bg-amber-500/15',
    visual: (
      <div className="relative w-full h-32 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex flex-col p-3 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">HRA Tax Invoice</span>
          </div>
          <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
            E-Signed
          </span>
        </div>
        <div className="mt-2.5 flex flex-col gap-1 text-[9px] text-slate-500 font-medium">
          <div className="flex justify-between">
            <span>Transaction ID:</span>
            <span className="font-bold text-slate-700">RE-8290-UPI</span>
          </div>
          <div className="flex justify-between">
            <span>Rent Transfer Amount:</span>
            <span className="font-bold text-slate-900">₹32,500</span>
          </div>
          <div className="flex justify-between mt-1 text-slate-400 border-t border-dashed border-slate-200 pt-1">
            <span>HRA Section 80GG Eligible</span>
            <span className="font-bold text-brand-mint">Fully Compliant</span>
          </div>
        </div>
      </div>
    )
  }
];

export default function Features() {
  return (
    <section id="features" className="w-full px-4 py-20 md:py-28 bg-white border-y border-slate-100 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full">
            Our Edge
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-brand-primary mt-4 font-sans">
            How RentEdge Redefines Indian Renting
          </h2>
          <p className="text-slate-500 mt-4 text-base font-normal">
            No broker friction, no fake accounts. Just robust fintech tools built to make renting as clean and rewarding as checking out with Stripe.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative group bg-white border border-slate-100 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${feat.borderHover}`}
              >
                {/* Glow Backdrop */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${feat.glow} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300 pointer-events-none`} />

                {/* Feature Icon & Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${feat.color} text-slate-800`}>
                    <Icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    {feat.badge}
                  </span>
                </div>

                {/* Interactive Card Visual */}
                <div className="mb-6">
                  {feat.visual}
                </div>

                {/* Text Content */}
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5 group-hover:text-brand-purple transition-colors">
                    {feat.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-2.5 font-normal leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
