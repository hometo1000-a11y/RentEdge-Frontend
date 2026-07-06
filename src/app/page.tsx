'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Listings from '@/components/Listings';
import { Property, mockProperties } from '@/components/propertiesData';

import Pricing from '@/components/Pricing';
import MobileNav from '@/components/MobileNav';
import AuthModal from '@/components/AuthModal';
import OwnerDashboard from '@/components/OwnerDashboard';
import TenantLifecycleController from '@/components/TenantLifecycleController';
import OwnerLifecycleController from '@/components/OwnerLifecycleController';
import PageTransitionShell from '@/components/PageTransitionShell';
import BackgroundLayer from '@/components/BackgroundLayer';
import { api } from '@/components/api';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Phone, MapPin, User, Home as HomeIcon, Building2 } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<{ location: string; type: string; budget: string } | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'tenant' | 'owner' | 'hostel'>('tenant');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingProperty, setPendingProperty] = useState<Property | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ensureBackendSession = async (session: any) => {
    const existingToken = localStorage.getItem('Homtu_token');
    if (existingToken) return { token: existingToken };
    if (!session?.access_token) throw new Error('Missing Supabase access token');
    const response = await api.login({ supabaseAccessToken: session.access_token });
    return response;
  };

  // Restore session & check for deep links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authRequired = params.get('auth');
      const targetPropertyId = params.get('property');
      if (authRequired === 'true') {
        if (targetPropertyId) {
          const propObj = mockProperties.find(p => p.id === targetPropertyId);
          if (propObj) {
            setPendingProperty(propObj);
          }
        }
        setAuthModalOpen(true);
        // Clean URL query params to keep UX clean
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        const response = await ensureBackendSession(session);
        const role = (session.user.user_metadata?.role || localStorage.getItem('Homtu_user_role') || 'tenant') as 'tenant' | 'owner' | 'hostel';
        setIsAuthenticated(true);
        setUserRole(role);
        localStorage.setItem('Homtu_authenticated', 'true');
        localStorage.setItem('Homtu_user_role', role);
        localStorage.setItem('Homtu_user_email', session.user.email || '');
        localStorage.setItem('Homtu_user_fullname', session.user.user_metadata?.full_name || session.user.user_metadata?.fullName || '');
        if (response?.user?.email) {
          localStorage.setItem('Homtu_user_email', response.user.email);
        }
      }
    };

    syncSession().catch(() => {
      setIsAuthenticated(false);
      localStorage.removeItem('Homtu_authenticated');
      localStorage.removeItem('Homtu_token');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        ensureBackendSession(session)
          .then((response) => {
            const role = (response?.user?.role || session.user.user_metadata?.role || localStorage.getItem('Homtu_user_role') || 'tenant') as 'tenant' | 'owner' | 'hostel';
            setIsAuthenticated(true);
            setUserRole(role);
            localStorage.setItem('Homtu_authenticated', 'true');
            localStorage.setItem('Homtu_user_role', role);
            localStorage.setItem('Homtu_user_email', response?.user?.email || session.user.email || '');
            localStorage.setItem('Homtu_user_fullname', response?.user?.fullName || session.user.user_metadata?.full_name || session.user.user_metadata?.fullName || '');
          })
          .catch(() => {
            setIsAuthenticated(false);
            localStorage.removeItem('Homtu_authenticated');
            localStorage.removeItem('Homtu_token');
          });
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleHeroSearch = (filters: { location: string; type: string; budget: string }) => {
    setSearchFilters(filters);
  };

  const handleAuthRequired = (property?: Property) => {
    if (property) {
      setPendingProperty(property);
    }
    setAuthModalOpen(true);
  };

  const [showPortalSelector, setShowPortalSelector] = useState(false);

  const handlePendingProperty = () => {
    setTimeout(() => setToastMessage(null), 4000);
    if (pendingProperty) {
      setActiveProperty(pendingProperty);
      setPendingProperty(null);
    }
  };

  const handleAuthSuccess = (user: any) => {
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    localStorage.setItem('Homtu_authenticated', 'true');
    
    if (user.isTenant && user.isOwner) {
      const lastPortal = localStorage.getItem('last_selected_portal');
      if (lastPortal === 'tenant' || lastPortal === 'owner') {
        setUserRole(lastPortal);
        localStorage.setItem('Homtu_user_role', lastPortal);
        setToastMessage(`Authentication successful! Route: ${lastPortal === 'tenant' ? 'Tenant' : 'Owner'} Portal.`);
        handlePendingProperty();
      } else {
        setShowPortalSelector(true);
      }
    } else if (user.isOwner) {
      setUserRole('owner');
      localStorage.setItem('Homtu_user_role', 'owner');
      localStorage.setItem('last_selected_portal', 'owner');
      setToastMessage(`Authentication successful! Route: Owner Portal.`);
      handlePendingProperty();
    } else {
      setUserRole('tenant');
      localStorage.setItem('Homtu_user_role', 'tenant');
      localStorage.setItem('last_selected_portal', 'tenant');
      setToastMessage(`Authentication successful! Route: Tenant Portal.`);
      handlePendingProperty();
    }
  };

  const handlePortalSelect = (role: 'tenant' | 'owner') => {
    setUserRole(role);
    localStorage.setItem('Homtu_user_role', role);
    localStorage.setItem('last_selected_portal', role);
    setShowPortalSelector(false);
    setToastMessage(`Welcome to the ${role === 'tenant' ? 'Tenant' : 'Owner'} Portal.`);
    handlePendingProperty();
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch (e) {}
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveProperty(null);
    setPendingProperty(null);
    localStorage.removeItem('Homtu_authenticated');
    localStorage.removeItem('Homtu_user_role');
    localStorage.removeItem('Homtu_lifecycle_state');
    localStorage.removeItem('Homtu_selected_property_id');
    localStorage.removeItem('Homtu_user_fullname');
    localStorage.removeItem('Homtu_user_email');
    localStorage.removeItem('Homtu_token');
    localStorage.removeItem('Homtu_pending_signup_role');
    localStorage.removeItem('Homtu_pending_signup_name');
    localStorage.removeItem('Homtu_pending_signup_email');

    setToastMessage('Logged out. Secure session revoked.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  if (showPortalSelector) {
    return (
      <PageTransitionShell className="min-h-screen flex items-center justify-center bg-[#F8F5EE] dark:bg-[#06130C] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-[#EAF3EC] text-[#01411C] rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Select Your Portal</h2>
          <p className="text-sm text-slate-500 mb-8">
            You have active accounts as both a Tenant and a Property Owner. Where would you like to go today?
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => handlePortalSelect('tenant')}
              className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-[#003B1F] hover:bg-[#EAF3EC]/30 transition-all text-left flex items-center gap-4 group"
            >
              <div className="p-3 bg-[#EAF3EC] text-[#01411C] rounded-xl group-hover:bg-[#003B1F] group-hover:text-white transition-colors">
                <HomeIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Tenant Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Browse properties, pay rent, view leases</p>
              </div>
            </button>

            <button 
              onClick={() => handlePortalSelect('owner')}
              className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-[#2B4162] hover:bg-[#EAF3EC]/30 transition-all text-left flex items-center gap-4 group"
            >
              <div className="p-3 bg-[#EAF3EC] text-[#2B4162] rounded-xl group-hover:bg-[#2B4162] group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Owner Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage properties, collect rent, screen tenants</p>
              </div>
            </button>
          </div>
        </motion.div>
      </PageTransitionShell>
    );
  }

  if (isAuthenticated && (userRole === 'owner' || userRole === 'hostel')) {
    return (
      <PageTransitionShell>
        <OwnerLifecycleController 
          onLogout={handleSignOut} 
          onSwitchToTenant={() => {
            setUserRole('tenant');
            localStorage.setItem('Homtu_user_role', 'tenant');
            localStorage.setItem('last_selected_portal', 'tenant');
          }}
        />
      </PageTransitionShell>
    );
  }

  if (isAuthenticated && userRole === 'tenant') {
    return (
      <PageTransitionShell>
        <TenantLifecycleController 
          onLogout={handleSignOut} 
          onSwitchToOwner={async () => {
            try {
              const token = localStorage.getItem('Homtu_token');
              if (token) {
                await fetch('`${API_URL}/api/users/switch-to-owner', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              }
            } catch (e) {
              console.error(e);
            }
            setUserRole('owner');
            localStorage.setItem('Homtu_user_role', 'owner');
            localStorage.setItem('last_selected_portal', 'owner');
          }}
        />
      </PageTransitionShell>
    );
  }

  return (
    <PageTransitionShell className="min-h-screen flex flex-col bg-transparent dark:text-slate-100 pb-16 md:pb-0 relative">
      <BackgroundLayer />
      
      {/* Dynamic Session Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2B4162] border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-[#01411C] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <Navbar 
        isAuthenticated={isAuthenticated}
        onAuthRequired={() => handleAuthRequired()}
        onSignOut={handleSignOut}
      />

      {/* Hero Section */}
      <Hero onSearch={handleHeroSearch} />

      {/* Dynamic Dashboard / Discovery Grid */}
      {isAuthenticated ? (
        <section className="w-full bg-[#F8F5EE] py-12 px-4 md:px-8 border-t border-[#E3D9C8]" id="discover">
          <div className="max-w-7xl mx-auto">
            {userRole === 'owner' || userRole === 'hostel' ? (
              <OwnerDashboard onLogout={handleSignOut} />
            ) : (
              <TenantLifecycleController 
                onLogout={handleSignOut} 
                onSwitchToOwner={async () => {
                  try {
                    const token = localStorage.getItem('Homtu_token');
                    if (token) {
                      await fetch('`${API_URL}/api/users/switch-to-owner', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  setUserRole('owner');
                  localStorage.setItem('Homtu_user_role', 'owner');
                }}
              />
            )}
          </div>
        </section>
      ) : (
        <div id="discover">
          <Listings 
            onEnquire={(property) => handleAuthRequired(property)} 
          />
        </div>
      )}



      {/* Core Differentiators Section */}
      <Features />

      {/* Pricing & Monetization */}
      <Pricing />



      {/* Footer / About Us */}
      <footer id="about" className="w-full bg-slate-950 text-slate-400 py-10 md:py-16 px-4 border-t border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12 text-left">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-bold text-white tracking-tight">
              Rent<span className="text-[#D4AF37]">Edge</span>
            </span>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              India's first fintech-powered operating system for the rental economy. Zero Brokerage. Pure credit building.
            </p>
            {/* Social Handles */}
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200" aria-label="Twitter">
                <FaXTwitter className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200" aria-label="LinkedIn">
                <FaLinkedin className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200" aria-label="GitHub">
                <FaGithub className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200" aria-label="Instagram">
                <FaInstagram className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">About Homtu</span>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Founded in 2026, Homtu is re-engineering how urban India rents homes. By combining smart lease contracts with credit bureau integrations, we eliminate security deposits and help build official credit histories.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Contact Us</span>
            <div className="flex flex-col gap-2.5">
              <a href="mailto:support@Homtu.in" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                support@Homtu.in
              </a>
              <a href="tel:+918049201827" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                +91 80 4920 1827
              </a>
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span>Indiranagar, Bengaluru, KA, India</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Legal & RBI</span>
            <span className="text-[10px] text-slate-500 leading-normal">
              Lease agreements are verified under digital contract guidelines. Credit reporting nodes operating via licensed bureaus.
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <span>&copy; {new Date().getFullYear()} Homtu Technologies Pvt Ltd. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">RBI Disclosures</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal Gate */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingProperty(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Sticky Mobile Nav Bar */}
      {!authModalOpen && <MobileNav />}
    </PageTransitionShell>
  );
}
