'use client';

import { useState } from 'react';
import { Wifi, Zap, Shield, Sparkles, Droplets, Dumbbell, Car, Wind, Flame, Tv, WashingMachine, TreePine, ChevronDown, ChevronUp } from 'lucide-react';

interface AmenitiesGridProps {
  amenities: string[];
  /** Maximum amenities to show before "Show More". Set to Infinity to show all. Default 12. */
  maxVisible?: number;
  /** 'chips' = wrapping chips, 'categorized' = grouped by category */
  variant?: 'chips' | 'categorized';
}

// Maps amenity keywords to icons and categories
const amenityMeta: Record<string, { icon: any; category: 'essential' | 'comfort' | 'security' | 'lifestyle' }> = {
  'wifi': { icon: Wifi, category: 'essential' },
  'internet': { icon: Wifi, category: 'essential' },
  'power backup': { icon: Zap, category: 'essential' },
  'power': { icon: Zap, category: 'essential' },
  'water': { icon: Droplets, category: 'essential' },
  'water supply': { icon: Droplets, category: 'essential' },
  'gas': { icon: Flame, category: 'essential' },
  'cctv': { icon: Shield, category: 'security' },
  'security': { icon: Shield, category: 'security' },
  'guard': { icon: Shield, category: 'security' },
  'gated': { icon: Shield, category: 'security' },
  'ac': { icon: Wind, category: 'comfort' },
  'air conditioning': { icon: Wind, category: 'comfort' },
  'geyser': { icon: Flame, category: 'comfort' },
  'washing machine': { icon: WashingMachine, category: 'comfort' },
  'laundry': { icon: WashingMachine, category: 'comfort' },
  'tv': { icon: Tv, category: 'comfort' },
  'gym': { icon: Dumbbell, category: 'lifestyle' },
  'fitness': { icon: Dumbbell, category: 'lifestyle' },
  'pool': { icon: Droplets, category: 'lifestyle' },
  'swimming': { icon: Droplets, category: 'lifestyle' },
  'garden': { icon: TreePine, category: 'lifestyle' },
  'park': { icon: TreePine, category: 'lifestyle' },
  'parking': { icon: Car, category: 'essential' },
  'club': { icon: Sparkles, category: 'lifestyle' },
  'clubhouse': { icon: Sparkles, category: 'lifestyle' },
};

function getAmenityMeta(amenity: string) {
  const lower = amenity.toLowerCase();
  for (const [keyword, meta] of Object.entries(amenityMeta)) {
    if (lower.includes(keyword)) return meta;
  }
  return { icon: Sparkles, category: 'comfort' as const };
}

const categoryConfig = {
  essential: { label: 'Essentials', color: 'emerald', borderColor: 'border-l-emerald-500' },
  comfort: { label: 'Comfort', color: 'blue', borderColor: 'border-l-blue-500' },
  security: { label: 'Security', color: 'amber', borderColor: 'border-l-amber-500' },
  lifestyle: { label: 'Lifestyle', color: 'purple', borderColor: 'border-l-purple-500' },
};

/**
 * Reusable amenities display component.
 * - chips: flat wrapping chip layout (for drawers/modals)
 * - categorized: grouped by category with headers (for full detail page)
 */
export default function AmenitiesGrid({ amenities, maxVisible = 12, variant = 'chips' }: AmenitiesGridProps) {
  const [showAll, setShowAll] = useState(false);

  if (!amenities || amenities.length === 0) return null;

  const visibleAmenities = showAll ? amenities : amenities.slice(0, maxVisible);
  const hasMore = amenities.length > maxVisible;

  // ─── Chips Variant ───
  if (variant === 'chips') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {visibleAmenities.map((amenity) => {
            const { icon: Icon } = getAmenityMeta(amenity);
            return (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                {amenity}
              </span>
            );
          })}
        </div>
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Show all {amenities.length} amenities
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            Show less
          </button>
        )}
      </div>
    );
  }

  // ─── Categorized Variant ───
  // Group amenities by category
  const grouped: Record<string, string[]> = { essential: [], comfort: [], security: [], lifestyle: [] };
  amenities.forEach((am) => {
    const { category } = getAmenityMeta(am);
    grouped[category].push(am);
  });

  return (
    <div className="space-y-5">
      {(Object.entries(grouped) as [keyof typeof categoryConfig, string[]][])
        .filter(([, items]) => items.length > 0)
        .map(([category, items]) => {
          const config = categoryConfig[category];
          return (
            <div key={category}>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5">
                {config.label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.map((am) => {
                  const { icon: Icon } = getAmenityMeta(am);
                  return (
                    <div
                      key={am}
                      className={`flex items-center gap-2.5 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 border-l-2 ${config.borderColor} p-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-l-4 transition-all`}
                    >
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{am}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
