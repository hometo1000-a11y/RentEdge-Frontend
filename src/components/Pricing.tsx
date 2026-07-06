'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  CheckCircle2,
  Zap,
  TrendingUp,
  Shield,
  FileText,
  Mic,
  BarChart3,
  Star,
  ArrowRight,
  X,
  Sparkles,
  CreditCard,
  Building2,
} from 'lucide-react';

// ─────────────────────────── types ───────────────────────────
type Tab = 'tenant' | 'landlord';

// ─────────────────────────── data ───────────────────────────
const tenantPlans = [
  {
    id: 'basic',
    name: 'RentEdge Basic',
    price: '₹0',
    period: 'forever',
    badge: null,
    highlight: false,
    accentColor: 'from-slate-800 to-slate-900',
    borderColor: 'border-white/10',
    buttonStyle: 'ghost',
    buttonLabel: 'Start Searching',
    buttonIcon: <ArrowRight className="w-4 h-4" />,
    features: [
      { text: 'Unlimited owner contacts', included: true },
      { text: 'Secure digital lease signing', included: true },
      { text: '0% fee on UPI rent payments', included: true },
      { text: 'CIBIL rent reporting', included: false },
      { text: 'Zero-deposit loan eligibility', included: false },
      { text: '1.5% cashback on CC rent payments', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'RentEdge Plus',
    price: '₹499',
    period: 'month',
    yearlyPrice: '₹4,999',
    badge: 'Most Popular',
    highlight: true,
    accentColor: 'from-[#06130C] to-[#0B1F14]',
    borderColor: 'border-[#01411C]/40',
    buttonStyle: 'solid-purple',
    buttonLabel: 'Upgrade & Build Credit',
    buttonIcon: <TrendingUp className="w-4 h-4" />,
    features: [
      { text: 'Official rent reporting to CIBIL', included: true },
      { text: 'Zero-deposit loan eligibility', included: true },
      { text: '1.5% cashback on CC rent payments', included: true },
      { text: 'Priority support (< 2hr SLA)', included: true },
      { text: 'Unlimited owner contacts', included: true },
      { text: 'Secure digital lease signing', included: true },
    ],
  },
];

const landlordPlans = [
  {
    id: 'starter',
    name: 'Starter OS',
    price: '₹0',
    period: 'forever',
    badge: null,
    highlight: false,
    accentColor: 'from-slate-800 to-slate-900',
    borderColor: 'border-white/10',
    buttonStyle: 'ghost',
    buttonLabel: 'List First Property',
    buttonIcon: <ArrowRight className="w-4 h-4" />,
    features: [
      { text: '1 Free Property Listing', included: true },
      { text: 'Automated UPI rent collection', included: true },
      { text: 'Verified tenant screening', included: true },
      { text: 'Digital lease generation', included: true },
      { text: 'Unlimited property listings', included: false },
      { text: 'Voice AI Collection Agent', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'RentEdge OS Pro',
    price: '₹999',
    period: 'month',
    yearlyPrice: '₹9,999',
    badge: 'Full Automation',
    highlight: true,
    accentColor: 'from-emerald-950 to-teal-950',
    borderColor: 'border-emerald-500/40',
    buttonStyle: 'solid-mint',
    buttonLabel: 'Automate Your Portfolio',
    buttonIcon: <Zap className="w-4 h-4" />,
    features: [
      { text: 'Unlimited property listings', included: true },
      { text: 'Voice AI Collection Agent', included: true },
      { text: 'Automated tax & cashflow reports', included: true },
      { text: 'Premium tenant Walled Garden placement', included: true },
      { text: 'Automated UPI rent collection', included: true },
      { text: 'Verified tenant screening', included: true },
    ],
  },
];

const comparisonRows = [
  {
    label: 'Brokerage Fees',
    icon: <CreditCard className="w-4 h-4" />,
    rentedge: { value: '₹0 — Always', positive: true },
    magicbricks: { value: 'Up to 1 month rent', positive: false },
    nobroker: { value: 'Up to 1 month rent', positive: false },
  },
  {
    label: 'Contact Owners',
    icon: <Building2 className="w-4 h-4" />,
    rentedge: { value: 'Free & Instant', positive: true },
    magicbricks: { value: '₹999+ subscription', positive: false },
    nobroker: { value: '₹999+ subscription', positive: false },
  },
  {
    label: 'Fake Listings',
    icon: <Shield className="w-4 h-4" />,
    rentedge: { value: '0 — Aadhaar Verified', positive: true },
    magicbricks: { value: 'High volume', positive: false },
    nobroker: { value: 'High volume', positive: false },
  },
  {
    label: 'Credit Building',
    icon: <TrendingUp className="w-4 h-4" />,
    rentedge: { value: 'CIBIL Integration', positive: true },
    magicbricks: { value: 'None', positive: false },
    nobroker: { value: 'None', positive: false },
  },
];

// ─────────────────────────── sub-components ───────────────────────────

function GlowBadge({ label, color }: { label: string; color: 'purple' | 'mint' }) {
  const styles =
    color === 'purple'
      ? 'bg-violet-500/20 text-violet-300 border-[#01411C]/40 shadow-sm'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-lg ${styles}`}
    >
      <Sparkles className="w-3 h-3 animate-pulse" />
      {label}
    </span>
  );
}

function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {included ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
      ) : (
        <X className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
      )}
      <span className={included ? 'text-slate-200' : 'text-slate-500 line-through'}>{text}</span>
    </li>
  );
}

interface PlanCardProps {
  plan: (typeof tenantPlans)[0] & { yearlyPrice?: string };
  tab: Tab;
  billingCycle: 'monthly' | 'yearly';
  index: number;
}

function PlanCard({ plan, tab, billingCycle, index }: PlanCardProps) {
  const isYearly = billingCycle === 'yearly' && 'yearlyPrice' in plan && plan.yearlyPrice;
  const displayPrice = isYearly ? plan.yearlyPrice! : plan.price;
  const displayPeriod = isYearly ? 'year' : plan.period;

  const badgeColor: 'purple' | 'mint' =
    tab === 'tenant' ? 'purple' : 'mint';

  const hoverGlow =
    plan.highlight
      ? tab === 'tenant'
        ? '0 0 40px rgba(1,65,28,0.15)'
        : '0 0 40px rgba(16,185,129,0.25)'
      : '0 8px 30px rgba(0,0,0,0.4)';

  return (
    <motion.div
      key={plan.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: plan.highlight ? -8 : 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: plan.highlight ? -13 : -5, scale: 1.02, boxShadow: hoverGlow }}
      className={`
        relative flex flex-col rounded-3xl border backdrop-blur-md
        bg-gradient-to-br ${plan.accentColor} ${plan.borderColor}
        p-8 cursor-pointer overflow-hidden min-w-[85vw] sm:min-w-[340px] md:min-w-0 snap-center
        ${plan.highlight ? 'shadow-2xl' : 'shadow-md'}
      `}
      style={{ boxShadow: plan.highlight ? hoverGlow : undefined }}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] pointer-events-none rounded-3xl" />

      {/* Gradient orb for highlighted card */}
      {plan.highlight && (
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 ${
            tab === 'tenant' ? 'bg-violet-500' : 'bg-emerald-400'
          }`}
        />
      )}

      {/* Badge */}
      <div className="mb-5 min-h-[28px]">
        {plan.badge && <GlowBadge label={plan.badge} color={badgeColor} />}
      </div>

      {/* Plan name */}
      <h3 className="text-lg font-extrabold text-white tracking-tight mb-1">{plan.name}</h3>

      {/* Price */}
      <div className="flex items-end gap-1.5 mb-6">
        <span className="text-4xl font-black text-white">{displayPrice}</span>
        {displayPeriod !== 'forever' && (
          <span className="text-slate-400 text-sm font-semibold pb-1">/ {displayPeriod}</span>
        )}
        {displayPeriod === 'forever' && (
          <span className="text-slate-400 text-sm font-semibold pb-1">forever</span>
        )}
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <FeatureRow key={f.text} text={f.text} included={f.included} />
        ))}
      </ul>

      {/* CTA Button */}
      {plan.buttonStyle === 'ghost' ? (
        <button className="w-full py-3.5 rounded-2xl border border-white/20 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-200">
          {plan.buttonLabel}
          {plan.buttonIcon}
        </button>
      ) : plan.buttonStyle === 'solid-purple' ? (
        <button className="w-full py-3.5 rounded-2xl bg-[#01411C] hover:bg-[#003B1F] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sm transition-all duration-200">
          {plan.buttonLabel}
          {plan.buttonIcon}
        </button>
      ) : (
        <button className="w-full py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#F0C94A] text-[#06130C] text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sm transition-all duration-200">
          {plan.buttonLabel}
          {plan.buttonIcon}
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────── main component ───────────────────────────

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<Tab>('tenant');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const sectionRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const tableInView = useInView(tableRef, { once: true, margin: '-80px' });

  const plans = activeTab === 'tenant' ? tenantPlans : landlordPlans;

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="w-full bg-[#06130C] py-24 px-4 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-violet-400 mb-4 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Simple pricing.<br className="hidden sm:block" />
            <span className="text-[#D4AF37]">
              Radical value.
            </span>
          </h2>
        </motion.div>

        {/* ── Tab Toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative flex items-center bg-slate-800/60 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
            {/* Sliding pill */}
            <motion.div
              layout
              layoutId="tab-pill"
              className="absolute top-1 bottom-1 rounded-xl bg-white/10 border border-white/20"
              style={{
                left: activeTab === 'tenant' ? 4 : '50%',
                right: activeTab === 'tenant' ? '50%' : 4,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            {(['tenant', 'landlord'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 px-7 py-2.5 text-sm font-bold rounded-xl transition-colors duration-200 ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'tenant' ? 'For Tenants' : 'For Landlords'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Billing cycle toggle (Enabled for both Tenant & Landlord) ── */}
        <div className="flex justify-center mb-8 mt-4">
          <div className="flex items-center gap-3 bg-slate-800/50 border border-white/10 rounded-full px-4 py-2">
            <span
              className={`text-xs font-semibold cursor-pointer transition-colors ${
                billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                billingCycle === 'yearly' ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <motion.div
                animate={{ x: billingCycle === 'yearly' ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              />
            </button>
            <span
              className={`text-xs font-semibold cursor-pointer transition-colors ${
                billingCycle === 'yearly' ? 'text-emerald-400' : 'text-slate-500'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                {activeTab === 'tenant' ? 'Save ₹1k' : 'Save ₹2k'}
              </span>
            </span>
          </div>
        </div>

        {/* ── Pricing Cards ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-2 md:gap-8 items-start no-scrollbar"
          >
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                tab={activeTab}
                billingCycle={billingCycle}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-slate-500 text-xs font-semibold"
        >
          {[
            { icon: <Shield className="w-3.5 h-3.5" />, label: 'RBI Compliant' },
            { icon: <FileText className="w-3.5 h-3.5" />, label: 'Cancel Anytime' },
            { icon: <Star className="w-3.5 h-3.5" />, label: 'No hidden fees' },
            { icon: <Zap className="w-3.5 h-3.5" />, label: 'Instant activation' },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              {icon}
              {label}
            </span>
          ))}
        </motion.div>
      </div>


    </section>
  );
}
