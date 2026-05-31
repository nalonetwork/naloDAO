'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Merchant {
  id: string | number;
  business_name: string;
  category: string;
  description: string;
  owner_wallet: string;
  city: string;
  country_code: string;
  image_url?: string; // ◄── Added the explicit image property tracking field
  logo_url?: string;
  banner_url?: string;
  detailed_bio?: string;
  physical_address?: string;
  contact_email?: string;
}

interface SupplyLine {
  buyer_wallet: string;
  supplier_wallet: string;
  relationship_details: string;
  verified_ethic: string;
}

export default function SacredMarketplace() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [supplyLines, setSupplyLines] = useState<SupplyLine[]>([]);
  const [checkoutAmounts, setCheckoutAmounts] = useState<{ [key: string]: string }>({});
  const [selectedEthicFilter, setSelectedEthicFilter] = useState<string>('All');
  const [activeProfileId, setActiveProfileId] = useState<string | number | null>(null);

  const loadEcosystemData = async () => {
    const [merchantRes, supplyRes] = await Promise.all([
      supabase.from('merchants').select('*'),
      supabase.from('supply_lines').select('*')
    ]);
    setMerchants(merchantRes.data || []);
    setSupplyLines(supplyRes.data || []);
  };

  useEffect(() => {
    loadEcosystemData();
  }, []);

  const handleSacredPayment = async (merchantWallet: string, id: string, customAmount?: string) => {
    const amount = customAmount || checkoutAmounts[id];
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount to transfer.");
      return;
    }

    try {
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const userAddress = await KitClass.getAddress();
      const derivedUserWallet = typeof userAddress === 'string' ? userAddress : userAddress[0]?.address || userAddress.address;

      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(derivedUserWallet);

      const USDC_ASSET = new stellarSdk.Asset(
        "USDC",
        "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT"
      );

      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({
          destination: merchantWallet,
          asset: USDC_ASSET,
          amount: amount
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      const submitTx = stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC);
      await server.submitTransaction(submitTx);

      alert(`🎉 Transaction complete! Settle loop finalized directly with zero extraction fees.`);
      setCheckoutAmounts(prev => ({ ...prev, [id]: '' }));
    } catch (err: any) {
      console.error(err);
      alert(`Payment Interrupted: ${err?.message || "Check network connections."}`);
    }
  };

  const currentProfile = merchants.find(m => m.id === activeProfileId);

  // --- DYNAMIC PROFILE VIEW ---
  if (activeProfileId && currentProfile) {
    const profileConnections = supplyLines.filter(line => line.buyer_wallet === currentProfile.owner_wallet);

    return (
      <div className="w-full max-w-4xl mx-auto bg-slate-950/60 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md mt-4 animate-fade-in">
        
        {/* Banner */}
        <div className="h-48 sm:h-64 w-full relative bg-slate-900">
          <img 
            src={currentProfile.banner_url || currentProfile.image_url || 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=80'} 
            alt="Registry Node Banner"
            className="w-full h-full object-cover opacity-50"
          />
          <button 
            onClick={() => setActiveProfileId(null)}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-white transition z-20"
          >
            ← Back to Network
          </button>
        </div>

        {/* Profile Content Container */}
        <div className="p-4 sm:p-8 relative -mt-16 space-y-8">
          
          {/* Brand Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img 
                src={currentProfile.logo_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'} 
                alt="Brand Logo" 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-950 bg-slate-900 shadow-xl relative z-10"
              />
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">{currentProfile.business_name}</h1>
                <p className="text-[11px] font-mono text-slate-500 mt-2 break-all max-w-xs sm:max-w-xl">
                  Node Handle: {currentProfile.owner_wallet}
                </p>
              </div>
            </div>
            <span className="text-[10px] tracking-wider uppercase font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto sm:mb-2">
              {currentProfile.category}
            </span>
          </div>

          <hr className="border-slate-800/60" />

          {/* MAIN BIOGRAPHY & PROVENANCE LOOPS */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">Stewardship Metrology Statement</h3>
              <p className="text-base text-slate-300 leading-relaxed text-left whitespace-pre-line font-serif italic max-w-3xl">
                {currentProfile.detailed_bio || currentProfile.description}
              </p>
            </div>

            {/* Provenance Connections Loop */}
            {profileConnections.length > 0 && (
              <div className="bg-slate-900/20 border border-slate-800/40 p-5 rounded-2xl space-y-3 max-w-3xl">
                <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Verified Ecological Provenance Loop:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profileConnections.map((line: any, idx: number) => {
                    const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                    return (
                      <div key={idx} className="flex items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 text-xs text-left">
                        <div className="text-slate-300 truncate">
                          <span className="text-emerald-400 mr-2">↳</span>
                          <span>Inputs:</span>
                          <strong 
                            className="text-white ml-1 underline cursor-pointer hover:text-emerald-400"
                            onClick={() => supplier && setActiveProfileId(supplier.id)}
                          >
                            {supplier ? supplier.business_name : 'Registry Partner'}
                          </strong>
                        </div>
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                          {line.verified_ethic}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC COMPONENT: PERFECT HORIZONTAL STACK ACROSS ALL SCREEN SIZES */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden w-full">
            
            {/* Top Header Row */}
            <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/60 flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-500">
              <span className="uppercase tracking-[0.15em] text-emerald-400 font-black">Secure Settlement Core</span>
              <span className="font-serif italic text-slate-400 hidden sm:inline">Non-custodial infrastructure loop via Stellar Asset Bridge</span>
            </div>

            {/* Unified Vertical Form Flow Area */}
            <div className="p-6 space-y-6">
              
              {/* Row 1: Flat Information Display Table Metrics */}
              <div className="space-y-3 font-mono text-xs text-slate-400 bg-slate-950/40 border border-slate-800/50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span>Allocation Category:</span>
                  <span className="text-white font-bold tracking-wide">{currentProfile.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Stellar Target Handle:</span>
                  <span className="text-white font-mono font-bold tracking-tight break-all pl-4 text-right">
                    {currentProfile.owner_wallet}
                  </span>
                </div>
              </div>

              <hr className="border-slate-800/40" />

              {/* Row 2: Broad Label + Massive Input Field Container */}
              <div className="space-y-2">
                <label htmlFor={`profile-pay-${currentProfile.id}`} className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold px-1 text-left">
                  Enter Transfer Amount
                </label>
                <div className="flex items-center bg-slate-950 px-5 py-4 rounded-xl border border-slate-800 focus-within:border-emerald-500/60 transition h-14">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    id={`profile-pay-${currentProfile.id}`}
                    value={checkoutAmounts[currentProfile.id] || ''}
                    onChange={e => setCheckoutAmounts(prev => ({ ...prev, [currentProfile.id]: e.target.value }))}
                    className="w-full bg-transparent text-white text-xl font-mono focus:outline-none placeholder-slate-800"
                  />
                  <span className="text-xs font-mono font-black text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg ml-2 select-none shrink-0">
                    USDC
                  </span>
                </div>
              </div>

              {/* Row 3: Wide Layout Submission Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleSacredPayment(currentProfile.owner_wallet, currentProfile.id.toString(), checkoutAmounts[currentProfile.id])}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition duration-200 shadow-lg shadow-emerald-500/10 tracking-[0.2em]"
                >
                  Authorize & Pay
                </button>
              </div>

            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-2 text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-800/40 text-left">
            <span>Registry Location: {currentProfile.physical_address || 'Bioregional Zone 1'}</span>
            <span>Contact Core: {currentProfile.contact_email || 'steward@nalo.network'}</span>
            <span>Region Flag: {currentProfile.city}, {currentProfile.country_code}</span>
          </div>

        </div>
      </div>
    );
  }

  // --- STANDARD GRID CATALOG VIEW ---
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-4">
      {/* Ethic Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-left">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Regenerative Commerce Network</h3>
          <p className="text-xs text-slate-400">Auditing asset flows through the lens of Sacred Economics.</p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          {['All', 'Earth Care', 'People Care', 'Fair Share'].map((ethic) => (
            <button
              key={ethic}
              onClick={() => setSelectedEthicFilter(ethic)}
              className={`px-2 py-1 rounded transition ${
                selectedEthicFilter === ethic ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {ethic}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Interconnected Producers */}
      <div className="grid grid-cols-1 gap-6">
        {merchants.map((merchant) => {
          const activeConnections = supplyLines.filter(line => line.buyer_wallet === merchant.owner_wallet);
          
          if (selectedEthicFilter !== 'All' && !activeConnections.some(c => c.verified_ethic === selectedEthicFilter)) {
            return null;
          }

          return (
            <div key={merchant.id} className="bg-slate-900/40 border border-slate-800/60 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm hover:border-slate-700/80 transition duration-200 group flex flex-col">
              
              {/* Vibrant Merchant Cover Photo Segment */}
              <div className="h-44 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800/40">
                {merchant.image_url ? (
                  <img 
                    src={merchant.image_url} 
                    alt={merchant.business_name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-in-out opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950/40 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-[10px]">
                    🌾 No Custom Image Registered
                  </div>
                )}
                
                {/* Floating Category Badge Overlay */}
                <span className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800/60 text-[9px] font-mono uppercase font-bold tracking-widest text-emerald-400 px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md">
                  {merchant.category}
                </span>
              </div>

              {/* Core Context Card Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                
                {/* Identity & Bio */}
                <div className="flex justify-between items-start gap-4 text-left">
                  <div className="flex gap-4">
                    <img 
                      src={merchant.logo_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'} 
                      alt="Logo" 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800/80 bg-slate-950 shrink-0 shadow-lg relative -mt-10 z-10 bg-slate-900"
                    />
                    <div>
                      <h4 
                        onClick={() => setActiveProfileId(merchant.id)}
                        className="text-md font-bold text-white hover:text-emerald-400 cursor-pointer transition underline decoration-transparent hover:decoration-emerald-500/40 underline-offset-4"
                      >
                        {merchant.business_name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-light leading-relaxed">{merchant.description}</p>
                    </div>
                  </div>

                  {/* Direct Checkout Panel Embedded Controls */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-950 p-1.5 rounded-xl border border-slate-800/60 shadow-inner">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={checkoutAmounts[merchant.id] || ''}
                      onChange={e => setCheckoutAmounts(prev => ({ ...prev, [merchant.id]: e.target.value }))}
                      className="w-14 bg-transparent text-white text-xs font-mono text-right focus:outline-none placeholder-slate-800 pr-1"
                    />
                    <span className="text-[9px] font-mono text-slate-600 font-bold select-none">USDC</span>
                    <button
                      onClick={() => handleSacredPayment(merchant.owner_wallet, merchant.id.toString())}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg transition active:scale-95 uppercase tracking-wider"
                    >
                      Pay
                    </button>
                  </div>
                </div>

                {/* Provenance Connections Matrix */}
                {activeConnections.length > 0 && (
                  <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-2 text-left">
                    <h5 className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold">Verified Ecological Provenance Loop:</h5>
                    {activeConnections.map((line: any, idx: number) => {
                      const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-slate-900/60 first:border-t-0 pt-2 first:pt-0">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="text-emerald-500 font-bold">↳</span>
                            <span className="text-slate-400 font-light">Partnered directly with</span>
                            <strong 
                              onClick={() => supplier && setActiveProfileId(supplier.id)}
                              className="text-white font-medium underline decoration-emerald-500/30 cursor-pointer hover:text-emerald-400 transition"
                            >
                              {supplier ? supplier.business_name : 'Local Producer'}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <span className="text-[11px] italic text-slate-400 font-light">"{line.relationship_details}"</span>
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                              {line.verified_ethic}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Meta Address Footer */}
                <div className="text-[9px] font-mono text-slate-600 flex justify-between pt-2 border-t border-slate-800/40 select-none">
                  <span>Network Routing Handle: {merchant.owner_wallet.slice(0, 8)}...{merchant.owner_wallet.slice(-8)}</span>
                  <span>Region Flag: {merchant.city}, {merchant.country_code}</span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}