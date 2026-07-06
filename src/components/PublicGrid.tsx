'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ShieldAlert, 
  Heart, 
  Scaling, 
  BedDouble, 
  Bath, 
  X, 
  MapPin, 
  Zap, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Property, mockProperties } from './propertiesData';
import { api } from './api';
import PropertyCard from './PropertyCard';
import PropertyDetailsDrawer from './PropertyDetailsDrawer';

interface PublicGridProps {
  searchFilters?: { location: string; type: string; budget: string };
  isAuthenticated: boolean;
  onAuthRequired: (property?: Property) => void;
  activeProperty: Property | null;
  setActiveProperty: (property: Property | null) => void;
}

export default function PublicGrid({ 
  searchFilters, 
  isAuthenticated, 
  onAuthRequired, 
  activeProperty, 
  setActiveProperty 
}: PublicGridProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    setIsLoading(true);
    // Fetch top 3 properties to tease unauthenticated users
    api.getPublicProperties({ limit: 3 }).then(res => {
      if (res.properties && res.properties.length > 0) {
        setProperties(res.properties);
      } else {
        setProperties(mockProperties);
      }
    }).catch(() => {
      setProperties(mockProperties);
    }).finally(() => {
      setTimeout(() => setIsLoading(false), 800);
    });
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
  };

  const handleCardClick = (prop: Property) => {
    if (isAuthenticated) {
      setActiveProperty(prop);
    } else {
      onAuthRequired(prop);
    }
  };

  // Stagger animation definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <section id="discover" className="w-full px-4 pt-4 pb-20 bg-transparent relative text-left z-10">
      <div className="max-w-7xl mx-auto">

        {/* ─── Simplified Teaser Header ─── */}
        <div className="mb-10 text-center flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Discover Premium Rentals
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl">
            Explore our curated selection of verified properties. Sign in to unlock full search, advanced filters, and personalized recommendations.
          </p>
        </div>

        {/* ─── Listings Grid & Loading State ─── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-[#0B1F14] rounded-[24px] overflow-hidden border border-slate-100 dark:border-white/5 p-5 space-y-4 shadow-sm flex flex-col">
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse relative overflow-hidden">
                  {/* Shimmer line */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/25 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="h-4.5 bg-slate-200 dark:bg-slate-850 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-850/80 rounded-lg w-1/2 animate-pulse" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 bg-slate-100 dark:bg-slate-850/60 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-slate-100 dark:bg-slate-850/60 rounded-full w-16 animate-pulse" />
                </div>
                <div className="h-11 bg-slate-200 dark:bg-slate-850 rounded-xl w-full animate-pulse mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
          >
            {properties.slice(0, 3).map((prop, i) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onView={(p) => handleCardClick(p)}
                index={i}
                onFavorite={(id, e) => toggleFavorite(id, e)}
                isFavorited={false}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-white dark:bg-[#0B1F14] rounded-[24px] border border-slate-200/60 dark:border-white/5 shadow-sm p-12 text-center flex flex-col items-center justify-center mt-8"
          >
            <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No properties found</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm font-semibold">
              Currently no properties available in the public catalog.
            </p>
          </motion.div>
        )}

        {/* Show More Button */}
        {!isLoading && properties.length > 0 && (
          <div className="mt-12 flex justify-center w-full">
            <button 
              onClick={() => onAuthRequired()}
              className="px-8 py-3 bg-slate-900 dark:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Sign In to See More Listings
            </button>
          </div>
        )}
      </div>

      {/* Property Details Drawer/Modal */}
      <PropertyDetailsDrawer
        property={activeProperty}
        isOpen={!!activeProperty && isAuthenticated}
        onClose={() => setActiveProperty(null)}
      />
    </section>
  );
}
