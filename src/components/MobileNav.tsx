'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, DollarSign, Info } from 'lucide-react';

const tabs = [
  { id: 'discover', label: 'Discover', icon: Search },
  { id: 'features', label: 'Features', icon: Sparkles },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'about', label: 'About', icon: Info }
];

export default function MobileNav() {
  const [activeTab, setActiveTab] = useState('discover');

  // Auto-highlight active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const sections = ['discover', 'features', 'pricing', 'about'];
      let currentSection = 'discover';

      for (const section of sections) {
        if (section === 'discover') continue;
        const el = document.getElementById(section);
        if (el && scrollPosition >= el.offsetTop) {
          currentSection = section;
        }
      }
      setActiveTab(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'discover') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(tabId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4 bg-gradient-to-t from-[#F8F5EE] via-[#F8F5EE]/80 to-transparent pointer-events-none">
      <div className="mx-auto max-w-md w-full h-16 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-xl flex items-center justify-around px-4 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 w-16 h-full text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
            >
              {/* Active Indicator bubble background */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-brand-purple/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon className={`w-5 h-5 transition-transform duration-250 ${isActive ? 'text-brand-purple scale-110' : ''}`} />
              <span className={`text-[9px] font-bold mt-1 tracking-wide ${isActive ? 'text-brand-purple' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Top tiny active dot */}
              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute top-1 w-1 h-1 rounded-full bg-brand-purple"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
