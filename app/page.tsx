'use client';

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import ProposalForm from '@/components/ProposalForm';
import ProposalFeed from '@/components/ProposalFeed';
import MerchantRegister from '@/components/MerchantRegister';
import MarketplaceFeed from '@/components/MarketplaceFeed';

export default function Home() {
  const [showVision, setShowVision] = useState(false);
  const [activeTab, setActiveTab] = useState<'governance' | 'marketplace'>('governance');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 sm:p-12 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* --- HERO BRANDING SECTION --- */}
      <header className="max-w-2xl text-center space-y-6 my-12">
        <span className="inline-block text-emerald-400 font-semibold tracking-wide uppercase text-xs border border-emerald-400/30 px-3 py-1 rounded-full bg-emerald-400/10 mb-2">
          NaloDAO Circular Economy 🌱
        </span>
        
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white">
          A New Economy <br />
          <span className="text-emerald-400">for Earth</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Connecting eco-conscious consumers directly with regenerative producers using fully-regulated, compliant **Circle USDC** stablecoins via the global **Stellar Network**.
        </p>

        {/* Action Controls Row */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <WalletConnect />
          
          <button 
            onClick={() => setShowVision(!showVision)}
            className={`font-medium px-6 py-3 rounded-xl border transition-all duration-200 active:scale-95 text-sm ${
              showVision 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            {showVision ? 'Hide Vision' : 'Read Vision'}
          </button>
        </div>
      </header>

      {/* --- EXPANDABLE VISION MANIFESTO PANEL --- */}
      {showVision && (
        <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl mb-12 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🌱 NaloDAO Regenerative Ecosystem Manifesto
          </h2>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed">
            <p>
              Traditional finance frameworks treat planetary harm as a hidden externality. <strong>NaloDAO</strong> internalizes earth-stewardship by linking verified ecological actions with sound, digital financial assets.
            </p>
            <p>
              By combining native compliance tracks with <strong>Circle USDC</strong>, our local producers can settle international trades in seconds, and cash out their tokenized balances into physical paper bills at any local <strong>MoneyGram</strong> retail desk worldwide.
            </p>
          </div>
        </div>
      )}

      {/* --- ECOSYSTEM NAVIGATION TABS --- */}
      <div className="flex bg-slate-900/80 p-1.5 border border-slate-800 rounded-xl mb-12 shadow-inner">
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'governance'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏛️ Voting Governance
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'marketplace'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🛒 Producer Marketplace
        </button>
      </div>

      {/* --- DYNAMIC WORKSPACE PANEL LAYOUTS --- */}
      <div className="w-full max-w-5xl border-t border-slate-900 pt-8">
        
        {/* VIEW 1: GOVERNANCE VIEW (FORM + FEED) */}
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Governance Gate</h3>
                <p className="text-xs text-slate-400">Broadcast structural protocols directly to the cloud ledger core.</p>
              </div>
              <ProposalForm />
            </div>
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Consensus Stream</h3>
                <p className="text-xs text-slate-400">Track, audit, and inspect active voting parameters in real-time.</p>
              </div>
              <ProposalFeed />
            </div>
          </div>
        )}

        {/* VIEW 2: COMPLIANT MARKETPLACE VIEW (REGISTRATION + CHECKOUT FEED) */}
        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Producer Hub</h3>
                <p className="text-xs text-slate-400">Onboard your regenerative operation and secure your public routing key.</p>
              </div>
              <MerchantRegister />
            </div>
            <div className="space-y-4">
              <div className="text-center md:text-left px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Active Supply Registry</h3>
                <p className="text-xs text-slate-400">Browse verified stewards and execute secure, peer-to-peer digital transactions.</p>
              </div>
              <MarketplaceFeed />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}