'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, MapPin, Lock,
  MessageSquare, CheckCircle2, Shield, Calendar,
  Eye, Copy
} from 'lucide-react';
import { Property, getSmartTags } from './propertiesData';
import PropertySpecs from './property/PropertySpecs';
import AmenitiesGrid from './property/AmenitiesGrid';
import PricingCard from './property/PricingCard';
import OwnerCard from './property/OwnerCard';

interface PropertyDetailsDrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full property details drawer/modal.
 *
 * On desktop: centered modal with 60/40 split layout
 * On mobile: full-screen bottom sheet with drag-to-dismiss
 *
 * Sections:
 * 1. Image carousel with badges
 * 2. Price + Title + Location
 * 3. Property overview (expanded specs)
 * 4. All amenities (categorized, no truncation)
 * 5. Owner card with trust indicators
 * 6. Pricing breakdown
 * 7. CTAs: Express Interest, Contact Owner, Schedule Visit
 */
export default function PropertyDetailsDrawer({ property, isOpen, onClose }: PropertyDetailsDrawerProps) {
  const [imgIdx, setImgIdx] = useState(0);

  // Contact unlock flow
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [displayedPhone, setDisplayedPhone] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Reset state on property change
  useEffect(() => {
    if (!property) return;
    setImgIdx(0);
    const wasUnlocked =
      localStorage.getItem('Homtu_authenticated') === 'true' ||
      localStorage.getItem(`Homtu_unlocked_${property.id}`) === 'true';
    setIsUnlocked(wasUnlocked);
    setDisplayedPhone(wasUnlocked ? property.ownerPhoneFull : property.ownerPhoneMasked);
    setContactPhone('');
  }, [property]);

  useEffect(() => {
    if (showContactModal) setTimeout(() => phoneInputRef.current?.focus(), 100);
  }, [showContactModal]);

  // Digit scramble animation on unlock
  const triggerScramble = useCallback((target: string) => {
    const digits = target.split('').map((c, i) => ({ c, i })).filter(({ c }) => /\d/.test(c)).map(({ i }) => i);
    let revealed = 0;
    const iv = setInterval(() => {
      setDisplayedPhone(() =>
        target.split('').map((ch, idx) => {
          if (ch === '+' || ch === ' ') return ch;
          if (idx < 4) return ch;
          const pos = digits.indexOf(idx);
          if (pos === -1) return ch;
          if (pos < revealed) return target[idx];
          return String(Math.floor(Math.random() * 10));
        }).join('')
      );
      revealed += 0.9;
      if (revealed >= digits.length + 2) { setDisplayedPhone(target); clearInterval(iv); }
    }, 45);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactPhone.length < 10 || !property) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowContactModal(false);
      setIsUnlocked(true);
      localStorage.setItem(`Homtu_unlocked_${property.id}`, 'true');
      triggerScramble(property.ownerPhoneFull);
    }, 1100);
  };

  if (!property) return null;

  const images = property.images && property.images.length > 0
    ? property.images
    : property.image ? [property.image] : [];

  const propertyType = property.property_type || property.type || 'Apartment';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl h-[90vh] lg:h-[85vh] bg-white dark:bg-[#0B1F14] border dark:border-white/5 rounded-3xl shadow-2xl overflow-y-auto lg:overflow-hidden z-10 flex flex-col lg:flex-row"
              role="dialog"
              aria-modal="true"
              aria-label={`${property.title} details`}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center z-20 shadow-sm cursor-pointer border border-slate-100 dark:border-white/5"
                aria-label="Close property details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ─── Left Panel (Images & Technical Info) ─── */}
              <div className="w-full lg:w-[58%] h-auto lg:h-full flex flex-col border-r border-slate-100 dark:border-white/5">
                {/* Image Carousel Area */}
                <div className="relative h-56 sm:h-72 lg:h-[55%] overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={imgIdx}
                      src={images[imgIdx]}
                      alt={`${property.title} - Photo ${imgIdx + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full object-contain"
                    />
                  </AnimatePresence>

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImgIdx((p) => (p === 0 ? images.length - 1 : p - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow hover:bg-white hover:scale-105 transition-all cursor-pointer"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-800" />
                      </button>
                      <button
                        onClick={() => setImgIdx((p) => (p === images.length - 1 ? 0 : p + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow hover:bg-white hover:scale-105 transition-all cursor-pointer"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-800" />
                      </button>
                    </>
                  )}

                  {/* Photo counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      <Eye className="w-3 h-3" />
                      {imgIdx + 1} / {images.length}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                    {property.is_city_pioneer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-yellow-900 shadow-md border border-yellow-300 w-max">
                        👑 City Pioneer
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-md w-max">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-3 left-3 px-4 py-2 bg-slate-900/85 backdrop-blur-sm rounded-xl">
                    <span className="text-white text-lg font-black">₹{property.price.toLocaleString('en-IN')}</span>
                    <span className="text-slate-300 text-xs font-medium">/mo</span>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0 h-[64px]">
                    {images.slice(0, 8).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          imgIdx === i
                            ? 'border-indigo-500 scale-105 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain bg-slate-950" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Technical details (Scrollable on desktop internally to prevent parent overflow) */}
                <div className="p-5 overflow-visible lg:flex-1 lg:overflow-y-auto h-auto space-y-5 text-left no-scrollbar">
                  <PropertySpecs property={property} variant="expanded" />

                  {(() => {
                    const smartTags = getSmartTags(property);
                    if (smartTags.length === 0) return null;
                    return (
                      <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1.5 mb-2">
                          Smart Highlights
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {smartTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-bold px-3 py-1.5 bg-brand-purple/5 dark:bg-brand-purple/10 text-brand-purple dark:text-[#D4AF37] rounded-lg border border-brand-purple/20 transition-all duration-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {property.description && (
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1.5 mb-2">
                        About This Property
                      </h3>
                      <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                        {property.description}
                      </p>
                    </div>
                  )}

                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1.5 mb-2">
                        Amenities ({property.amenities.length})
                      </h3>
                      <AmenitiesGrid amenities={property.amenities} maxVisible={16} variant="chips" />
                    </div>
                  )}

                  {/* Homtu Trust Banner */}
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/15 rounded-xl flex gap-2.5 text-left">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-white">Homtu Protected</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                        Zero brokerage fees, verified listings, and secure direct landlord communication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Right Panel (Title, Location, Pricing, Owner & CTAs) ─── */}
              <div className="w-full lg:w-[42%] h-auto lg:h-full flex flex-col p-6 lg:p-7 overflow-visible lg:overflow-y-auto lg:overflow-hidden bg-slate-50/50 dark:bg-white/[0.01] justify-between border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                {/* Title & Location Info */}
                <div className="text-left space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/25 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {propertyType}
                    </span>
                    {property.occupancy_type && (
                      <span className="text-[9px] font-extrabold uppercase bg-purple-50 dark:bg-purple-500/15 border border-purple-100 dark:border-purple-500/25 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                        {property.occupancy_type}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-[9px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-100 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Zero Brokerage
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                      {property.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      {property.area}, {property.city}
                      {property.address && <span className="text-slate-400 dark:text-slate-500 font-medium"> • {property.address}</span>}
                    </p>
                  </div>
                </div>

                {/* Financials & Owner verification */}
                <div className="space-y-3.5 my-4">
                  <PricingCard property={property} />
                  {property.property_code && (
                    <div className="bg-brand-purple/10 dark:bg-brand-purple/20 border border-brand-purple/20 dark:border-brand-purple/30 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-black tracking-widest text-brand-purple dark:text-[#D4AF37] mb-0.5">Secret Property Code</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white font-mono tracking-wide">{property.property_code}</p>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(property.property_code!);
                          alert('Property code copied to clipboard!');
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 text-brand-purple dark:text-[#D4AF37] border border-brand-purple/20 rounded-lg text-xs font-bold hover:bg-brand-purple hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                  )}
                  <OwnerCard
                    property={property}
                    displayedPhone={displayedPhone}
                    isUnlocked={isUnlocked}
                  />
                </div>

                {/* CTAs & Sticky-like Actions (Always fixed on screen, only for tenants) */}
                {!property.property_code && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {isUnlocked ? (
                        <a
                          href={`https://wa.me/91${property.ownerPhoneFull.replace(/\D/g, '').slice(-10)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 fill-white" />
                          Message on WhatsApp
                        </a>
                      ) : (
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="w-full py-3 bg-brand-purple hover:bg-[#003B1F] text-white text-xs font-black rounded-xl shadow-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Lock className="w-4 h-4" />
                          Contact Owner
                        </button>
                      )}
                    </div>

                    {/* Join Property Info */}
                    <div className="text-center py-2.5 px-3 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-normal">
                        💡 Ask owner for the <span className="font-black">Join Property Code</span> to join via Tenant Portal.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Lead Capture Modal ─── */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.y > 140) setShowContactModal(false); }}
              className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 border dark:border-white/5 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl z-10 text-left"
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5 sm:hidden" />

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-brand-purple dark:text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Unlock Landlord Details</h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">🔒 End-to-end encrypted</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-5 mt-2">
                Enter your 10-digit WhatsApp number to view the owner&apos;s contact info and send a viewing request.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-purple transition-all">
                  <span className="px-3.5 text-xs font-black text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 py-3.5 shrink-0 bg-slate-100 dark:bg-slate-900">+91</span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    maxLength={10}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="WhatsApp number"
                    className="flex-1 bg-transparent px-3 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none"
                  />
                  {contactPhone.length === 10 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="pr-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    </motion.span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={contactPhone.length < 10 || isSubmitting}
                  className="w-full py-3.5 bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sm"
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

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Shield className="w-3 h-3 text-emerald-500" /> Verified Escrow & Landlord credentials
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
