'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  X,
} from 'lucide-react';

type DocCategory = 'all' | 'agreements' | 'receipts' | 'kyc';

interface Document {
  id: string;
  title: string;
  category: 'agreements' | 'receipts' | 'kyc';
  date: string;
  status: 'verified' | 'pending' | 'expired';
  size: string;
  property?: string;
}

const MOCK_DOCUMENTS: Document[] = [];

const CATEGORY_TABS: { id: DocCategory; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '📂' },
  { id: 'agreements', label: 'Agreements', emoji: '📄' },
  { id: 'receipts', label: 'Receipts', emoji: '🧾' },
  { id: 'kyc', label: 'KYC & ID', emoji: '🛡️' },
];

const statusConfig = {
  verified: {
    label: 'Verified',
    bgClass: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    bgClass: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
    dotClass: 'bg-amber-500',
    icon: Clock,
  },
  expired: {
    label: 'Expired',
    bgClass: 'bg-red-50 text-red-500 border-red-100 dark:bg-red-950/30 dark:text-red-450 dark:border-red-800/50',
    dotClass: 'bg-red-400',
    icon: Clock,
  },
};

const categoryIcon: Record<string, string> = {
  agreements: '📄',
  receipts: '🧾',
  kyc: '🛡️',
};

// Category → accent color for the icon bg
const categoryAccent: Record<string, string> = {
  agreements: 'bg-violet-50 border-violet-100 dark:bg-violet-950/35 dark:border-violet-800/50',
  receipts: 'bg-sky-50 border-sky-100 dark:bg-sky-950/35 dark:border-sky-800/50',
  kyc: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/35 dark:border-emerald-800/50',
};

export default function MyDocuments() {
  const [activeCategory, setActiveCategory] = useState<DocCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredDocs = MOCK_DOCUMENTS.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.property?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const countFor = (cat: DocCategory) =>
    cat === 'all'
      ? MOCK_DOCUMENTS.length
      : MOCK_DOCUMENTS.filter((d) => d.category === cat).length;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-0 overflow-x-hidden">

      {/* ── Sticky Header Block ─────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[var(--background)] pt-4 pb-2 px-4">

        {/* Page heading — compact on mobile */}
        <div className="mb-3">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            My Documents
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Agreements, receipts & KYC — all in one place.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            id="doc-search"
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category tabs — horizontal scroll, no wrap */}
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
          role="tablist"
          aria-label="Document categories"
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            const count = countFor(tab.id);
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(tab.id)}
                className={`
                  relative flex items-center gap-1.5 h-9 px-3.5 rounded-full
                  text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer
                  transition-all select-none
                  ${isActive
                    ? 'bg-brand-purple text-white shadow-md shadow-purple-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }
                `}
              >
                <span className="text-[13px] leading-none">{tab.emoji}</span>
                {tab.label}
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                    rounded-full text-[10px] font-black
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
      </div>

      {/* ── Document List ────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredDocs.length > 0 ? (
            <div className="space-y-2">
              {filteredDocs.map((doc, idx) => {
                const statusInfo = statusConfig[doc.status];
                const isVerified = doc.status === 'verified';

                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.025, duration: 0.18 }}
                    className="w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-800/80 active:scale-[0.99] transition-all group"
                  >
                    {/* ─ Card body ─ */}
                    <div className="flex items-center gap-3 px-3.5 py-3">

                      {/* Icon */}
                      <div
                        className={`
                          w-10 h-10 rounded-xl border flex items-center justify-center
                          text-base shrink-0 select-none
                          ${categoryAccent[doc.category]}
                        `}
                      >
                        {categoryIcon[doc.category]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1 — title + status badge */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-[13px] leading-snug line-clamp-2 flex-1 min-w-0 pr-1">
                            {doc.title}
                          </h3>

                          {/* Status pill ─ */}
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-0.5
                              rounded-full text-[9px] font-black uppercase tracking-wider
                              border shrink-0 mt-0.5
                              ${statusInfo.bgClass}
                            `}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Row 2 — meta info */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {doc.date}
                          </span>
                          {doc.property && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{doc.property.split('–')[0].trim()}</span>
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            {doc.size}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ─ Action strip — only when verified ─ */}
                    {isVerified && (
                      <div className="w-full min-w-0 flex border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          className="
                            w-1/2 min-w-0 flex items-center justify-center gap-1.5
                            h-11 text-xs font-bold text-slate-500 dark:text-slate-400
                            hover:text-brand-purple hover:bg-purple-50
                            dark:hover:text-brand-purple dark:hover:bg-brand-purple/10
                            active:bg-purple-100 dark:active:bg-brand-purple/20 cursor-pointer
                            border-r border-slate-100 dark:border-slate-800/80 transition-colors
                          "
                          aria-label={`Preview ${doc.title}`}
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="truncate">Preview</span>
                        </button>
                        <button
                          className="
                            w-1/2 min-w-0 flex items-center justify-center gap-1.5
                            h-11 text-xs font-bold text-slate-500 dark:text-slate-400
                            hover:text-emerald-600 hover:bg-emerald-50
                            dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20
                            active:bg-emerald-100 dark:active:bg-emerald-950/30 cursor-pointer
                            transition-colors
                          "
                          aria-label={`Download ${doc.title}`}
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          <span className="truncate">Download</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No documents uploaded</h3>
              <p className="text-xs text-slate-400 font-medium mt-1 max-w-[200px]">
                No files have been added to your profile yet.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 h-9 px-4 rounded-full text-xs font-bold bg-brand-purple text-white cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {filteredDocs.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            All documents encrypted &amp; stored securely
          </div>
        )}
      </div>
    </div>
  );
}
