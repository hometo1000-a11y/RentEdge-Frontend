'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps, AnimatePresence } from 'framer-motion';

interface MagneticButtonProps extends HTMLMotionProps<'button'> {
  range?: number; // Distance in px to trigger magnetic pull
  strength?: number; // Outer pull strength (0 to 1)
  textStrength?: number; // Inner text pull strength (0 to 1)
  variant?: 'primary' | 'secondary' | 'mint' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function MagneticButton({
  children,
  range = 75,
  strength = 0.35,
  textStrength = 0.18,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Positional coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Elite Apple-caliber weighted spring configuration
  const springConfig = { stiffness: 220, damping: 18, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Parallax translation mapping for inner content layer
  const textX = useTransform(springX, (val) => val * (textStrength / strength));
  const textY = useTransform(springY, (val) => val * (textStrength / strength));

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate stationary container center coordinates
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Offset from cursor
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);
    
    if (distance < range) {
      setIsHovered(true);
      // Smooth dynamic magnetic attraction
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    } else {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Pre-compiled design tokens mapping
  const variantClasses = {
    primary: 'bg-[#01411C] text-white border border-[#003B1F]/20',
    secondary: 'bg-slate-900 text-white border border-white/5',
    mint: 'bg-[#01411C] text-white border border-[#003B1F]/10',
    outline: 'bg-white/40 backdrop-blur-md text-slate-800 border border-slate-200/80 hover:bg-white hover:border-slate-350',
    ghost: 'bg-transparent text-slate-650 hover:bg-slate-100/60 hover:text-slate-850'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl font-bold',
    md: 'px-5 py-3 text-sm rounded-2xl font-black',
    lg: 'px-7 py-4 text-base rounded-2xl font-black',
    xl: 'px-9 py-5 text-lg rounded-3xl font-black'
  };

  const hoverShadows = {
    primary: '0 20px 30px -10px rgba(1, 65, 28, 0.35), 0 0 15px 3px rgba(1, 65, 28, 0.12)',
    secondary: '0 20px 30px -10px rgba(15, 23, 42, 0.45), 0 0 20px 5px rgba(15, 23, 42, 0.25)',
    mint: '0 20px 30px -10px rgba(1, 65, 28, 0.35), 0 0 15px 3px rgba(1, 65, 28, 0.12)',
    outline: '0 15px 25px -10px rgba(0, 0, 0, 0.12), 0 0 15px 3px rgba(0, 0, 0, 0.04)',
    ghost: 'none'
  };

  const initialShadows = {
    primary: '0 10px 15px -3px rgba(1, 65, 28, 0.15), 0 4px 6px -4px rgba(1, 65, 28, 0.15)',
    secondary: '0 10px 15px -3px rgba(15, 23, 42, 0.2), 0 4px 6px -4px rgba(15, 23, 42, 0.2)',
    mint: '0 10px 15px -3px rgba(1, 65, 28, 0.15), 0 4px 6px -4px rgba(1, 65, 28, 0.15)',
    outline: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    ghost: 'none'
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block relative"
    >
      {/* Background glow pulse halo */}
      <AnimatePresence>
        {isHovered && variant === 'primary' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1.25 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 bg-brand-primary/20 rounded-2xl filter blur-[16px] -z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.button
        animate={{
          scale: isHovered ? 1.05 : 1,
          boxShadow: isHovered ? hoverShadows[variant] : initialShadows[variant],
        }}
        style={{ x: springX, y: springY }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className={`relative select-none flex items-center justify-center cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {/* Glinting sheen hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -skew-x-12"
          animate={isHovered ? { x: ['-100%', '100%'] } : { x: '-100%' }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
        />
        
        {/* Parallax inner content wrapper */}
        <motion.span 
          style={{ x: textX, y: textY }} 
          className="relative z-10 flex items-center justify-center gap-2 pointer-events-none"
        >
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
}
