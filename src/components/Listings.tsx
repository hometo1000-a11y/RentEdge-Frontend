'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, X, Check, Loader2, Home as HomeIcon, Building2
} from 'lucide-react';
import { Property } from './propertiesData';
import { api } from './api';
import PropertyCard from './PropertyCard';
import PropertyDetailsDrawer from './PropertyDetailsDrawer';
import SearchableSelect from './SearchableSelect';
import indiaStatesCities from '../data/indiaStatesCities.json';

const STATE_CITY_MAP: Record<string, string[]> = indiaStatesCities;

interface FilterState {
  // Global
  q: string;
  state: string;
  city: string;
  property_type: string;
  min_rent: string;
  max_rent: string;
  tags: string[];
  // Dynamic - Residential
  bhk: string;
  bathrooms: string;
  furnishing: string;
  occupancy_type: string;
  parking_required: boolean;
  // Dynamic - PG
  sharing_type: string;
  food_option: string;
  attached_washroom: boolean;
  // Dynamic - Commercial
  commercial_types: string[];
  min_area: string;
  max_area: string;
}

const DEFAULT_FILTERS: FilterState = {
  q: '',
  state: 'All',
  city: 'All',
  property_type: 'All',
  min_rent: '',
  max_rent: '',
  tags: [],
  bhk: 'Any',
  bathrooms: 'Any',
  furnishing: 'Any',
  occupancy_type: 'Any',
  parking_required: false,
  sharing_type: 'Any',
  food_option: 'BOTH',
  attached_washroom: false,
  commercial_types: [],
  min_area: '',
  max_area: '',
};

export default function Listings({ onEnquire }: { onEnquire?: (property: Property) => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchProperties = useCallback(async (pageNum: number, currentFilters: FilterState, isLoadMore: boolean = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const payload: any = {
        limit: LIMIT,
        offset: pageNum * LIMIT,
        q: currentFilters.q || undefined,
        state: currentFilters.state !== 'All' ? currentFilters.state : undefined,
        city: currentFilters.city !== 'All' ? currentFilters.city : undefined,
        property_type: currentFilters.property_type !== 'All' ? currentFilters.property_type : undefined,
        min_rent: currentFilters.min_rent || undefined,
        max_rent: currentFilters.max_rent || undefined,
        tags: currentFilters.tags.length > 0 ? currentFilters.tags.join(',') : undefined,
      };

      // Add dynamic filters based on property type
      const isResidential = ['Apartment', 'House', 'Villa'].includes(currentFilters.property_type);
      const isPG = currentFilters.property_type === 'PG';
      const isCommercial = currentFilters.property_type === 'Commercial';

      if (isResidential) {
        payload.bhk = currentFilters.bhk !== 'Any' ? currentFilters.bhk : undefined;
        payload.furnishing = currentFilters.furnishing !== 'Any' ? currentFilters.furnishing : undefined;
        payload.parking_required = currentFilters.parking_required ? 'true' : undefined;
      }
      if (isResidential || isPG) {
        payload.occupancy_type = currentFilters.occupancy_type !== 'Any' ? currentFilters.occupancy_type : undefined;
      }
      if (isPG) {
        payload.sharing_type = currentFilters.sharing_type !== 'Any' ? currentFilters.sharing_type : undefined;
        payload.food_option = currentFilters.food_option !== 'BOTH' ? currentFilters.food_option : undefined;
        payload.attached_washroom = currentFilters.attached_washroom ? 'true' : undefined;
      }
      if (isCommercial) {
        payload.commercial_types = currentFilters.commercial_types.length > 0 ? currentFilters.commercial_types.join(',') : undefined;
        payload.min_area = currentFilters.min_area || undefined;
        payload.max_area = currentFilters.max_area || undefined;
      }

      const data = await api.getPublicProperties(payload);
      
      if (isLoadMore) {
        setProperties(prev => [...prev, ...(data.properties || [])]);
      } else {
        setProperties(data.properties || []);
      }
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load & Filter change effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchProperties(0, filters, false);
    }, 400); // Debounce
    return () => clearTimeout(timer);
  }, [filters, fetchProperties]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProperties(nextPage, filters, true);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, filters, fetchProperties]);


  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'tags' | 'commercial_types', value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      if (arr.includes(value)) return { ...prev, [key]: arr.filter(i => i !== value) };
      return { ...prev, [key]: [...arr, value] };
    });
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  // Dynamic Visibility Logic
  const pt = filters.property_type;
  const showResidential = ['Apartment', 'House', 'Villa'].includes(pt);
  const showPG = pt === 'PG';
  const showCommercial = pt === 'Commercial';

  const FilterPanel = () => (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-purple" />
          Filters
        </h3>
        <button onClick={clearFilters} className="text-[11px] font-bold text-slate-400 hover:text-brand-purple transition-colors bg-slate-50 px-2 py-1 rounded">
          Clear All
        </button>
      </div>

      {/* Global Filters */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Location</h4>
        <SearchableSelect 
          label="State"
          placeholder="All States"
          value={filters.state === 'All' ? '' : filters.state}
          onChange={v => { updateFilter('state', v || 'All'); updateFilter('city', 'All'); }}
          options={Object.keys(STATE_CITY_MAP)}
        />
        <SearchableSelect 
          label="City"
          placeholder="All Cities"
          value={filters.city === 'All' ? '' : filters.city}
          onChange={v => updateFilter('city', v || 'All')}
          options={filters.state !== 'All' ? (STATE_CITY_MAP[filters.state] || []) : []}
          disabled={filters.state === 'All'}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Property Type</h4>
        <div className="flex flex-wrap gap-2">
          {['All', 'Apartment', 'House', 'Villa', 'PG', 'Commercial'].map(type => (
            <button
              key={type}
              onClick={() => updateFilter('property_type', type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filters.property_type === type
                  ? 'bg-brand-purple text-white border-brand-purple'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Budget (₹)</h4>
        <div className="flex items-center gap-3">
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.min_rent}
            onChange={(e) => updateFilter('min_rent', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-purple transition-colors"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.max_rent}
            onChange={(e) => updateFilter('max_rent', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-purple transition-colors"
          />
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Dynamic Filters - Residential */}
      {showResidential && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">BHK</h4>
            <div className="flex flex-wrap gap-2">
              {['Any', '1', '2', '3+'].map(bhk => (
                <button
                  key={bhk}
                  onClick={() => updateFilter('bhk', bhk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.bhk === bhk
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
                  }`}
                >
                  {bhk === 'Any' ? 'Any' : `${bhk} BHK`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Furnishing</h4>
            <div className="flex flex-wrap gap-2">
              {['Any', 'Fully Furnished', 'Semi Furnished', 'Unfurnished'].map(furn => (
                <button
                  key={furn}
                  onClick={() => updateFilter('furnishing', furn)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.furnishing === furn
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
                  }`}
                >
                  {furn.replace(' Furnished', '')}
                </button>
              ))}
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${filters.parking_required ? 'bg-brand-purple border-brand-purple text-white' : 'border-slate-300 text-transparent group-hover:border-brand-purple'}`}>
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm font-bold text-slate-700">Parking Required</span>
            <input type="checkbox" className="hidden" checked={filters.parking_required} onChange={(e) => updateFilter('parking_required', e.target.checked)} />
          </label>
        </div>
      )}

      {/* Dynamic Filters - PG */}
      {showPG && (
        <div className="space-y-5 animate-fade-in border-t border-slate-100 pt-5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">PG Sharing Type</h4>
            <div className="flex flex-wrap gap-2">
              {['Any', 'Single Sharing', 'Double Sharing', 'Triple Sharing', 'Dormitory'].map(sharing => (
                <button
                  key={sharing}
                  onClick={() => updateFilter('sharing_type', sharing)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.sharing_type === sharing
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
                  }`}
                >
                  {sharing.replace(' Sharing', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Food Option</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 'BOTH', label: 'Any/Both' },
                { val: 'WITH_FOOD', label: 'With Food' },
                { val: 'WITHOUT_FOOD', label: 'Without Food' }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => updateFilter('food_option', opt.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.food_option === opt.val
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${filters.attached_washroom ? 'bg-brand-purple border-brand-purple text-white' : 'border-slate-300 text-transparent group-hover:border-brand-purple'}`}>
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm font-bold text-slate-700">Attached Washroom</span>
            <input type="checkbox" className="hidden" checked={filters.attached_washroom} onChange={(e) => updateFilter('attached_washroom', e.target.checked)} />
          </label>
        </div>
      )}

      {/* Occupancy Type (Residential + PG) */}
      {(showResidential || showPG) && (
        <div className="space-y-3 border-t border-slate-100 pt-5">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tenant Preference</h4>
          <div className="flex flex-wrap gap-2">
            {['Any', 'Family Only', 'Bachelors Only', 'Male Only', 'Female Only', 'Co-ed'].map(occ => {
              // Hide PG specific options if only residential selected, and vice versa
              if (!showPG && ['Male Only', 'Female Only', 'Co-ed'].includes(occ)) return null;
              if (!showResidential && ['Family Only', 'Bachelors Only'].includes(occ)) return null;
              
              return (
                <button
                  key={occ}
                  onClick={() => updateFilter('occupancy_type', occ)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.occupancy_type === occ
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
                  }`}
                >
                  {occ}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dynamic Filters - Commercial */}
      {showCommercial && (
        <div className="space-y-5 animate-fade-in border-t border-slate-100 pt-5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commercial Space Type</h4>
            <div className="flex flex-wrap gap-2">
              {['office', 'shop', 'warehouse'].map(ctype => (
                <button
                  key={ctype}
                  onClick={() => toggleArrayFilter('commercial_types', ctype)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border capitalize ${
                    filters.commercial_types.includes(ctype)
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/50'
                  }`}
                >
                  {ctype}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commercial Area (Sqft)</h4>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Min Area" 
                value={filters.min_area}
                onChange={(e) => updateFilter('min_area', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-purple"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input 
                type="number" 
                placeholder="Max Area" 
                value={filters.max_area}
                onChange={(e) => updateFilter('max_area', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-purple"
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-px bg-slate-100 mt-2" />

      {/* Global Smart Tags */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
          Smart Tags <span className="w-1.5 h-1.5 rounded-full bg-brand-purple inline-block"></span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {['Transit Friendly', 'Work Hub', 'Student Friendly', 'Premium', 'Luxury', 'Budget Friendly'].map(tag => {
            // Map UI tags to Backend recognized tags
            const backendTagMap: Record<string, string> = {
              'Transit Friendly': 'Near Metro',
              'Work Hub': 'Tech Hub',
              'Student Friendly': 'Student Friendly',
              'Premium': 'Premium',
              'Luxury': 'Luxury',
              'Budget Friendly': 'Budget Friendly'
            };
            const actualTag = backendTagMap[tag] || tag;

            return (
              <button
                key={tag}
                onClick={() => toggleArrayFilter('tags', actualTag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  filters.tags.includes(actualTag)
                    ? 'bg-brand-purple/10 text-brand-purple border-brand-purple'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-purple/30'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Header / Search */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            
            {/* Main Search Bar (Locality, Name) */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search by locality, building, or city..."
                value={filters.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all shadow-inner"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center p-3 rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/20 active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8 items-start relative">
          
          {/* Desktop Filter Sidebar */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div 
                initial={{ width: 0, opacity: 0, scale: 0.95 }}
                animate={{ width: 320, opacity: 1, scale: 1 }}
                exit={{ width: 0, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="hidden lg:block shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2"
              >
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 w-[300px]">
                  <FilterPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Property Grid */}
          <div className="flex-1 min-w-0">
            {loading && page === 0 ? (
              // Initial Loading Skeletons
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[420px] bg-white rounded-[24px] border border-slate-200 animate-pulse overflow-hidden flex flex-col">
                    <div className="h-56 bg-slate-200"></div>
                    <div className="p-5 space-y-4 flex-1">
                      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="flex gap-2 mt-auto">
                        <div className="h-8 bg-slate-200 rounded w-16"></div>
                        <div className="h-8 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800">No properties match your exact criteria</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">
                  Try broadening your search by removing some filters, or zooming out to a different locality.
                </p>
                <button 
                  onClick={clearFilters}
                  className="mt-8 px-6 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              // Results Grid
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property, idx) => (
                    <PropertyCard 
                      key={property.id + '-' + idx} 
                      property={property} 
                      onView={() => setSelectedProperty(property)} 
                    />
                  ))}
                </div>
                
                {/* Intersection Observer Target for Infinite Scroll */}
                <div ref={observerTarget} className="w-full py-8 flex justify-center items-center">
                  {loadingMore ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loading more...</span>
                    </div>
                  ) : hasMore ? (
                    <div className="h-10"></div> // invisible target
                  ) : (
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                      You've reached the end of the results.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer (Bottom Sheet style) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] h-[85vh] flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h3 className="text-lg font-black text-slate-800">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <FilterPanel />
              </div>

              <div className="p-5 border-t border-slate-100 bg-white shrink-0 flex gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3.5 bg-slate-50 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 bg-slate-900 text-white font-black rounded-xl text-sm shadow-md hover:bg-slate-800 transition-colors"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Property Details Modal */}
      <PropertyDetailsDrawer 
        property={selectedProperty} 
        isOpen={!!selectedProperty} 
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
