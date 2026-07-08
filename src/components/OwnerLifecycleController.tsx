'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import OwnerDashboard from './OwnerDashboard';
import { api } from './api';

interface OwnerLifecycleControllerProps {
  onLogout: () => void;
  onSwitchToTenant?: () => void;
}

export default function OwnerLifecycleController({ onLogout, onSwitchToTenant }: OwnerLifecycleControllerProps) {
  const [loading, setLoading] = useState(true);
  const [ownerState, setOwnerState] = useState({
    hasCompletedOnboarding: false,
    paymentDetailsCompleted: false
  });
  const [setupForm, setSetupForm] = useState({
    accountHolderName: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    hydrateOwnerState();
  }, []);

  const hydrateOwnerState = async () => {
    try {
      const user = await api.getMe();
      localStorage.setItem('Homtu_onboarding_completed', String(Boolean(user.has_completed_onboarding)));
      localStorage.setItem('Homtu_payment_details_completed', String(Boolean(user.payment_details_completed)));
      setOwnerState({
        hasCompletedOnboarding: Boolean(user.has_completed_onboarding),
        paymentDetailsCompleted: Boolean(user.payment_details_completed)
      });
    } catch (err) {
      console.error('Failed to fetch owner onboarding state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (setupForm.bankAccountNumber !== setupForm.confirmAccountNumber) {
      setSetupError('Bank account numbers do not match.');
      return;
    }

    setSetupLoading(true);
    try {
      const token = localStorage.getItem('Homtu_token');
      const res = await fetch('https://api.homtu.in/api/users/payment-info', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          accountHolderName: setupForm.accountHolderName,
          bankAccountNumber: setupForm.bankAccountNumber,
          ifscCode: setupForm.ifscCode,
          upiId: setupForm.upiId
        })
      });

      if (res.ok) {
        localStorage.setItem('Homtu_payment_details_completed', 'true');
        setOwnerState(prev => ({ ...prev, paymentDetailsCompleted: true }));
      } else {
        const data = await res.json();
        setSetupError(data.message || 'Failed to save payment details.');
      }
    } catch (err) {
      setSetupError('Server error occurred.');
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EE] dark:bg-[#06130C]">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <OwnerDashboard
      onLogout={onLogout}
      onSwitchToTenant={onSwitchToTenant}
      hasCompletedOnboarding={ownerState.hasCompletedOnboarding}
      onMarkOnboardingComplete={async () => {
        setOwnerState(prev => ({ ...prev, hasCompletedOnboarding: true }));
        await fetch('https://api.homtu.in/api/users/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('Homtu_token') || ''}`
          },
          body: JSON.stringify({ hasCompletedOnboarding: true })
        }).catch(() => {});
      }}
    />
  );
}
