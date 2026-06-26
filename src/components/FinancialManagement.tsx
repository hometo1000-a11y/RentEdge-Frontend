'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  DollarSign,
  Building
} from 'lucide-react';

interface Transaction {
  id: string;
  tenant: string;
  type: 'Rent' | 'Deposit' | 'Payout';
  amount: number;
  date: string;
  status: 'Cleared' | 'Held in Escrow' | 'Settling';
  method: string;
}

export default function FinancialManagement() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [heldEscrow, setHeldEscrow] = useState<number>(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const handleWithdraw = () => {
    if (walletBalance <= 0) return;
    
    setIsWithdrawing(true);
    
    setTimeout(() => {
      setIsWithdrawing(false);
      setWalletBalance(0);
      setWithdrawalSuccess(true);
      
      // Add payout transaction to list
      const newTx: Transaction = {
        id: `tx- payout-${Date.now()}`,
        tenant: 'Self (Settlement)',
        type: 'Payout',
        amount: 25000,
        date: 'Today',
        status: 'Cleared',
        method: 'IMPS Bank Transfer'
      };
      
      setTransactions(prev => [newTx, ...prev]);
    }, 25000 / 10000 > 2 ? 2200 : 2200); // simulated processing time
  };

  const handleDownloadReport = (reportType: string) => {
    setDownloadingReport(reportType);
    setTimeout(() => {
      setDownloadingReport(null);
      alert(`RentEdge Financial Report (${reportType}) compiled and saved to downloads.`);
    }, 1800);
  };

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-lg text-left relative">
      
      {/* Dynamic Payout Settlement Success Banner */}
      <AnimatePresence>
        {withdrawalSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Settlement Complete</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  ₹25,000 has been routed via IMPS to your registered Bank (HDFC Bank ending in *9827).
                </p>
              </div>
            </div>
            <button
              onClick={() => setWithdrawalSuccess(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Balances & Withdrawal Control */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4.5 h-4.5 text-[#7C3AED]" />
              Financial OS Center
            </h3>
            <p className="text-[10px] text-slate-450 font-bold mt-1">
              Verify payouts, monitor security escrows, and claim settled balances.
            </p>
          </div>

          {/* Cleared Funds Balance Panel */}
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-4">
            <div>
              <span className="block text-[9.5px] uppercase font-bold text-slate-400">Available to Settle</span>
              <span className="text-3xl font-black text-slate-950 font-mono tracking-tight mt-1 block">
                ₹{walletBalance.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Withdrawal Trigger */}
            <button
              disabled={walletBalance <= 0 || isWithdrawing}
              onClick={handleWithdraw}
              className={`w-full py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                walletBalance > 0 && !isWithdrawing
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isWithdrawing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Routing to Bank...
                </>
              ) : walletBalance > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Instant Settlement to Bank
                </>
              ) : (
                'All Funds Settled'
              )}
            </button>
          </div>

          {/* Security Deposit Escrow registry */}
          <div className="border border-slate-150 rounded-2xl p-4 flex justify-between items-center gap-3">
            <div>
              <span className="block text-[8.5px] uppercase font-black text-slate-400">Held in Security Escrow</span>
              <span className="text-lg font-black text-indigo-650 font-mono block mt-0.5">
                ₹{heldEscrow.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 text-indigo-650 text-[10px] font-black uppercase">
              Locked Safe Node
            </div>
          </div>

          {/* Download Statements Widget */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Reports &amp; Statements</h4>
            
            <button
              onClick={() => handleDownloadReport('FY26 Annual Ledger')}
              disabled={downloadingReport !== null}
              className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <Download className="w-3.5 h-3.5 text-slate-450" />
                FY26 Annual Ledger
              </span>
              {downloadingReport === 'FY26 Annual Ledger' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-450" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            
            <button
              onClick={() => handleDownloadReport('Q1 Rent Certificate')}
              disabled={downloadingReport !== null}
              className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <Download className="w-3.5 h-3.5 text-slate-450" />
                Q1 Rent Certificate
              </span>
              {downloadingReport === 'Q1 Rent Certificate' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-450" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Transaction Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Transaction History
            </h4>
          </div>

          <div className="overflow-hidden border border-slate-150 rounded-2xl bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-400">
                    <th className="p-3.5 font-extrabold">Details</th>
                    <th className="p-3.5 font-extrabold">Type</th>
                    <th className="p-3.5 font-extrabold">Channel</th>
                    <th className="p-3.5 font-extrabold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/20 font-semibold">
                        <td className="p-3.5 space-y-0.5">
                          <span className="block text-slate-900 font-extrabold">{tx.tenant}</span>
                          <span className="block text-[9.5px] text-slate-400 font-bold">{tx.date}</span>
                        </td>
                        <td className="p-3.5">
                          {tx.type === 'Rent' && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-[#10B981] px-1.5 py-0.5 rounded font-black border border-emerald-100 uppercase">
                              Rent Collected
                            </span>
                          )}
                          {tx.type === 'Deposit' && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-indigo-50 text-[#7C3AED] px-1.5 py-0.5 rounded font-black border border-indigo-100 uppercase">
                              Escrow Lock
                            </span>
                          )}
                          {tx.type === 'Payout' && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black border border-slate-200 uppercase">
                              Bank Settled
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                          {tx.method}
                        </td>
                        <td className={`p-3.5 text-right font-mono font-black text-xs ${
                          tx.type === 'Payout' ? 'text-slate-600' : 'text-[#10B981]'
                        }`}>
                          {tx.type === 'Payout' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-450 font-bold">
                        No payment history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
