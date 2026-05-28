'use client';

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import ProposalForm from '@/components/ProposalForm';
import ProposalFeed from '@/components/ProposalFeed';
import MerchantRegister from '@/components/MerchantRegister';
import SacredMarketplace from '@/components/SacredMarketplace';
import CrowdfundPortal from '@/components/CrowdfundPortal';
import GuildBoard from '@/components/GuildBoard';

export default function Home() {
  const [showVision, setShowVision] = useState(false);
  const [activeTab, setActiveTab] = useState<'governance' | 'marketplace' | 'crowdfund' | 'guild'>('governance');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/20 text-slate-200 flex flex-col items-center p-4 sm:p-12 selection:bg-emerald-600/30 selection:text-emerald-300">
      
      {/* --- RECONSTRUCTED ECOSYSTEM NAVIGATION HEADER --- */}
      <nav className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-900 mb-12">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-serif font-bold text-lg text-white tracking-wide">NaloDAO</span>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Circular Network
          </span>
        </div>
        <WalletConnect />
      </nav>

      {/* --- INSPIRATIONAL BIOREGIONAL HERO SECTION --- */}
      <header className="max-w-3xl text-center space-y-6 my-4">
        <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
          An Honest Monetary System <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-200">
            Rooted in Earth Stewardship
          </span>
        </h1>
        
        <p className="text-md sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
          Moving beyond extractive economics. We use non-custodial digital asset infrastructure to link eco-conscious citizens directly with localized permaculture supply loops, building community wealth and ecological resilience.
        </p>

        {/* Action Controls Row */}
        <div className="flex justify-center pt-2">
          <button 
            onClick={() => setShowVision(!showVision)}
            className={`font-mono text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl border transition-all duration-200 active:scale-95 ${
              showVision 
                ? 'bg-amber-500/10 border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/5' 
                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showVision ? 'Close Manifesto' : 'Read Our Vision Manifesto'}
          </button>
        </div>
      </header>

      {/* --- WARM EXPANDABLE MANIFESTO PANEL --- */}
      {showVision && (
        <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-2xl my-8 backdrop-blur-md animate-fade-in">
          <h2 className="font-serif text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
            🌾 Sacred Economics & Permaculture System Design
          </h2>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed font-light">
            <p>
              Conventional currency is born from interest-bearing debt, forcing endless exploitation of our planet's living resources simply to keep the financial ledger afloat. This treats destruction as an economic gain.
            </p>
            <p>
              <strong>NaloDAO</strong> flips this feedback loop entirely. By integrating digital stablecoins with verified provenance mapping, we make local economic flows fully transparent. Small-scale farmers, regenerative kitchens, and clean energy hubs retain 100% of their transaction value, completely free from extractive middlemen.
            </p>
            <p className="border-t border-slate-800/60 pt-3 text-xs font-mono text-emerald-400/80 italic">
              Guided by the Three Ethics: Earth Care, People Care, and Fair Share.
            </p>
          </div>
        </div>
      )}

      {/* --- NATURAL TILED NAVIGATION TABS --- */}
      <div className="flex bg-slate-900/60 p-1.5 border border-slate-900/80 rounded-xl my-12 shadow-2xl backdrop-blur-md flex-wrap justify-center gap-1">
        {[
          { id: 'governance', label: '🏛️ Democratic Consensus' },
          { id: 'marketplace', label: '🛒 Provenance Marketplace' },
          { id: 'crowdfund', label: '🤝 Fair-Share Mutual Aid' },
          { id: 'guild', label: '🪓 Bioregional Guild Board' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-lg font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- BIOREGIONAL WORKSPACE HOUSING --- */}
      <main className="w-full max-w-5xl border-t border-slate-900/60 pt-8 mb-16">
        
        {/* VIEW 1: CONSOLIDATED DEMOCRATIC CONSENSUS */}
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="font-serif text-lg font-bold text-white">Propose Common Frameworks</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">Broadcast structural community initiatives directly to the public ledger.</p>
              </div>
              <ProposalForm />
            </div>
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="font-serif text-lg font-bold text-white">Active Consensus Stream</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">Audit, deliberate, and direct community protocol updates in real-time.</p>
              </div>
              <ProposalFeed />
            </div>
          </div>
        )}

        {/* VIEW 2: PROVENANCE MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="text-center md:text-left px-2">
                <h3 className="font-serif text-lg font-bold text-white">Register Ecosystem Stewardship</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">Onboard your regenerative business entity and verify your local routing identity.</p>
              </div>
              <MerchantRegister />
              <MoneyGramBridge />
            </div>
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="font-serif text-lg font-bold text-white">Verified Relationships Feed</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">Browse ecological supply lines and process fee-free peer-to-peer commerce.</p>
              </div>
              <SacredMarketplace />
            </div>
          </div>
        )}

        {/* VIEW 3: FAIR-SHARE MUTUAL AID PORTAL */}
        {activeTab === 'crowdfund' && (
          <div className="space-y-2">
            <div className="text-center md:text-left px-2 mb-4">
              <h3 className="font-serif text-xl font-bold text-white">Cooperative Capital Allocation</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Pool community surpluses to fund physical earth restoration and localized resilience assets.</p>
            </div>
            <CrowdfundPortal />
          </div>
        )}

        {/* VIEW 4: BIOREGIONAL GUILD LOGISTICS SYSTEM */}
        {activeTab === 'guild' && (
          <div className="space-y-2">
            <div className="text-center md:text-left px-2 mb-4">
              <h3 className="font-serif text-xl font-bold text-white">Bioregional Resource Exchange</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Prevent waste by coordinating agricultural gluts and matching local project requirements instantly.</p>
            </div>
            <GuildBoard />
          </div>
        )}

      </main>
      
      {/* --- FOOTER ATTESTATION --- */}
      <footer className="w-full max-w-5xl text-center py-6 border-t border-slate-900 font-mono text-[10px] text-slate-600 tracking-wider">
        NALODAO CIRCULAR LEDGER CORE V2 • SECURED BY STELLAR ASSET RAILS • NO BANKS, NO MIDDLEMEN, NO EXTRACTION.
      </footer>
    </div>
  );
}