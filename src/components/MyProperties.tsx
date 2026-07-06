'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, KeyRound, CheckCircle2, ArrowRight, RefreshCw, Lock, Sparkles, Building2, MapPin, User, ChevronLeft, ChevronRight, CreditCard, FileText, X, Printer, Copy, AlertTriangle, Upload, Loader2, History } from 'lucide-react';
import { Property, mockProperties } from './propertiesData';
import PropertyCard from './PropertyCard';
import PropertySpecs from './property/PropertySpecs';
import AmenitiesGrid from './property/AmenitiesGrid';
import PaymentHistoryModal from './PaymentHistoryModal';
import { api } from './api';

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

const authenticator = async () => {
  try {
    const response = await api.getImageKitAuth();
    return response;
  } catch (error) {
    throw new Error(`Authentication request failed: ${error}`);
  }
};

const CODE_LENGTH = 8;

const VALID_CODES: Record<string, { title: string; owner: string; area: string; propertyId: string }> = {};

interface MyPropertiesProps {
  onPropertySelect?: (property: Property) => void;
}

type JoinState = 'idle' | 'verifying' | 'success' | 'error';

export default function MyProperties({ onPropertySelect }: MyPropertiesProps) {
  const [code, setCode] = useState<string>('');
  const [joinState, setJoinState] = useState<JoinState>('idle');
  const [matchedProperty, setMatchedProperty] = useState<typeof VALID_CODES[string] | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [viewedProperty, setViewedProperty] = useState<Property | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [rentedProperties, setRentedProperties] = useState<Property[]>([]);

  // Payment Proof State
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState('');
  const [currentProof, setCurrentProof] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    async function loadRentedProperties() {
      try {
        const properties = await api.getMyProperties();
        
        // Map the backend properties to the frontend Property type
        const formattedProps = properties.map((p: any) => ({
          id: p.id,
          title: p.property_name || 'Property',
          location: `${p.locality ? p.locality + ', ' : ''}${p.city}`,
          price: p.agreed_rent_amount || p.rent_amount || 0,
          images: p.images?.length > 0 ? p.images.map((img: any) => img.image_url) : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop'],
          depositMonths: Math.round((p.deposit_amount || 0) / (p.rent_amount || 1)),
          ownerName: p.owner_name || 'Owner',
          ownerEmail: p.owner_email || '',
          ownerPhone: p.owner_phone || '',
          contacts: p.contacts || [],
          payment_info: p.payment_info || undefined,
          city: p.city || '',
          area: p.locality || '',
          type: p.property_type || 'Apartment',
          amenities: p.amenities || [],
          bhk: p.details?.bhk ? parseInt(p.details.bhk) : (p.bhk || 0),
          baths: p.details?.bathrooms ? parseInt(p.details.bathrooms) : (p.baths || 0),
          sqft: p.details?.built_up_area || p.details?.carpet_area || p.sqft || 0,
          occupancy_type: p.occupancy_type || '',
          rent: p.agreed_rent_amount || p.rent_amount || 0,
          deposit: p.deposit_amount || 0,
          description: p.description || p.short_description || p.full_description || '',
          ownerPhoneMasked: '',
          ownerPhoneFull: '',
          // Rent cycle fields
          tenancy_id: p.tenancy_id || null,
          rent_status: p.rent_status || null,
          next_due_date: p.next_due_date || null,
          billing_day: p.billing_day || null,
          agreed_rent_amount: p.agreed_rent_amount || null,
          last_paid_date: p.last_paid_date || null,
          lease_start_date: p.lease_start_date || null,
        })) as Property[];
        
        setRentedProperties(formattedProps);
      } catch (err) {
        console.error('Failed to load rented properties:', err);
        setRentedProperties([]);
      }
    }
    loadRentedProperties();
  }, [joinState]);

  useEffect(() => {
    const storedName = localStorage.getItem('Homtu_user_fullname');
    if (storedName) setTenantName(storedName);
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setActiveImg(prev => {
        if (!viewedProperty) return 0;
        return (prev + 1) % viewedProperty.images.length;
      });
    }, 4000);
  }, [viewedProperty]);

  useEffect(() => {
    if (viewedProperty) {
      setActiveImg(0);
      startAutoplay();
    }
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [viewedProperty, startAutoplay]);

  const [dynamicCodes, setDynamicCodes] = useState<Record<string, { title: string; owner: string; area: string; propertyId: string }>>({});

  const isFull = code.length === CODE_LENGTH;

  useEffect(() => {
    inputRef.current?.focus();
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('Homtu_access_codes');
      if (saved) {
        try {
          setDynamicCodes(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const getPropertyById = (propertyId: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('Homtu_properties');
      if (saved) {
        try {
          const parsed: Property[] = JSON.parse(saved);
          const found = parsed.find(p => p.id === propertyId);
          if (found) return found;
        } catch (e) {}
      }
      
      const savedAll = localStorage.getItem('Homtu_all_properties');
      if (savedAll) {
        try {
          const parsed: Property[] = JSON.parse(savedAll);
          const found = parsed.find(p => p.id === propertyId);
          if (found) return found;
        } catch (e) {}
      }
    }
    return mockProperties.find(p => p.id === propertyId);
  };

  const handleChange = (value: string) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
    setCode(clean);
    setJoinState('idle');
  };

  const handleJoin = async () => {
    if (!isFull) return;
    setJoinState('verifying');
    try {
      await api.joinProperty(code);
      setJoinState('success');
    } catch (err: any) {
      console.error('Join code error:', err);
      alert(err.message || 'Failed to submit join request');
      setJoinState('error');
    }
  };

  const handleReset = () => {
    setCode('');
    setJoinState('idle');
    setMatchedProperty(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handlePayRent = async () => {
    setProofError('');
    setProofFile(null);
    setPaymentMethod('');
    setReferenceNumber('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsSubmittingProof(false);
    
    if (viewedProperty && (viewedProperty as any).rent_status === 'pending') {
      try {
        const proof = await api.getCurrentPaymentProof((viewedProperty as any).tenancy_id);
        setCurrentProof(proof.data);
      } catch (err) {
        console.error('Failed to load current proof', err);
      }
    } else {
      setCurrentProof(null);
    }
    
    setShowPaymentModal(true);
  };

  const submitProof = async () => {
    if (!paymentMethod || !referenceNumber || !proofFile || !paymentDate) {
      setProofError('Please fill all required fields and upload a screenshot.');
      return;
    }
    setIsSubmittingProof(true);
    setProofError('');
    try {
      // 1. ImageKit Upload
      const auth = await authenticator();
      const formDataUpload = new FormData();
      formDataUpload.append("file", proofFile);
      formDataUpload.append("fileName", proofFile.name);
      formDataUpload.append("folder", "/rent_proofs");
      formDataUpload.append("publicKey", publicKey!);
      formDataUpload.append("signature", auth.signature);
      formDataUpload.append("expire", auth.expire.toString());
      formDataUpload.append("token", auth.token);
      formDataUpload.append("useUniqueFileName", "true");

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formDataUpload
      });
      
      if (!response.ok) throw new Error("Failed to upload image");
      const uploadRes = await response.json();

      // 2. Submit to API
      await api.submitRentPaymentProof({
        property_tenant_id: (viewedProperty as any).tenancy_id,
        billing_period: (viewedProperty as any).next_due_date,
        amount_due: viewedProperty?.rent,
        amount_paid: viewedProperty?.rent,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        screenshot_url: uploadRes.url,
        payment_date: paymentDate
      });

      setShowPaymentModal(false);
      // Hack to force reload properties
      setJoinState(joinState === 'idle' ? 'success' : 'idle'); 
    } catch (err: any) {
      console.error(err);
      setProofError(err.message || 'Failed to submit payment proof');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  if (viewedProperty) {
    const images = viewedProperty.images;
    const goNext = () => { setActiveImg((activeImg + 1) % images.length); startAutoplay(); };
    const goPrev = () => { setActiveImg((activeImg - 1 + images.length) % images.length); startAutoplay(); };

    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
        <button 
          onClick={() => setViewedProperty(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to My Properties
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          
          {/* ─── Photo Slider ─────────────────────────────── */}
          <div className="relative group">
            {/* Main Image */}
            <div className="aspect-[21/9] bg-slate-900 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={`${viewedProperty.title} - Photo ${activeImg + 1}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Badge */}
              <div className="absolute top-5 right-5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg z-10">
                Active Lease
              </div>

              {/* Counter */}
              <div className="absolute bottom-5 left-5 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10">
                {activeImg + 1} / {images.length}
              </div>

              {/* Prev / Next arrows */}
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Progress dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); startAutoplay(); }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === activeImg ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 p-3 bg-slate-50 border-t border-slate-100 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); startAutoplay(); }}
                  className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    i === activeImg
                      ? 'border-brand-purple shadow-md shadow-sm scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          
          {/* ─── Property Details ─────────────────────────── */}
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-10 justify-between items-start">
              
              <div className="space-y-6 flex-1">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{viewedProperty.title}</h1>
                  <p className="flex items-center gap-1.5 text-slate-500 font-semibold mt-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {viewedProperty.location}
                  </p>
                </div>

                <PropertySpecs property={viewedProperty} variant="expanded" />

                {viewedProperty.description && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1.5 mb-2">
                      About This Property
                    </h3>
                    <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                      {viewedProperty.description}
                    </p>
                  </div>
                )}

                {viewedProperty.amenities && viewedProperty.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1.5 mb-2">
                      Amenities
                    </h3>
                    <AmenitiesGrid amenities={viewedProperty.amenities} maxVisible={16} variant="chips" />
                  </div>
                )}

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Landlord & Contacts</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                        {(viewedProperty.ownerName || 'O').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{viewedProperty.ownerName}</p>
                        <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> Verified Owner {viewedProperty.ownerPhone ? `• ${viewedProperty.ownerPhone}` : ''}
                        </p>
                      </div>
                    </div>
                    {viewedProperty.contacts && viewedProperty.contacts.map((contact: any, idx) => {
                      const name = contact.name || contact.contact_name || '';
                      const role = contact.role || contact.contact_role || '';
                      const phone = contact.phone || contact.contact_phone || '';
                      return (
                        <div key={idx} className="flex items-center gap-3 pt-3 border-t border-slate-200/60">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">
                            {name.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{name}</p>
                            <p className="text-[10px] font-semibold text-slate-500">{role} {phone ? `• ${phone}` : ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-6 shrink-0">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  {/* Rent Status Badge */}
                  {(viewedProperty as any).rent_status && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Status</p>
                      {(viewedProperty as any).rent_status === 'due' ? (
                        <span className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[10px] font-black text-red-600 uppercase tracking-wider inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Rent Due
                        </span>
                      ) : (viewedProperty as any).rent_status === 'pending' ? (
                        <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-wider inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Verification Pending
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-wider inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rent Amount */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Rent</p>
                    <p className="text-2xl font-black text-slate-900">₹{viewedProperty.price.toLocaleString('en-IN')}</p>
                  </div>

                  {/* Next Due Date */}
                  {(viewedProperty as any).next_due_date && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500">Next Due Date</p>
                      <p className={`text-sm font-black ${
                        (viewedProperty as any).rent_status === 'due' ? 'text-red-600' : 'text-slate-800'
                      }`}>
                        {new Date((viewedProperty as any).next_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {/* Billing Day */}
                  {(viewedProperty as any).billing_day && (
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-500">Billing Cycle</p>
                      <p className="text-xs font-black text-slate-700">
                        {(viewedProperty as any).billing_day}{((d: number) => {
                          if (d >= 11 && d <= 13) return 'th';
                          switch (d % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th'; }
                        })((viewedProperty as any).billing_day)} of every month
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={handlePayRent}
                    className={`w-full py-4 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      (viewedProperty as any).rent_status === 'due' 
                        ? 'bg-[#01411C] hover:bg-[#003B1F] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                        : (viewedProperty as any).rent_status === 'pending'
                        ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-800 hover:bg-slate-700 shadow-md'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    {(viewedProperty as any).rent_status === 'due' ? 'Pay Rent' : (viewedProperty as any).rent_status === 'pending' ? 'View Payment Status' : 'Payment Verified'}
                  </button>
                  <p className="text-[10px] text-center font-bold text-slate-400 mt-3 flex items-center justify-center gap-1 mb-4">
                    <ShieldCheck className="w-3.5 h-3.5" /> Manual Bank Transfer / UPI
                  </p>
                  
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    View Payment History
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Payment Modal Overlay */}
        <AnimatePresence>
          {showPaymentModal && viewedProperty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Payment Details</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Transfer directly to your landlord</p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  {/* === PAID STATE === */}
                  {(viewedProperty as any).rent_status === 'paid' && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Rent paid for this billing cycle.</h3>
                      <p className="text-sm font-bold text-slate-500">Thank you for your prompt payment.</p>
                    </div>
                  )}

                  {/* === PENDING STATE === */}
                  {(viewedProperty as any).rent_status === 'pending' && (
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
                        <div className="flex justify-center mb-2">
                          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        </div>
                        <h3 className="text-sm font-black text-amber-700">Payment submitted. Awaiting verification.</h3>
                        <p className="text-[10px] font-bold text-amber-600/80">Your landlord needs to verify this transaction.</p>
                      </div>
                      
                      {currentProof && (
                        <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Submitted Details</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Amount Paid</span>
                            <span className="text-xs font-black text-slate-900">₹{Number(currentProof.amount_paid).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Method</span>
                            <span className="text-xs font-black text-slate-900">{currentProof.payment_method}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Reference No.</span>
                            <span className="text-xs font-black text-slate-900">{currentProof.reference_number}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Date</span>
                            <span className="text-xs font-black text-slate-900">{new Date(currentProof.payment_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* === DUE STATE (UPLOAD FORM) === */}
                  {(viewedProperty as any).rent_status === 'due' && (
                    <>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Amount to Pay</p>
                        <p className="text-3xl font-black text-emerald-700">₹{viewedProperty.price.toLocaleString('en-IN')}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Owner Bank Details</p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center group">
                              <span className="text-xs font-bold text-slate-500">Account Name</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">{viewedProperty.payment_info?.account_holder_name || viewedProperty.ownerName}</span>
                                <button onClick={() => navigator.clipboard.writeText(viewedProperty.payment_info?.account_holder_name || viewedProperty.ownerName)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400 hover:text-brand-purple cursor-pointer"><Copy className="w-3 h-3" /></button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center group">
                              <span className="text-xs font-bold text-slate-500">Account No.</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 font-mono tracking-widest">{viewedProperty.payment_info?.bank_account_number || 'Not Provided'}</span>
                                <button onClick={() => navigator.clipboard.writeText(viewedProperty.payment_info?.bank_account_number || '')} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400 hover:text-brand-purple cursor-pointer"><Copy className="w-3 h-3" /></button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center group">
                              <span className="text-xs font-bold text-slate-500">IFSC Code</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 font-mono tracking-widest">{viewedProperty.payment_info?.ifsc_code || 'Not Provided'}</span>
                                <button onClick={() => navigator.clipboard.writeText(viewedProperty.payment_info?.ifsc_code || '')} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400 hover:text-brand-purple cursor-pointer"><Copy className="w-3 h-3" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between group">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">UPI ID</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900 font-mono">{viewedProperty.payment_info?.upi_id || (viewedProperty.ownerPhone ? `${viewedProperty.ownerPhone}@upi` : 'Not Provided')}</p>
                              <button onClick={() => navigator.clipboard.writeText(viewedProperty.payment_info?.upi_id || (viewedProperty.ownerPhone ? `${viewedProperty.ownerPhone}@upi` : ''))} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded transition-all text-slate-400 hover:text-brand-purple cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                          </div>
                        </div>
                      </div>

                      {/* Upload Proof Form */}
                      <div className="p-4 border border-brand-purple/30 bg-purple-50/30 rounded-2xl space-y-4">
                        <h4 className="text-sm font-black text-slate-900">Upload Proof of Payment</h4>
                        
                        {proofError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-2.5 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {proofError}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-primary focus:ring-1 focus:ring-purple-200">
                              <option value="">Select...</option>
                              <option value="UPI">UPI</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Cash">Cash</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Date</label>
                            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-primary focus:ring-1 focus:ring-purple-200" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reference Number</label>
                            <input type="text" placeholder="Transaction ID or UPI Ref" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-primary focus:ring-1 focus:ring-purple-200" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Screenshot Proof</label>
                            <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-purple bg-white rounded-xl p-4 text-center cursor-pointer transition-colors group overflow-hidden">
                              <input type="file" accept="image/*" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setProofFile(e.target.files[0]);
                                }
                              }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                              {proofFile ? (
                                <p className="text-xs font-bold text-brand-purple truncate px-2">{proofFile.name}</p>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand-purple transition-colors" />
                                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-purple">Click or drag to upload screenshot</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  {(viewedProperty as any).rent_status === 'due' ? (
                    <>
                      <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black rounded-xl transition-colors cursor-pointer text-sm">
                        Cancel
                      </button>
                      <button disabled={isSubmittingProof} onClick={submitProof} className="flex-1 py-3 bg-brand-purple hover:bg-[#003B1F] text-white font-black rounded-xl transition-colors cursor-pointer text-sm flex justify-center items-center gap-2">
                        {isSubmittingProof ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Proof'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 bg-brand-purple hover:bg-[#003B1F] text-white font-black rounded-xl transition-colors cursor-pointer text-sm">
                      Done
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <PaymentHistoryModal 
          isOpen={showHistoryModal} 
          onClose={() => setShowHistoryModal(false)} 
          role="tenant"
          propertyId={viewedProperty.id}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 md:py-12 space-y-6 sm:space-y-12 text-slate-800 dark:text-slate-100">
      
      {/* Join Property Section (Horizontal Format) */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900 dark:bg-slate-900/40 border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand-purple/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 md:gap-10">
          {/* Left info column */}
          <div className="flex items-center gap-3 text-left flex-row max-w-md shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-2xl font-black text-white tracking-tight">Join a Property</h2>
              <p className="hidden sm:block text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                Enter the <span className="font-extrabold text-white">8-character property code</span> shared by your landlord.
              </p>
            </div>
          </div>

          {/* Right form/success column */}
          <div className="w-full sm:flex-1 max-w-md shrink-0">
            <AnimatePresence mode="wait">
              {/* SUCCESS STATE */}
              {joinState === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-3"
                >
                  <div className="bg-emerald-950/60 rounded-xl border border-emerald-500/30 p-4 space-y-2 text-center flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                    <span className="text-sm font-black text-white block">Request Sent Successfully!</span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 block">
                      Awaiting owner approval. You will be notified once they review your request.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 px-3 border border-white/10 hover:bg-white/5 text-slate-450 hover:text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* INPUT STATE */
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-2 items-stretch">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="ENTER CODE"
                        maxLength={CODE_LENGTH}
                        value={code}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`w-full h-10 text-center text-xs font-mono font-black rounded-lg border transition-all outline-none uppercase tracking-widest ${
                          joinState === 'error'
                            ? 'border-red-500 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                            : code
                            ? 'border-brand-purple bg-brand-purple/5 text-white shadow-[0_0_10px_rgba(124,58,237,0.1)]'
                            : 'border-white/10 bg-slate-950/50 text-white focus:border-brand-primary focus:bg-slate-900'
                        }`}
                      />
                      {joinState === 'error' && (
                        <p className="absolute left-1 -bottom-4 text-[8px] font-bold text-red-450 flex items-center gap-0.5 z-10">
                          <Lock className="w-2.5 h-2.5 text-red-500" />
                          Verification failed. Check with owner.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleJoin}
                      disabled={!isFull || joinState === 'verifying'}
                      className={`h-10 px-4 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                        isFull && joinState !== 'verifying'
                          ? 'bg-brand-purple text-white shadow-[0_0_15px_rgba(1,65,28,0.12)] hover:bg-[#003B1F]'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                        {joinState === 'verifying' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-purple" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Submit Request
                          </>
                        )}
                      </button>
                  </div>
                  {/* Empty spacer for error message if present */}
                  {joinState === 'error' && <div className="h-2" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Rented Properties Section */}
      <section>
        <div className="mb-3 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Rented Properties</h2>
            <p className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Access your active leases and dashboards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentedProperties.map((property, idx) => (
            <div key={property.id} className="relative">
              <PropertyCard
                property={property}
                index={idx}
                onView={() => {
                  setViewedProperty(property);
                  if (onPropertySelect) onPropertySelect(property);
                }}
              />
              {(property as any).rent_status === 'due' ? (
                <div className="absolute top-4 right-4 z-20 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-md pointer-events-none animate-pulse">
                  Rent Due
                </div>
              ) : (property as any).rent_status === 'pending' ? (
                <div className="absolute top-4 right-4 z-20 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-md pointer-events-none animate-pulse">
                  Verification Pending
                </div>
              ) : (
                <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-md pointer-events-none">
                  Active Lease
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
