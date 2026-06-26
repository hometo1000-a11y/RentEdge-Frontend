'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Heart, MapPin,
  Star, BadgeCheck, Users, ChevronRight as ViewArrow,
  Maximize2
} from 'lucide-react';
import { Property, getSmartTags } from './propertiesData';
import PropertySpecs from './property/PropertySpecs';

interface PropertyCardProps {
  property: Property;
  onView: (property: Property) => void;
  index?: number;
  /** Whether the user can favorite (must be authenticated) */
  onFavorite?: (id: string, e: React.MouseEvent) => void;
  isFavorited?: boolean;
  propertyCode?: string;
  onEdit?: (property: Property, e: React.MouseEvent) => void;
  onDelete?: (property: Property, e: React.MouseEvent) => void;
}

/**
 * Unified property listing card used across PublicGrid and Listings.
 *
 * Visual hierarchy (top → bottom):
 * 1. Image with price overlay + badges
 * 2. Title (line-clamp-2)
 * 3. Location
 * 4. Specs row (BHK/Bath/Area as pills)
 * 5. Property type + Occupancy type
 * 6. Top 3 amenities + remaining count
 * 7. View Property CTA
 */
export default function PropertyCard({
  property,
  onView,
  index = 0,
  onFavorite,
  isFavorited = false,
  propertyCode,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : property.image ? [property.image] : [];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const isPG = property.property_type === 'PG' || property.type === 'PG';
  const propertyTypeLabel = property.property_type || property.type || 'Apartment';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ 
        layout: { type: 'spring', stiffness: 200, damping: 22 },
        y: { type: 'spring', stiffness: 200, damping: 22 },
        opacity: { duration: 0.5, delay: index * 0.05 }
      }}
      onClick={() => onView(property)}
      onMouseMove={handleMouseMove}
      className="group relative bg-white dark:bg-[#101420] rounded-[24px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-[0_20px_35px_-8px_rgba(124,58,237,0.12),0_12px_20px_-10px_rgba(0,0,0,0.04)] transition-shadow duration-500 flex flex-col cursor-pointer"
      tabIndex={0}
      role="button"
      aria-label={`View ${property.title} - ₹${property.price.toLocaleString('en-IN')} per month`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(property); } }}
    >
      {/* Dynamic Light Glow Spotlight */}
      <motion.div 
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(124, 58, 237, 0.06), transparent 80%)`
        }}
      />

      {/* Border Glow Mask (SaaS Apple/Stripe-like) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
        style={{
          border: '1.5px solid transparent',
          background: useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, rgba(124, 58, 237, 0.22), transparent 80%) border-box`,
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
        }}
      />

      {/* ─── Image Section ─── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 dark:bg-slate-950 shrink-0 flex items-center justify-center z-0">
        {!imgError && images.length > 0 ? (
          <AnimatePresence mode="wait">
              <motion.img
                key={imgIdx}
                src={images[imgIdx]}
                alt={`${property.title} - ${propertyTypeLabel} in ${property.area}, ${property.city}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                onError={() => setImgError(true)}
                loading="lazy"
              />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            <Maximize2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/10 pointer-events-none" />

        {/* Carousel controls (hover only, desktop) */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow hover:bg-white hover:scale-105 transition-all cursor-pointer pointer-events-auto"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-800" />
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow hover:bg-white hover:scale-105 transition-all cursor-pointer pointer-events-auto"
              aria-label="Next photo"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-800" />
            </button>
          </div>
        )}

        {/* Carousel dots */}
        {images.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${imgIdx === i ? 'bg-white scale-125' : 'bg-white/50'}`}
              />
            ))}
            {images.length > 5 && <span className="w-1.5 h-1.5 rounded-full bg-white/30" />}
          </div>
        )}

        {/* Badges (top-left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {propertyCode && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-brand-purple/90 backdrop-blur-sm border border-brand-purple text-white shadow-md w-max pointer-events-auto">
              Code: {propertyCode}
            </span>
          )}
          {property.is_city_pioneer && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 shadow-md border border-yellow-300 w-max">
              <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" />
              Pioneer
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-white/60 shadow-sm text-slate-800 w-max">
            <BadgeCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            Verified
          </span>
        </div>

        {/* Action Stack (top-right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          {onFavorite && (
            <button
              onClick={(e) => onFavorite(property.id, e)}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition-all cursor-pointer hover:scale-105"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(property, e); }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-blue-500 shadow-sm transition-all cursor-pointer hover:scale-105 pointer-events-auto"
              aria-label="Edit Property"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(property, e); }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition-all cursor-pointer hover:scale-105 pointer-events-auto"
              aria-label="Delete Property"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>

        {/* Price overlay (bottom-left on image) */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-slate-900/85 backdrop-blur-sm rounded-xl z-10">
          {(() => {
            let priceText = `₹${property.price.toLocaleString('en-IN')}`;
            let suffix = '/mo';
            let subText = '';

            if (property.type === 'PG' && property.details) {
              const food = property.details.food_option;
              const wf = Number(property.details.rent_with_food) || 0;
              const wof = Number(property.details.rent_without_food) || 0;

              if (food === 'WITHOUT_FOOD' && wof) {
                priceText = `₹${wof.toLocaleString('en-IN')}`;
                subText = 'Without Food';
              } else if (food === 'WITH_FOOD' && wf) {
                priceText = `₹${wf.toLocaleString('en-IN')}`;
                subText = 'With Food';
              } else if (food === 'BOTH' && wf && wof) {
                priceText = `₹${Math.min(wf, wof).toLocaleString('en-IN')} - ₹${Math.max(wf, wof).toLocaleString('en-IN')}`;
                suffix = '';
                subText = 'Food Options Available';
              }
            } else if (property.type === 'Villa' && property.details) {
              const model = property.details.rental_model || 'MONTHLY_ONLY';
              const daily = Number(property.details.daily_rent) || 0;
              const monthly = property.price || 0;

              if (model === 'DAILY_ONLY' && daily) {
                priceText = `₹${daily.toLocaleString('en-IN')}`;
                suffix = '/day';
              } else if (model === 'BOTH' && daily && monthly) {
                priceText = `₹${daily.toLocaleString('en-IN')}/d | ₹${monthly.toLocaleString('en-IN')}`;
                suffix = '/mo';
                subText = 'Flexible Options';
              }
            }

            return (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-base font-black">{priceText}</span>
                  {suffix && <span className="text-slate-300 text-[10px] font-medium">{suffix}</span>}
                </div>
                {subText && (
                  <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-wider">{subText}</span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Zero brokerage badge (bottom-right on image) */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/70 backdrop-blur-sm border border-emerald-500/30 rounded-lg px-2 py-1 uppercase tracking-wider">
            Zero Brokerage
          </span>
        </div>
      </div>

      {/* ─── Content Section ─── */}
      <div className="flex-1 flex flex-col p-5 gap-3.5 z-10">
        {/* Title */}
        <div className="group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-purple transition-colors duration-500">
            {property.title}
          </h3>
          <p className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {property.area}, {property.city}
          </p>
        </div>

        {/* Specs Row (compact pills) */}
        <PropertySpecs property={property} variant="compact" />

        {/* Property Type + Occupancy Type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-100 dark:border-white/5">
            {propertyTypeLabel}
          </span>
          {property.occupancy_type && (
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">
              <Users className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />
              {property.occupancy_type}
            </span>
          )}
        </div>

        {/* Smart Tags (Max 3) */}
        {(() => {
          const smartTags = getSmartTags(property);
          if (smartTags.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1.5">
              {smartTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-md border border-slate-100 dark:border-white/5 group-hover:bg-brand-purple/5 dark:group-hover:bg-brand-purple/10 group-hover:text-brand-purple dark:group-hover:text-[#A78BFA] group-hover:border-brand-purple/20 transition-all duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          );
        })()}

        {/* CTA with high-trust micro-interactions */}
        <button
          onClick={(e) => { e.stopPropagation(); onView(property); }}
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-slate-950 dark:bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-indigo-600 text-white text-xs font-black rounded-xl transition-all duration-500 cursor-pointer shadow-sm group-hover:scale-[1.015] group-hover:shadow-[0_8px_20px_-6px_rgba(124,58,237,0.25)]"
        >
          <span>View Property</span>
          <ViewArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </motion.article>
  );
}
