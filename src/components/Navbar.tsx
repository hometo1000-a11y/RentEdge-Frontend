'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, User, LogOut, Sun, Moon } from 'lucide-react';
import MagneticButton from './MagneticButton';

interface NavbarProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  onSignOut: () => void;
}

export default function Navbar({ isAuthenticated, onAuthRequired, onSignOut }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('discover');

  // Auto-highlight active section on scroll
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
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Suppress transitions on initial mount to prevent FOIT (flash of incorrect theme)
  useEffect(() => {
    const root = document.documentElement;
    // Block transitions during initial theme application
    root.classList.add('no-transition');

    const savedTheme = localStorage.getItem('rentedge_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      root.classList.add('dark');
    } else {
      setIsDarkMode(false);
      root.classList.remove('dark');
    }

    // Re-enable smooth transitions after initial paint is committed
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transition');
      });
    });
  }, []);

  const toggleTheme = () => {
    // User-triggered: transitions ARE enabled — smooth morph will play
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rentedge_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rentedge_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full pt-4 pb-3 px-5 md:px-8 flex items-center justify-between gap-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-slate-200/50 dark:border-slate-800/50 md:border-transparent">
      {/* LEFT CORNER: Logo Container & Theme Switcher */}
      <div className="flex items-center gap-2">
        <a 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 bg-transparent md:bg-white/80 md:dark:bg-slate-900/80 md:backdrop-blur-md md:border md:border-slate-200/50 md:dark:border-white/10 md:px-4 md:py-2.5 rounded-2xl md:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary text-white font-bold dark:bg-brand-purple">
            <span className="text-sm font-extrabold tracking-tighter">RE</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mint opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-mint"></span>
            </span>
          </div>
          <span className="hidden md:block text-xl font-bold tracking-tight text-brand-primary dark:text-white font-sans">
            Rent<span className="text-brand-purple">Edge</span>
          </span>
        </a>

        {/* Mobile Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="md:hidden p-2 rounded-xl text-slate-650 dark:text-amber-400 transition-all cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* MIDDLE SECTION: Floating Nav Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:flex items-center justify-center rounded-full glass-panel px-8 py-3.5 shadow-sm border border-slate-200/50 dark:border-white/10"
      >
        <div className="flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-350">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`transition-colors duration-200 ${
              activeSection === 'discover' 
                ? 'text-brand-purple dark:text-violet-400 font-bold scale-[1.02]' 
                : 'hover:text-brand-purple'
            }`}
          >
            Discover Homes
          </a>
          <a 
            href="#features" 
            className={`transition-colors duration-200 ${
              activeSection === 'features' 
                ? 'text-brand-purple dark:text-violet-400 font-bold scale-[1.02]' 
                : 'hover:text-brand-purple'
            }`}
          >
            The Fintech Edge
          </a>
          <a 
            href="#pricing" 
            className={`transition-colors duration-200 ${
              activeSection === 'pricing' 
                ? 'text-brand-purple dark:text-violet-400 font-bold scale-[1.02]' 
                : 'hover:text-brand-purple'
            }`}
          >
            Pricings
          </a>
          <a 
            href="#about" 
            className={`transition-colors duration-200 ${
              activeSection === 'about' 
                ? 'text-brand-purple dark:text-violet-400 font-bold scale-[1.02]' 
                : 'hover:text-brand-purple'
            }`}
          >
            About Us
          </a>
        </div>
      </motion.nav>

      {/* RIGHT CORNER: Dark Mode & Action Box */}
      <div className="hidden md:flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-amber-400 transition-all cursor-pointer shadow-2xs"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 bg-brand-purple/10 px-3 py-1.5 rounded-xl border border-brand-purple/20">
              <User className="w-3.5 h-3.5 text-brand-purple" />
              <span className="text-xs font-bold text-brand-purple">Active Tenant</span>
            </div>
            <button
              onClick={onSignOut}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <MagneticButton 
            onClick={onAuthRequired}
            variant="primary"
            size="sm"
            className="!font-semibold"
          >
            Get Started
            <ArrowRight className="w-4 h-4 text-brand-mint" />
          </MagneticButton>
        )}
      </div>

      {/* Mobile Right Corner: Action Button */}
      <div className="md:hidden flex items-center">
        {isAuthenticated ? (
          <button
            onClick={onSignOut}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={onAuthRequired}
            className="px-3 py-1.5 bg-brand-primary dark:bg-brand-purple text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            Get Started
            <ArrowRight className="w-3 h-3 text-brand-mint" />
          </button>
        )}
      </div>
    </header>
  );
}
