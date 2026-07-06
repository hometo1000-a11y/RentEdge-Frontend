'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, DollarSign, Sparkles, ChevronDown, Check, Calendar } from 'lucide-react';

const locations = [
  { name: 'Bengaluru', areas: 'HSR, Indiranagar, Koramangala' },
  { name: 'Mumbai', areas: 'Bandra, Juhu, Powai' },
  { name: 'Delhi NCR', areas: 'Gurugram Sec 54, Vasant Kunj' },
  { name: 'Pune', areas: 'Koregaon Park, Kalyani Nagar' }
];

const propertyTypes = [
  { label: 'Premium Apartment', desc: 'Sleek high-rises with top amenities' },
  { label: 'Luxury Villa', desc: 'Standalone mansions with private lawns' },
  { label: 'PG / Hostel', desc: 'Co-living spaces & shared accommodations' },
  { label: 'Studio Suite', desc: 'Compact premium spaces for executives' }
];

const budgetRangesByType: { [key: string]: { label: string; desc: string }[] } = {
  'PG / Hostel': [
    { label: 'Any', desc: 'Any budget' },
    { label: '₹5,000 - ₹12,000', desc: 'Budget Living' },
    { label: '₹12,000 - ₹25,000', desc: 'Premium Co-Living' },
    { label: '₹25,000 - ₹45,000', desc: 'Luxury Co-Living' },
    { label: '₹45,000+', desc: 'Executive Hostel' }
  ],
  'Studio Suite': [
    { label: 'Any', desc: 'Any budget' },
    { label: '₹15,000 - ₹30,000', desc: 'Essential Studio' },
    { label: '₹30,000 - ₹50,000', desc: 'Premium Studio' },
    { label: '₹50,000 - ₹80,000', desc: 'Executive Studio' },
    { label: '₹80,000+', desc: 'Luxury Studio' }
  ],
  'Premium Apartment': [
    { label: 'Any', desc: 'Any budget' },
    { label: '₹25,000 - ₹50,000', desc: 'Standard Premium' },
    { label: '₹50,000 - ₹1,00,000', desc: 'Executive Living' },
    { label: '₹1,00,000 - ₹1,80,000', desc: 'Luxury Suite' },
    { label: '₹1,80,000+', desc: 'Ultra Elite' }
  ],
  'Luxury Villa': [
    { label: 'Any', desc: 'Any budget' },
    { label: '₹50,000 - ₹1,20,000', desc: 'Premium Villa' },
    { label: '₹1,20,000 - ₹2,50,000', desc: 'Elite Mansion' },
    { label: '₹2,50,000 - ₹5,00,000', desc: 'Ultra Estate' },
    { label: '₹5,00,000+', desc: 'Royal Palace' }
  ]
};

const dateOptions = [
  { label: 'Available Now', desc: 'Ready for immediate move-in' },
  { label: 'Within 7 Days', desc: 'Ready in one week' },
  { label: 'Within 15 Days', desc: 'Ready in two weeks' },
  { label: 'Next Month', desc: 'Ready next calendar month' }
];

interface HeroProps {
  onSearch: (filter: { location: string; type: string; budget: string }) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [activeTab, setActiveTab] = useState<'rent' | 'list'>('rent');
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'type' | 'budget' | 'date' | null>(null);

  const [selectedLocation, setSelectedLocation] = useState(locations[0].name);
  const [selectedType, setSelectedType] = useState(propertyTypes[0].label);
  const [selectedBudget, setSelectedBudget] = useState(budgetRangesByType[propertyTypes[0].label][0].label);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].label);
  const [isSearching, setIsSearching] = useState(false);

  // Custom inputs states
  const [customArea, setCustomArea] = useState('');
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    setIsSearching(true);
    setActiveDropdown(null);
    setTimeout(() => {
      setIsSearching(false);
      onSearch({
        location: selectedLocation,
        type: selectedType,
        budget: selectedBudget
      });
      // Scroll to listing grid
      const el = document.getElementById('discover');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  };

  return (
    <section className="relative w-full px-4 pt-32 pb-24 md:pt-36 md:pb-32 flex flex-col items-center justify-center overflow-visible z-20">
      {/* Background Decorative Blobs & Grid Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-70" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-mint/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>



      {/* Floating Badges */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 shadow-sm z-10"
      >
        <Sparkles className="w-4 h-4 text-brand-purple" />
        <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">
          ⚡ India's First Fintech-Powered Rental Network
        </span>
      </motion.div>

      {/* Hero Headline */}
      <div className="max-w-4xl text-center flex flex-col items-center mb-12 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-brand-primary leading-[1.1] font-sans"
        >
          The Smart Way to Rent.<br />
          <span className="text-brand-accent">
            Zero Brokers. Full Transparency.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg sm:text-xl text-slate-500 leading-relaxed font-normal"
        >
          Find premium broker-free homes, close agreements with embedded financial tools, pay rent instantly, and scale your credit score.
        </motion.p>
      </div>

      {/* Search Terminal Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full max-w-4xl z-20"
        ref={containerRef}
      >

        <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-100 p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 items-center">

            {/* Location Input */}
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
              className={`relative px-4 py-3 cursor-pointer rounded-2xl transition-all duration-200 ${activeDropdown === 'location' ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50 text-brand-purple">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Location</span>
                  <span className="block text-sm font-semibold text-slate-800 mt-0.5 truncate max-w-[180px]">{selectedLocation}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {activeDropdown === 'location' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left"
                  >
                    {/* Custom Area / Locality Input */}
                    <div className="px-1.5 pb-3 mb-2.5 border-b border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Custom Area / Locality</label>
                      <input
                        type="text"
                        placeholder="Type area (e.g. HSR, Bandra East)"
                        value={customArea}
                        onChange={(e) => {
                          setCustomArea(e.target.value);
                          setSelectedLocation(e.target.value || 'Bengaluru');
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 dark:bg-slate-900 dark:border-white/10 dark:text-white dark:placeholder-slate-500 focus:border-brand-primary rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors"
                      />
                    </div>

                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1.5">Popular Cities</span>

                    {/* Scrollable list container */}
                    <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                      {locations.map((loc) => (
                        <div
                          key={loc.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLocation(loc.name);
                            setCustomArea(''); // reset custom area
                            setActiveDropdown('type'); // auto advance
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <span className="block text-sm font-semibold text-slate-800">{loc.name}</span>
                            <span className="block text-xs text-slate-400 font-normal">{loc.areas}</span>
                          </div>
                          {selectedLocation === loc.name && <Check className="w-4 h-4 text-brand-mint" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Property Type Input */}
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
              className={`relative px-4 py-3 cursor-pointer rounded-2xl transition-all duration-200 ${activeDropdown === 'type' ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-brand-mint">
                  <Home className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Property Type</span>
                  <span className="block text-sm font-semibold text-slate-800 mt-0.5 truncate max-w-[160px]">{selectedType}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {activeDropdown === 'type' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1.5">Type</span>

                    {/* Full visible list */}
                    <div className="flex flex-col gap-1">
                      {propertyTypes.map((type) => (
                        <div
                          key={type.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedType(type.label);
                            const defaultBudget = budgetRangesByType[type.label][1].label;
                            setSelectedBudget(defaultBudget);
                            setCustomMin('');
                            setCustomMax('');
                            setActiveDropdown('budget'); // auto advance
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <span className="block text-sm font-semibold text-slate-800">{type.label}</span>
                            <span className="block text-xs text-slate-400 font-normal">{type.desc}</span>
                          </div>
                          {selectedType === type.label && <Check className="w-4 h-4 text-brand-mint" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Budget Range Input */}
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
              className={`relative px-4 py-3 cursor-pointer rounded-2xl transition-all duration-200 ${activeDropdown === 'budget' ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Monthly Budget</span>
                  <span className="block text-sm font-semibold text-slate-800 mt-0.5 truncate max-w-[160px]">{selectedBudget}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'budget' ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {activeDropdown === 'budget' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1.5">Budget Bracket</span>

                    {/* Scrollable list container */}
                    <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                      {(budgetRangesByType[selectedType] || budgetRangesByType['Premium Apartment']).map((b) => (
                        <div
                          key={b.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBudget(b.label);
                            setCustomMin(''); // reset custom inputs
                            setCustomMax('');
                            setActiveDropdown(null);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <span className="block text-sm font-semibold text-slate-800">{b.label}</span>
                            <span className="block text-xs text-slate-400 font-normal">{b.desc}</span>
                          </div>
                          {selectedBudget === b.label && <Check className="w-4 h-4 text-brand-mint" />}
                        </div>
                      ))}
                    </div>

                    {/* Custom Budget Range Input */}
                    <div className="px-1.5 pt-3 mt-2.5 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Custom Budget Range</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">₹</span>
                          <input
                            type="number"
                            placeholder="Min"
                            value={customMin}
                            onChange={(e) => {
                              setCustomMin(e.target.value);
                              const minVal = e.target.value ? `₹${Number(e.target.value).toLocaleString('en-IN')}` : '₹0';
                              const maxVal = customMax ? `₹${Number(customMax).toLocaleString('en-IN')}` : 'Any';
                              setSelectedBudget(`${minVal} - ${maxVal}`);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 dark:bg-slate-900 dark:border-white/10 dark:text-white dark:placeholder-slate-500 focus:border-brand-primary rounded-xl py-2 pl-6 pr-2.5 text-xs focus:outline-none transition-colors"
                          />
                        </div>
                        <span className="text-slate-400 text-xs">-</span>
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">₹</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={customMax}
                            onChange={(e) => {
                              setCustomMax(e.target.value);
                              const minVal = customMin ? `₹${Number(customMin).toLocaleString('en-IN')}` : '₹0';
                              const maxVal = e.target.value ? `₹${Number(e.target.value).toLocaleString('en-IN')}` : 'Any';
                              setSelectedBudget(`${minVal} - ${maxVal}`);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 dark:bg-slate-900 dark:border-white/10 dark:text-white dark:placeholder-slate-500 focus:border-brand-primary rounded-xl py-2 pl-6 pr-2.5 text-xs focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Move-in Date Input */}
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              className={`relative px-4 py-3 cursor-pointer rounded-2xl transition-all duration-200 ${activeDropdown === 'date' ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Move-in</span>
                  <span className="block text-sm font-semibold text-slate-800 mt-0.5 truncate max-w-[160px]">{selectedDate}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'date' ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {activeDropdown === 'date' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left min-w-[200px]"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1.5">Timeline</span>

                    <div className="flex flex-col gap-1">
                      {dateOptions.map((d) => (
                        <div
                          key={d.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(d.label);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <span className="block text-sm font-semibold text-slate-800">{d.label}</span>
                            <span className="block text-xs text-slate-400 font-normal">{d.desc}</span>
                          </div>
                          {selectedDate === d.label && <Check className="w-4 h-4 text-brand-mint" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Search Bar Action */}
          <div className="mt-3 flex flex-col sm:flex-row justify-between items-center bg-slate-50 rounded-2xl px-4 py-2.5 gap-3 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              ⚡ Over <span className="text-brand-purple font-semibold">14,200+</span> verified smart contracts signed this month
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearchSubmit}
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-3 bg-brand-primary dark:bg-brand-purple text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 dark:hover:bg-[#003B1F] transition-colors disabled:bg-slate-400 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-brand-mint" />
                  Search Terminal
                </>
              )}
            </motion.button>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
