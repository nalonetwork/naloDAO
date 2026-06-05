'use client';

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import ProposalForm from '@/components/ProposalForm';
import ProposalFeed from '@/components/ProposalFeed';
import MerchantRegister from '@/components/MerchantRegister';
import SacredMarketplace from '@/components/SacredMarketplace';
import CrowdfundPortal from '@/components/CrowdfundPortal';
import GuildBoard from '@/components/GuildBoard';
import MoneyGramBridge from '@/components/MoneyGramBridge';
import StewardshipLeaderboard from '@/components/StewardshipLeaderboard';
import BioregionalStatsBar from '@/components/BioregionalStatsBar';
import PermacultureEngine from '../components/PermacultureEngine';

export default function Home() {
  const [showVision, setShowVision] = useState(false);
  const [activeTab, setActiveTab] = useState<'governance' | 'marketplace' | 'crowdfund' | 'guild' | 'permaculture'>('governance');

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* --- PREMIUM NAVIGATION BAR --- */}
      <nav className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/60 mb-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-purple-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <span className="text-sm">🌱</span>
          </div>
          <div className="text-left">
            <span className="font-sans font-black text-xl text-white tracking-tight block">Nalo<span className="text-emerald-400">DAO</span></span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block -mt-0.5">Circular Network</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-3xl text-center space-y-6 my-6">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
          An Honest Monetary System <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400">
            Rooted in Earth Stewardship
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-light">
          Moving beyond extractive economics. We integrate non-custodial digital asset networks to anchor local permaculture supply loops directly onto high-speed liquidity rails.
        </p>

        <div className="flex justify-center pt-2">
          <button 
            onClick={() => setShowVision(!showVision)}
            className="font-mono text-[10px] uppercase tracking-widest font-bold px-6 py-3 rounded-md border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700 text-slate-300 transition duration-150 relative overflow-hidden group"
          >
            <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-emerald-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            {showVision ? 'Close Manifesto' : 'Read Our Vision Manifesto'}
          </button>
        </div>
      </header>

      <BioregionalStatsBar />

      {/* --- EXPANDABLE MANIFESTO PANEL --- */}
      {showVision && (
        <div className="w-full max-w-2xl bg-slate-950/60 border border-slate-800/80 p-6 rounded-xl shadow-2xl my-6 backdrop-blur-md text-left animate-fade-in relative">
          <div className="absolute top-0 left-0 w-[2px] h-10 bg-gradient-to-b from-emerald-400 to-transparent" />
          <h2 className="font-sans text-md font-bold uppercase tracking-wider text-amber-200 mb-3 flex items-center gap-2">
            🌾 Sacred Economics & Permaculture Architecture
          </h2>
          <div className="text-xs sm:text-sm text-slate-400 space-y-3 leading-relaxed font-light">
            <p>
              Conventional currency forces endless exploitation of living resources to support debt ledgers. <strong>NaloDAO</strong> flips this loop. Small-scale producers, regenerative kitchens, and clean energy nodes retain 100% of their baseline output value, completely free from systemic middlemen.
            </p>
            <p className="border-t border-slate-900 pt-2.5 text-[10px] font-mono text-emerald-400/80 italic tracking-wide">
              System Rules: Earth Care, People Care, and Fair Share.
            </p>
          </div>
        </div>
      )}

      {/* --- SOLANA-STYLE CAPSULE NAVIGATION TABS --- */}
      <div className="flex bg-slate-950/60 p-1 border border-slate-800/60 rounded-xl my-8 shadow-2xl backdrop-blur-md w-full max-w-4xl overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'governance', label: '🏛️ Consensus Frameworks' },
          { id: 'marketplace', label: '🛒 Provenance Registry' },
          { id: 'permaculture', label: '🌿 Design Engine' }, 
          { id: 'crowdfund', label: '🤝 Mutual Aid Vectors' },
          { id: 'guild', label: '🪓 Guild Board' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest font-mono transition-all duration-150 shrink-0 text-center flex-1 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500/10 to-purple-500/10 text-emerald-400 border border-emerald-500/30 font-black shadow-inner shadow-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- ACTIVE CONTENT GRID PANEL CONTAINER --- */}
      <main className="w-full border-t border-slate-900 pt-8 mb-12">
        
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="text-left px-1">
                <h3 className="font-sans text-md font-bold uppercase tracking-wider text-white">Propose Common Frameworks</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Broadcast structural initiatives directly to the public ledger.</p>
              </div>
              <ProposalForm />
              <StewardshipLeaderboard />
            </div>
            <div className="space-y-4">
              <div className="text-left px-1">
                <h3 className="font-sans text-md font-bold uppercase tracking-wider text-white">Active Consensus Stream</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Audit, deliberate, and direct protocol updates in real-time.</p>
              </div>
              <ProposalFeed />
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="text-left px-1">
                <h3 className="font-sans text-md font-bold uppercase tracking-wider text-white">Register Ecosystem Stewardship</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Onboard your entity and verify your local cryptographic routing identity.</p>
              </div>
              <MerchantRegister />
              <MoneyGramBridge />
            </div>
            <div className="space-y-4">
              <div className="text-left px-1">
                <h3 className="font-sans text-md font-bold uppercase tracking-wider text-white">Verified Relationships Feed</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Browse ecological supply lines and process fee-free commerce loops.</p>
              </div>
              <SacredMarketplace />
            </div>
          </div>
        )}

        {activeTab === 'permaculture' && (
          <PermacultureEngine />
        )}

        {activeTab === 'crowdfund' && (
          <div className="space-y-4">
            <div className="text-left px-1 mb-2">
              <h3 className="font-sans text-lg font-bold uppercase tracking-wider text-white">Cooperative Capital Allocation</h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Pool assets to fund active physical earth restoration projects.</p>
            </div>
            <CrowdfundPortal />
          </div>
        )}

        {activeTab === 'guild' && (
          <div className="space-y-4">
            <div className="text-left px-1 mb-2">
              <h3 className="font-sans text-lg font-bold uppercase tracking-wider text-white">Bioregional Resource Exchange</h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Prevent structural waste by matching agricultural surpluses instantly.</p>
            </div>
            <GuildBoard />
          </div>
        )}

      </main>
      
      <footer className="w-full text-center py-6 border-t border-slate-900 font-mono text-[9px] text-slate-600 tracking-widest uppercase">
        NALODAO CIRCULAR LEDGER CORE V2 • SECURED BY STELLAR ASSET RAILS • NO BANKS, NO MIDDLEMEN.
      </footer>
    </div>
  );
}