'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransitionShell({ children, className = '' }: PageTransitionShellProps) {
  
  // Apple/Stripe-caliber spring transitions for Native-feeling pages
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 12,
      scale: 0.992
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 150,
        damping: 18,
        mass: 0.7,
        staggerChildren: 0.06,
        delayChildren: 0.04
      }
    },
    exit: {
      opacity: 0,
      y: -12,
      scale: 0.992,
      transition: {
        duration: 0.2,
        ease: [0.32, 0, 0.67, 0] as const // Ease-in native exit curve
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
