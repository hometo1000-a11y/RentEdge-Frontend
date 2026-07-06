'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, mockProperties } from './propertiesData';
import { api } from './api';
import TenantShell, { TenantView } from './TenantShell';
import Listings from './Listings';
import MyProperties from './MyProperties';
import MyDocuments from './MyDocuments';
import ProfileSettings from './ProfileSettings';



export type TenantLifecycleState = 
  | 'BROWSING';

interface TenantLifecycleControllerProps {
  onLogout?: () => void;
  onSwitchToOwner?: () => void;
}

export default function TenantLifecycleController({ onLogout, onSwitchToOwner }: TenantLifecycleControllerProps) {
  const [state, setState] = useState<TenantLifecycleState>('BROWSING');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Browsing States
  const [tenantView, setTenantView] = useState<TenantView>('listings');



  // Persist state transitions
  const setLifecycleState = (newState: TenantLifecycleState) => {
    setState(newState);
    localStorage.setItem('Homtu_lifecycle_state', newState);
  };

  const selectProperty = (property: Property | null) => {
    setSelectedProperty(property);
    if (property) {
      localStorage.setItem('Homtu_selected_property_id', property.id);
    } else {
      localStorage.removeItem('Homtu_selected_property_id');
    }
  };

  // Sync state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('Homtu_lifecycle_state');
    const savedPropId = localStorage.getItem('Homtu_selected_property_id');
    
    // Only restore if it's a valid state, otherwise reset to BROWSING
    if (savedState === 'BROWSING') {
      setState('BROWSING');
    } else {
      // Clear any stale/invalid states from previous versions
      localStorage.setItem('Homtu_lifecycle_state', 'BROWSING');
      setState('BROWSING');
    }
    if (savedPropId) {
      api.getProperty(savedPropId)
        .then(found => {
          setSelectedProperty(found);
        })
        .catch(() => {
          const found = mockProperties.find(p => p.id === savedPropId);
          if (found) {
            setSelectedProperty(found);
          }
        });
    }
  }, []);

  const handleResetToBrowsing = () => {
    setLifecycleState('BROWSING');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#06130C] dark:text-slate-100">

      <AnimatePresence mode="wait">
        {/* ================= STATE 1: BROWSING — TenantShell ================= */}
        {state === 'BROWSING' && (
          <motion.div
            key="browsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <TenantShell
              activeView={tenantView}
              onViewChange={setTenantView}
              onLogout={onLogout}
              onSwitchToOwner={onSwitchToOwner}
            >
              <AnimatePresence mode="wait">
                {tenantView === 'listings' ? (
                  <motion.div
                    key="listings"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Listings />
                  </motion.div>
                ) : tenantView === 'my-properties' ? (
                  <motion.div
                    key="my-properties"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MyProperties onPropertySelect={(property) => {
                      selectProperty(property);
                    }} />
                  </motion.div>
                ) : tenantView === 'my-documents' ? (
                  <motion.div
                    key="my-documents"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MyDocuments />
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProfileSettings />
                  </motion.div>
                )}
              </AnimatePresence>
            </TenantShell>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
