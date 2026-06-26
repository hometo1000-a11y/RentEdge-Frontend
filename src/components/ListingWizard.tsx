'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  X,
  AlertTriangle
} from 'lucide-react';

interface ListingWizardProps {
  onCompleteListing?: (data: any) => void;
  onCancel?: () => void;
}

const PRESET_MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=350&q=80'
];

export default function ListingWizard({ onCompleteListing, onCancel }: ListingWizardProps) {
  const [propertyCategory, setPropertyCategory] = useState<'Apartment' | 'PG' | 'Villa'>('Apartment');
  const [bhkConfig, setBhkConfig] = useState('2 BHK');
  const [pgSharing, setPgSharing] = useState('2 Sharing');
  const [address, setAddress] = useState('');
  const [rentAmount, setRentAmount] = useState<number>(25000);
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [totalUnits, setTotalUnits] = useState<number>(1);
  
  // Strict Media State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const simulateAddImage = () => {
    // Sequentially add presets, wrapping around
    const nextIndex = uploadedImages.length % PRESET_MOCK_IMAGES.length;
    const newImage = PRESET_MOCK_IMAGES[nextIndex];
    
    // Prevent duplicate entries
    if (!uploadedImages.includes(newImage)) {
      setUploadedImages(prev => [...prev, newImage]);
    } else {
      // If already added, generate unique variant query to allow multiple
      setUploadedImages(prev => [...prev, `${newImage}&sig=${Date.now()}`]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Please enter a premises address.');
      return;
    }
    if (uploadedImages.length === 0) {
      alert('Strict Media Rule: You must upload at least one image to activate.');
      return;
    }
    const finalData = {
      category: propertyCategory,
      config: propertyCategory === 'PG' ? pgSharing : bhkConfig,
      address,
      rent: rentAmount,
      deposit: depositAmount,
      images: uploadedImages,
      totalUnits: totalUnits
    };
    if (onCompleteListing) {
      onCompleteListing(finalData);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-lg text-left">
      
      {/* Wizard Header */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#7C3AED]" />
          Asset Listing Wizard
        </h3>
        <p className="text-[10px] text-slate-450 font-bold mt-1">
          Configure property specifications based on zoning category types.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Category Toggles */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
            Property Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Apartment', 'PG', 'Villa'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setPropertyCategory(cat)}
                className={`py-3 px-4 border rounded-2xl text-xs font-black text-center transition-all cursor-pointer ${
                  propertyCategory === cat
                    ? 'border-[#7C3AED] bg-indigo-50/50 text-[#7C3AED] shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Conditional Input Fields with Framer Motion */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 overflow-hidden relative min-h-[96px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Case A: Apartment or Villa (BHK Selector) */}
            {(propertyCategory === 'Apartment' || propertyCategory === 'Villa') && (
              <motion.div
                key="apartment-villa-fields"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-2 w-full text-left"
              >
                <label className="text-[10px] uppercase font-extrabold text-slate-450 tracking-wider block">
                  Configuration Options (BHK)
                </label>
                <select
                  value={bhkConfig}
                  onChange={(e) => setBhkConfig(e.target.value)}
                  className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="1 BHK">1 BHK Apartment</option>
                  <option value="2 BHK">2 BHK Apartment</option>
                  <option value="3 BHK">3 BHK Luxury Suite</option>
                  <option value="3+ BHK">3+ BHK Villa / Mansion</option>
                </select>
              </motion.div>
            )}

            {/* Case B: PG (Sharing Occupancy Radio Grid) */}
            {propertyCategory === 'PG' && (
              <motion.div
                key="pg-fields"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-2.5 w-full text-left"
              >
                <label className="text-[10px] uppercase font-extrabold text-slate-450 tracking-wider block">
                  Occupancy Type (Sharing Tiers)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  {[
                    { id: '1 Sharing', label: '1 Sharing', desc: 'Private Suite' },
                    { id: '2 Sharing', label: '2 Sharing', desc: 'Double Occupancy' },
                    { id: '3 Sharing', label: '3 Sharing', desc: 'Triple Shared' }
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        pgSharing === opt.id
                          ? 'border-[#7C3AED] bg-white text-[#7C3AED] shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50/50 text-slate-600'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block text-xs font-black">{opt.label}</span>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase">{opt.desc}</span>
                      </div>
                      <input
                        type="radio"
                        name="pgSharingOption"
                        checked={pgSharing === opt.id}
                        onChange={() => setPgSharing(opt.id)}
                        className="w-3.5 h-3.5 accent-[#7C3AED] cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Step 3: STRICT MEDIA ENFORCEMENT DROPZONE */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
              Property Media (Mandatory)
            </label>
            <span className="text-[10px] text-indigo-600 font-black">
              {uploadedImages.length} Image(s) Attached
            </span>
          </div>

          {/* Dash area dropzone */}
          <div
            onClick={simulateAddImage}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); simulateAddImage(); }}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center select-none ${
              dragOver 
                ? 'border-[#7C3AED] bg-indigo-50/20' 
                : 'border-slate-200 hover:border-slate-350 bg-slate-50/30 hover:bg-slate-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-200">
              <ImageIcon className="w-5 h-5 text-[#7C3AED]" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-slate-900">
                Click or drag property photos here to upload
              </p>
              <p className="text-[9.5px] text-slate-450 font-bold uppercase tracking-wide">
                Strict Media Rule: Minimum 1 photo required to launch listing
              </p>
            </div>
          </div>

          {/* Render uploaded image thumbnails */}
          <AnimatePresence>
            {uploadedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-3 sm:grid-cols-6 gap-3.5 pt-2"
              >
                {uploadedImages.map((imgUrl, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group"
                  >
                    <img src={imgUrl} alt="Preview thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }}
                      className="absolute top-1 right-1 p-1 bg-slate-950/80 hover:bg-red-650 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 4: Premises address & Total Units */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-455 tracking-wider">
              Premises Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Skyline Heights, BHK-2, Sector 62"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-455 tracking-wider">
              Total Units to Broadcast
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={totalUnits}
              onChange={(e) => setTotalUnits(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono font-bold outline-none"
            />
          </div>
        </div>

        {/* Financial metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
              Monthly Rent (INR)
            </label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono font-bold outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
              Security Deposit (INR)
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono font-bold outline-none"
            />
          </div>
        </div>

        {/* Action controls with Hard Lock and Warning Alert Banner */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          
          <AnimatePresence>
            {uploadedImages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2 text-[10.5px] font-extrabold text-[#7C3AED] bg-indigo-50 border border-indigo-100/50 p-3 rounded-2xl"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                <span>📸 At least one property image is required to publish this listing.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={uploadedImages.length === 0}
              className={`px-5 py-2.5 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                uploadedImages.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-emerald-500/10'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Publish to Live Network
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
