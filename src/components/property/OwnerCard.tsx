'use client';

import { User, Phone, CheckCircle2, Clock } from 'lucide-react';
import { Property } from '../propertiesData';

interface OwnerCardProps {
  property: Property;
  displayedPhone: string;
  isUnlocked: boolean;
}

/**
 * Owner/landlord info card with trust indicators.
 * Shows verified badge, response time estimate, and masked/revealed phone.
 */
export default function OwnerCard({ property, displayedPhone, isUnlocked }: OwnerCardProps) {
  // Build initials from owner name
  const initials = property.ownerName
    ? property.ownerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 space-y-3 text-left">
      <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
        Property Owner
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-brand-purple/10 dark:bg-brand-purple/20 border border-brand-purple/20 dark:border-brand-purple/30 flex items-center justify-center shrink-0">
            <span className="text-brand-purple dark:text-[#A78BFA] font-black text-xs">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
              {property.ownerName}
            </p>
            <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              {displayedPhone}
            </p>
          </div>
        </div>

        {/* Verification badge */}
        {isUnlocked ? (
          <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified
          </span>
        ) : (
          <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-full shrink-0">
            Encrypted
          </span>
        )}
      </div>

      {/* Trust indicators */}
      <div className="flex items-center gap-3 pt-1">
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
          <Clock className="w-3 h-3 shrink-0" />
          Responds within 2 hrs
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          ID Verified
        </span>
      </div>

      {/* Unlocked confirmation */}
      {isUnlocked && (
        <div className="flex items-center gap-2 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Landlord notified of your interest.
        </div>
      )}
    </div>
  );
}
