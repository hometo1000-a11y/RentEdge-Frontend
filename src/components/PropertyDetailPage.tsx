'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, BedDouble, Bath, Scaling, Shield, Phone,
  CheckCircle2, X, Sparkles, Lock, ChevronLeft, ChevronRight,
  Eye, MessageSquare, User
} from 'lucide-react';
import { Property, mockProperties } from './propertiesData';
import LeadCaptureContactBlock from './LeadCaptureContactBlock';
import { api } from './api';

interface PropertyDetailPageProps {
  propertyId: string;
}

export default function PropertyDetailPage({ propertyId }: PropertyDetailPageProps) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  
  // UX States
  const [hasEnquired, setHasEnquired] = useState(false);
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [mobilePhotoIndex, setMobilePhotoIndex] = useState(0);

  // Unlock flow
  const [isNumberUnlocked, setIsNumberUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedPhone, setDisplayedPhone] = useState('');
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Session checks
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Find the property
    let found = mockProperties.find(p => p.id === propertyId);
    if (!found) {
      try {
        const saved = localStorage.getItem('Homtu_all_properties');
        if (saved) {
          const parsed = JSON.parse(saved);
          found = parsed.find((p: any) => p.id === propertyId);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (found) {
      setProperty(found);
    } else {
      api.getPublicProperties().then(res => {
        if (res.properties) {
          const fetched = res.properties.find((p: any) => p.id === propertyId);
          if (fetched) {
            setProperty(fetched);
          }
        }
      }).catch(err => {
        console.error("Failed to fetch public properties:", err);
      });
    }
    
    // Check if user is logged in
    const authed = localStorage.getItem('Homtu_authenticated') === 'true';
    setIsAuthed(authed);
    
    // Check if already enquired this property in this session
    const enquiredLocal = localStorage.getItem(`Homtu_enquired_${propertyId}`) === 'true';
    if (enquiredLocal) {
      setHasEnquired(true);
    }

    // Init unlock state from localStorage
    const alreadyUnlocked = authed || localStorage.getItem(`Homtu_unlocked_${propertyId}`) === 'true';
    if (alreadyUnlocked) {
      setIsNumberUnlocked(true);
    }
  }, [propertyId]);

  // Set displayedPhone whenever property loads or unlock state changes
  useEffect(() => {
    if (!property) return;
    setDisplayedPhone(isNumberUnlocked ? property.ownerPhoneFull : property.ownerPhoneMasked);
  }, [property, isNumberUnlocked]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (showModal) {
      setTimeout(() => phoneInputRef.current?.focus(), 120);
    }
  }, [showModal]);

  // Digit-scramble reveal animation
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

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length < 10) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(false);
      setIsNumberUnlocked(true);
      setHasEnquired(true);
      localStorage.setItem(`Homtu_unlocked_${propertyId}`, 'true');
      localStorage.setItem(`Homtu_enquired_${propertyId}`, 'true');
      if (property) triggerScramble(property.ownerPhoneFull);
    }, 1100);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold text-sm">Loading Premium Listing...</p>
        </div>
      </div>
    );
  }

  const handleEnquire = () => {
    setIsEnquiring(true);
    setTimeout(() => {
      setIsEnquiring(false);
      setHasEnquired(true);
      localStorage.setItem(`Homtu_enquired_${propertyId}`, 'true');
    }, 1500);
  };

  const handleApply = () => {
    if (!isAuthed) {
      // Redirect to home page with params to pop the auth modal
      router.push(`/?auth=true&property=${property.id}`);
    } else {
      // Save details to transition tenant state machine to pending
      localStorage.setItem('Homtu_lifecycle_state', 'REQUEST_PENDING');
      localStorage.setItem('Homtu_selected_property_id', property.id);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#06130C] pb-28 text-[#06130C] dark:text-slate-100 font-sans">
      
      {/* Top sticky nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Discovery
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              Rent<span className="text-indigo-600">Edge</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Premium detail hub</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* ================= COMPONENT 2: THE VISUAL HOOK GALLERY ================= */}
        {/* Desktop Layout Grid Gallery */}
        <div className="hidden md:grid grid-cols-12 gap-3 h-[450px] rounded-3xl overflow-hidden shadow-sm relative group">
          {/* Main Left Image (70% height equivalent, spans 6/12 columns) */}
          <div className="col-span-6 h-full overflow-hidden bg-slate-100 relative">
            <motion.img 
              src={property.images[0]} 
              alt={`${property.title} main view`}
              layoutId={`prop-img-${property.id}`}
              className="w-full h-full object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-500"
              onClick={() => { setShowPhotoViewer(true); setViewerIndex(0); }}
            />
          </div>
          
          {/* Right Grid of 4 Smaller Images */}
          <div className="col-span-6 grid grid-cols-2 grid-rows-2 gap-3 h-full">
            {property.images.slice(1, 5).map((img, index) => (
              <div key={index} className="overflow-hidden bg-slate-100 h-full relative">
                <img 
                  src={img} 
                  alt={`${property.title} gallery view ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-350"
                  onClick={() => { setShowPhotoViewer(true); setViewerIndex(index + 1); }}
                />
              </div>
            ))}
          </div>

          {/* View All Photos floating button */}
          <button 
            onClick={() => { setShowPhotoViewer(true); setViewerIndex(0); }}
            className="absolute bottom-6 right-6 px-4 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-md hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            View All Photos
          </button>
        </div>

        {/* Mobile Swipeable Carousel */}
        <div className="block md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-slate-100">
          <div className="w-full h-full flex transition-transform duration-300" style={{ transform: `translateX(-${mobilePhotoIndex * 100}%)` }}>
            {property.images.map((img, i) => (
              <img 
                key={i}
                src={img} 
                alt={`${property.title} slide ${i}`}
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </div>

          {/* Left/Right controls inside mobile */}
          {property.images.length > 1 && (
            <>
              <button 
                onClick={() => setMobilePhotoIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setMobilePhotoIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Index indicator */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {mobilePhotoIndex + 1} / {property.images.length}
          </div>
        </div>

        {/* ================= MIDDLE SECTION: CONTEXT SPLIT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 md:mt-12 items-start">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 text-left space-y-8">
            <div className="space-y-3">
              {/* Tag and Verified Info */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-indigo-50 border border-indigo-150 text-indigo-600 px-3 py-1 rounded-full">
                  {property.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase bg-emerald-50 border border-emerald-150 text-emerald-600 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Zero Brokerage
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-tight">
                {property.title}
              </h1>

              {/* Location Detail */}
              <p className="text-slate-500 font-bold text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                {property.area}, {property.city}
              </p>
            </div>

            {/* Premium Icon list Specs */}
            <div className="grid grid-cols-3 gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                  <BedDouble className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Configuration</span>
                  <span className="text-slate-800 font-black text-sm">{property.beds} BHK Suite</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                  <Bath className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bathrooms</span>
                  <span className="text-slate-800 font-black text-sm">{property.baths} Private</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                  <Scaling className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Floor Area</span>
                  <span className="text-slate-800 font-black text-sm">{property.sqft} Sq.Ft</span>
                </div>
              </div>
            </div>

            {/* Description Block */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                About this Premium Space
              </h3>
              <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                Exclusive Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {property.amenities.map((am) => (
                  <div 
                    key={am}
                    className="flex items-center gap-2.5 bg-white border border-slate-100 p-3.5 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-100 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Homtu fintech transparency notes */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex gap-3 text-left">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-black text-slate-800">Homtu Ledger Protected</h5>
                <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                  This property is managed securely on-chain. Zero brokerage fees, direct NPCI banking mandates for transfers, and 100% compliance under HRA Section 10(13A).
                </p>
              </div>
            </div>

          </div>

          {/* Right Column - Sticky Sidebar (30%) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            
            {/* ================= COMPONENT 3: STICKY SIDEBAR CONTACT HUB ================= */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-lg space-y-6">
              
              {/* Financial Box */}
              <div className="space-y-3.5 pb-5 border-b border-slate-100 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Monthly Rent</span>
                  <div className="text-2xl font-black text-indigo-650 font-mono mt-0.5">
                    ₹{property.price.toLocaleString('en-IN')}
                    <span className="text-xs font-semibold text-slate-400 font-sans">/mo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-500">Security Deposit:</span>
                  <span className="text-slate-800">₹{(property.price * property.depositMonths).toLocaleString('en-IN')} ({property.depositMonths} Mo)</span>
                </div>
              </div>

              {/* Property Owner Card */}
              <div id="contact-block-container" className="space-y-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 text-left">
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Property Owner</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#01411C]/10 border border-[#01411C]/20 flex items-center justify-center shrink-0">
                        <User className="w-4.5 h-4.5 text-[#01411C]" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{property.ownerName}</p>
                        <motion.p
                          key={displayedPhone}
                          className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {displayedPhone}
                        </motion.p>
                      </div>
                    </div>
                    {isNumberUnlocked ? (
                      <span className="text-[9px] font-black uppercase text-[#01411C] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#01411C] animate-pulse" />Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Encrypted</span>
                    )}
                  </div>

                  {isNumberUnlocked && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[10.5px] font-bold text-[#01411C] bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Landlord notified of your interest.
                    </motion.div>
                  )}
                </div>

                {isNumberUnlocked ? (
                  <motion.a
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    href={`https://wa.me/91${property.ownerPhoneFull.replace(/\D/g, '').slice(-10)}`}
                    target="_blank" rel="noreferrer"
                    className="w-full py-3.5 bg-[#01411C] hover:bg-[#01411C]/90 text-white text-xs font-black rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    Message on WhatsApp
                  </motion.a>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-3.5 bg-[#01411C] hover:bg-[#01411C]/90 text-white text-xs font-black rounded-2xl shadow-md shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Unlock Owner Details
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* ========== UNIVERSAL STICKY ACTION BAR (all screens) ========== */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/85 backdrop-blur-md border-t border-slate-200/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Price */}
          <div className="text-left shrink-0">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Monthly Rent</span>
            <span className="text-lg font-black text-[#01411C] font-mono">₹{property.price.toLocaleString('en-IN')}<span className="text-xs font-semibold text-slate-400 font-sans">/mo</span></span>
          </div>

          {/* Right: CTA */}
          <AnimatePresence mode="wait">
            {isNumberUnlocked ? (
              <motion.a
                key="whatsapp-cta"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                href={`https://wa.me/91${property.ownerPhoneFull.replace(/\D/g, '').slice(-10)}`}
                target="_blank" rel="noreferrer"
                className="px-6 py-3 bg-[#01411C] hover:bg-[#01411C]/90 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                Message on WhatsApp
              </motion.a>
            ) : (
              <motion.button
                key="contact-cta"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setShowModal(true)}
                className="relative px-6 py-3 bg-[#01411C] hover:bg-[#01411C]/90 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-sm overflow-hidden transition-colors"
              >
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-xl animate-ping bg-[#01411C]/30 pointer-events-none" />
                <Lock className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Contact Owner</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========== LEAD CAPTURE MODAL ========== */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.y > 140) setShowModal(false); }}
              className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl z-10 text-left"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#01411C]/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#01411C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Unlock Landlord Details</h3>
                    <p className="text-[10px] text-[#01411C] font-bold">🔒 End-to-end encrypted</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-5 mt-2">
                Enter your 10-digit WhatsApp number to instantly view the owner's contact info and send an automated viewing request.
              </p>

              <form onSubmit={handleUnlockSubmit} className="space-y-3">
                {/* Phone input */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#01411C] focus-within:ring-1 focus-within:ring-[#01411C] transition-all">
                  <span className="px-3.5 text-xs font-black text-slate-500 border-r border-slate-200 py-3.5 shrink-0 bg-slate-100">+91</span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="WhatsApp number"
                    className="flex-1 bg-transparent px-3 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                  />
                  {phoneInput.length === 10 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="pr-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#01411C]" />
                    </motion.span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={phoneInput.length < 10 || isSubmitting}
                  className="w-full py-3.5 bg-[#01411C] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sm"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Verifying...</span></>
                  ) : (
                    <><MessageSquare className="w-4 h-4 fill-white" /><span>Unlock Number</span></>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <Shield className="w-3 h-3 text-emerald-500" /> Verified Escrow & Landlord credentials
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= FULL SCREEN PHOTO VIEWER / GALLERY ================= */}
      <AnimatePresence>
        {showPhotoViewer && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 flex items-center justify-between text-white border-b border-white/10">
              <span className="text-xs font-bold font-mono">
                {viewerIndex + 1} / {property.images.length} • {property.title}
              </span>
              <button 
                onClick={() => setShowPhotoViewer(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
              <img 
                src={property.images[viewerIndex]} 
                alt={`${property.title} gallery fullscreen ${viewerIndex}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Prev button */}
              <button 
                onClick={() => setViewerIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next button */}
              <button 
                onClick={() => setViewerIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
                className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail selector footer */}
            <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto">
              {property.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setViewerIndex(i)}
                  className={`w-16 h-12 rounded-md overflow-hidden bg-slate-800 shrink-0 border-2 transition-all ${
                    viewerIndex === i ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
