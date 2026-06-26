import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <div 
        className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium flex justify-between items-center transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-purple/50'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100 flex items-center gap-2 px-3 bg-slate-50">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search..." 
                className="w-full py-1.5 bg-transparent text-sm outline-none text-slate-700"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? filteredOptions.map(option => (
                <div 
                  key={option}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === option ? 'text-brand-purple font-bold bg-brand-purple/5' : 'text-slate-700 hover:bg-slate-50'}`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  {option}
                </div>
              )) : (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No results found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
