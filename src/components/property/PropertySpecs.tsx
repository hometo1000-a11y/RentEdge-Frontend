'use client';

import { BedDouble, Bath, Scaling, Users, Building2, Home } from 'lucide-react';
import { Property } from '../propertiesData';

interface PropertySpecsProps {
  property: Property;
  /** 'compact' = inline pills (for cards), 'expanded' = icon+label grid (for detail views) */
  variant?: 'compact' | 'expanded';
}

/**
 * Reusable property specs row.
 * - compact: horizontal pill-based layout for cards
 * - expanded: icon+label grid layout for detail views
 */
export default function PropertySpecs({ property, variant = 'compact' }: PropertySpecsProps) {
  const isPG = property.property_type === 'PG' || property.type === 'PG';
  const isCommercial = property.property_type === 'Commercial' || property.type === 'Commercial';

  // Build specs array based on property type
  const specs = (() => {
    if (isPG) {
      return [
        {
          icon: BedDouble,
          label: 'Sharing',
          value: property.bhk ? `${property.bhk} Sharing` : 'PG',
        },
        {
          icon: Bath,
          label: 'Bathrooms',
          value: property.baths ? `${property.baths} Bath` : 'Attached',
        },
        {
          icon: Users,
          label: 'Occupancy',
          value: property.occupancy_type || 'Co-ed',
        },
      ];
    }

    if (isCommercial) {
      return [
        {
          icon: Building2,
          label: 'Type',
          value: 'Commercial',
        },
        {
          icon: Scaling,
          label: 'Area',
          value: `${property.sqft || 0} sqft`,
        },
      ];
    }

    // Default: Apartment / House / Villa / Studio
    return [
      {
        icon: BedDouble,
        label: 'Config',
        value: `${property.bhk} BHK`,
      },
      {
        icon: Bath,
        label: 'Bathrooms',
        value: `${property.baths} Bath`,
      },
      {
        icon: Scaling,
        label: 'Area',
        value: `${property.sqft} sqft`,
      },
    ];
  })();

  // ─── Compact Variant (Card) ───
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {specs.map((spec, i) => (
          <span
            key={spec.label}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5"
          >
            <spec.icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            {spec.value}
          </span>
        ))}
      </div>
    );
  }

  // ─── Expanded Variant (Detail View) ───
  return (
    <div className={`grid gap-2 sm:gap-4 grid-cols-${specs.length} bg-white dark:bg-[#101420] border border-slate-100 dark:border-white/5 rounded-2xl p-3.5 sm:p-5 shadow-xs`}>
      {specs.map((spec, i) => (
        <div
          key={spec.label}
          className={`flex items-center gap-2 sm:gap-3 min-w-0 ${
            i > 0 ? 'border-l border-slate-100 dark:border-white/5 pl-2 sm:pl-4' : ''
          }`}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5">
            <spec.icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block truncate">{spec.label}</span>
            <span className="text-slate-800 dark:text-white font-black text-xs sm:text-sm block truncate">{spec.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
