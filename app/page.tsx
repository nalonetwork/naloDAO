'use client';

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import ProposalForm from '@/components/ProposalForm';
import ProposalFeed from '@/components/ProposalFeed';

export default function Home() {
  const [showVision, setShowVision] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 sm:p-12 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* --- HERO SECTION --- */}
      <header className="max-w-2xl text-center space-y-6 my-12 animate-fade-in">
        {/* 🌱 Badge */}
        <span className="inline-block text-emerald-400 font-semibold tracking-wide uppercase text-xs border border-emerald-400/30 px-3 py-1 rounded-full bg-emerald-400/10 mb-2">
          NaloDAO x Stellar 🌱
        </span>
        
        {/* Main Hero Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white">
          A New Economy <br />
          <span className="text-emerald-400">for Earth</span>
        </h1>
        
        {/* Core Vision Description */}
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Building a decentralized, Web3-native platform where regenerative activities are tracked, rewarded, and governed natively on the low-emission **Stellar Network**.
        </p>

        {/* Dynamic Action Buttons Row */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          {/* Our stellar connector module */}
          <WalletConnect />
          
          {/* Interactive Read Vision Toggle Button */}
          <button 
            onClick={() => setShowVision(!showVision)}
            className={`font-medium px-6 py-3 rounded-xl border transition-all duration-200 active:scale-95 ${
              showVision 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            {showVision ? 'Hide Vision' : 'Read Vision'}
          </button>
        </div>
      </header>

      {/* --- EXPANDABLE VISION PANEL --- */}
      {showVision && (
        <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl mb-12 backdrop-blur-sm animate-slide-down">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🌱 NaloDAO Regenerative Ecosystem Manifesto
          </h2>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed font-normal">
            <p>
              Traditional financial systems view ecology as an externality. 
              <strong> NaloDAO</strong> is engineered to internalize planetary care by converting verified environmental impact metrics into decentralized cryptographic primitives.
            </p>
            <p>
              Leveraging the speed and ultra-low carbon footprint of the 
              <span className="text-emerald-400"> Stellar Network</span>, we facilitate consensus pools that fund sustainable agricultural design arrays, carbon capture zones, and bio-regional protection sectors directly through on-chain capital coordination.
            </p>
            <div className="border-l-2 border-emerald-500/30 pl-4 py-1 my-2 italic text-xs text-slate-300">
              "We don't inherit the Earth from our ancestors; we borrow it from our children. Our goal is to make planetary stewardship profitable."
            </div>
          </div>
        </div>
      )}

      {/* --- CORE GOVERNANCE WORKSPACE --- */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-t border-slate-900 pt-12 mt-4">
        {/* Left Side: Creation Engine Form */}
        <div className="space-y-4">
          <div className="text-center md:text-left px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Governance Gate</h3>
            <p className="text-xs text-slate-400">Broadcast structural protocols directly to the cloud ledger core.</p>
          </div>
          <ProposalForm />
        </div>

        {/* Right Side: Read Stream Feed */}
        <div className="space-y-4">
          <div className="text-center md:text-left px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Consensus Stream</h3>
            <p className="text-xs text-slate-400">Track, audit, and inspect active voting parameters in real-time.</p>
          </div>
          <ProposalFeed />
        </div>
      </main>

    </div>
  );
}