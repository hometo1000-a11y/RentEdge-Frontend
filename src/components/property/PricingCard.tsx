'use client';

import { ShieldCheck } from 'lucide-react';
import { Property } from '../propertiesData';

interface PricingCardProps {
  property: Property;
}

/**
 * Pricing breakdown card for property detail views.
 * Shows rent, deposit, maintenance, and brokerage in a clean table layout.
 */
export default function PricingCard({ property }: PricingCardProps) {
  const deposit = property.deposit || property.price * (property.depositMonths || 0);
  const maintenance = (property.details?.maintenance_charges as number) || 0;

  return (
    <div className="bg-white dark:bg-[#101420] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Rent — Hero Element */}
      {property.type === 'PG' && property.details ? (
        <div className="text-left space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block border-b border-slate-100 dark:border-white/5 pb-2">Pricing</span>
          
          {(!property.details.food_option || property.details.food_option === 'WITHOUT_FOOD' || property.details.food_option === 'BOTH') && property.details.rent_without_food && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Without Food</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                ₹{Number(property.details.rent_without_food).toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">/mo</span>
              </div>
            </div>
          )}

          {(property.details.food_option === 'WITH_FOOD' || property.details.food_option === 'BOTH') && property.details.rent_with_food && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">With Food</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                ₹{Number(property.details.rent_with_food).toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">/mo</span>
              </div>
            </div>
          )}
          
          {/* Fallback for legacy PG without specific food pricing */}
          {(!property.details.rent_with_food && !property.details.rent_without_food) && (
            <div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                ₹{property.price.toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">/mo</span>
              </div>
            </div>
          )}
        </div>
      ) : property.type === 'Villa' && property.details ? (
        <div className="text-left space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block border-b border-slate-100 dark:border-white/5 pb-2">Pricing</span>
          
          {(!property.details.rental_model || property.details.rental_model === 'MONTHLY_ONLY' || property.details.rental_model === 'BOTH') && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Monthly Rent</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                ₹{(property.price || 0).toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">/mo</span>
              </div>
            </div>
          )}

          {(property.details.rental_model === 'DAILY_ONLY' || property.details.rental_model === 'BOTH') && property.details.daily_rent && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Daily Rent</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                ₹{Number(property.details.daily_rent).toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">/day</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Monthly Rent</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
            ₹{property.price.toLocaleString('en-IN')}
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">/mo</span>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Security Deposit</span>
          <span className="text-xs text-slate-800 dark:text-white font-black">
            ₹{deposit.toLocaleString('en-IN')}
            {property.depositMonths > 0 && (
              <span className="text-slate-400 dark:text-slate-500 font-semibold"> ({property.depositMonths} mo)</span>
            )}
          </span>
        </div>

        {maintenance > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Maintenance</span>
            <span className="text-xs text-slate-800 dark:text-white font-black">
              ₹{maintenance.toLocaleString('en-IN')}/mo
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Brokerage Fee</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            ₹0 (Zero Broker)
          </span>
        </div>
      </div>
    </div>
  );
}
