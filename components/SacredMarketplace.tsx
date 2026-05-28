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
  
  // Dynamic View Switcher state rule for profile view sub-routing
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

  // Find targeted profile data object if sub-page view state evaluates active
  const currentProfile = merchants.find(m => m.id === activeProfileId);

  // --- DYNAMIC SUB-VIEW PROFILE VIEW SCREEN (RENDERED WHEN A PARTNER IS SELECTED) ---
  if (activeProfileId && currentProfile) {
    const profileConnections = supplyLines.filter(line => line.buyer_wallet === currentProfile.owner_wallet);

    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 mt-4 bg-slate-950/40 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Banner Asset Box */}
        <div className="h-64 w-full relative bg-slate-900">
          <img 
            src={currentProfile.banner_url || 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=80'} 
            alt="Registry Node Banner"
            className="w-full h-full object-cover opacity-60"
          />
          <button 
            onClick={() => setActiveProfileId(null)}
            className="absolute top-6 left-6 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 hover:text-white transition"
          >
            ← Return to Marketplace
          </button>
        </div>

        {/* Brand Information Frame */}
        <div className="px-8 pb-8 relative -mt-20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <img 
              src={currentProfile.logo_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'} 
              alt="Brand Logo" 
              className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-950 bg-slate-900 shadow-xl relative z-10"
            />
            <span className="text-[10px] tracking-wider uppercase font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 sm:mb-2 align-self-start sm:align-self-auto">
              {currentProfile.category}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{currentProfile.business_name}</h1>
            <p className="text-sm font-mono text-slate-500 mt-1">Stellar Node: {currentProfile.owner_wallet}</p>
          </div>

          <hr className="border-slate-800/60" />

          {/* Deep Use-Case Narrative Text Block */}
          <div className="grid md:grid-cols-3 gap-8 pt-2">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">Stewardship Metrology Statement</h3>
              <p className="text-sm text-slate-300 leading-relaxed text-justify whitespace-pre-line font-serif italic">
                {currentProfile.detailed_bio || currentProfile.description}
              </p>
            </div>

            {/* FIXED: PREMIUM UN-BUNCHED TRADITIONAL CHECKOUT PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl h-fit shadow-2xl overflow-hidden shrink-0">
              {/* Checkout Header */}
              <div className="bg-slate-950 p-6 border-b border-slate-800/60">
                <h4 className="text-xs uppercase font-mono tracking-[0.2em] text-emerald-400 font-black">Secure Checkout</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-serif italic">Non-custodial settlement loop via Stellar Horizon Network.</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary Line Items */}
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Allocation Item:</span>
                    <span className="text-white font-medium text-right max-w-[150px] truncate">{currentProfile.category}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Network Routing:</span>
                    <span className="text-slate-400 text-[10px]">{currentProfile.owner_wallet.slice(0, 6)}...{currentProfile.owner_wallet.slice(-4)}</span>
                  </div>
                  <hr className="border-slate-800/60 my-2" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Currency Axis:</span>
                    <span className="text-sm font-bold text-white tracking-tight">Stellar Asset Bridge</span>
                  </div>
                </div>

                {/* Big Input Form Field */}
                <div className="space-y-2">
                  <label htmlFor={`profile-pay-${currentProfile.id}`} className="text-[10px] font-mono uppercase tracking-widest text-slate-400 ml-1 block font-bold">
                    Enter Transfer Amount
                  </label>
                  <div className="flex items-center justify-between bg-slate-950 px-5 py-4 rounded-2xl border border-slate-800 focus-within:border-emerald-500/60 transition group">
                    {/* FIXED: Linked to checkoutAmounts state variable instead of document ID lookups */}
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      id={`profile-pay-${currentProfile.id}`}
                      value={checkoutAmounts[currentProfile.id] || ''}
                      onChange={e => setCheckoutAmounts(prev => ({ ...prev, [currentProfile.id]: e.target.value }))}
                      className="w-full bg-transparent text-white text-2xl font-mono focus:outline-none placeholder-slate-800 tracking-tight"
                    />
                    <span className="text-sm font-mono font-black text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl ml-3 shadow-sm select-none">
                      USDC
                    </span>
                  </div>
                </div>

                {/* Execution Dispatch Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleSacredPayment(currentProfile.owner_wallet, currentProfile.id.toString(), checkoutAmounts[currentProfile.id])}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-widest py-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                  >
                    Authorize & Pay
                  </button>
                  <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-600">
                    <span>🔒 Encrypted protocol signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          {/* Connected Ecological Supply Chain Track Box */}
          {profileConnections.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/40 p-5 rounded-2xl space-y-3">
              <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">Verified Ecological Provenance Loop:</h5>
              {profileConnections.map((line: any, idx: number) => {
                const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                return (
                  <div key={idx} className="flex items-center justify-between gap-4 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/20">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400">↳</span>
                      <span>Sourcing raw processing inputs from</span>
                      <strong 
                        className="text-white font-bold underline cursor-pointer hover:text-emerald-400"
                        onClick={() => supplier && setActiveProfileId(supplier.id)}
                      >
                        {supplier ? supplier.business_name : 'Registry Partner'}
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {line.verified_ethic}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Regional Meta Flags */}
          <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-600 pt-4 border-t border-slate-800/40">
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
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
      <div className="space-y-4">
        {merchants.map((merchant) => {
          const activeConnections = supplyLines.filter(line => line.buyer_wallet === merchant.owner_wallet);
          
          if (selectedEthicFilter !== 'All' && !activeConnections.some(c => c.verified_ethic === selectedEthicFilter)) {
            return null;
          }

          return (
            <div key={merchant.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl shadow-xl backdrop-blur-sm space-y-4 hover:border-slate-700/80 transition duration-200">
              
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <img 
                    src={merchant.logo_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=100&q=80'} 
                    alt="Logo" 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 
                        onClick={() => setActiveProfileId(merchant.id)}
                        className="text-md font-bold text-white hover:text-emerald-400 cursor-pointer transition underline decoration-transparent hover:decoration-emerald-500/40 underline-offset-4"
                      >
                        {merchant.business_name}
                      </h4>
                      <span className="text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {merchant.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{merchant.description}</p>
                  </div>
                </div>

                {/* Direct Checkout Panel */}
                <div className="flex items-center gap-2 shrink-0 bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={checkoutAmounts[merchant.id] || ''}
                    onChange={e => setCheckoutAmounts(prev => ({ ...prev, [merchant.id]: e.target.value }))}
                    className="w-16 bg-transparent text-white text-xs font-mono text-right focus:outline-none placeholder-slate-700"
                  />
                  <span className="text-[10px] font-mono text-slate-500 mr-1">USDC</span>
                  <button
                    onClick={() => handleSacredPayment(merchant.owner_wallet, merchant.id.toString())}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Pay
                  </button>
                </div>
              </div>

              {/* Provenance Connections Matrix */}
              {activeConnections.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800/40 p-3.5 rounded-xl space-y-2">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Verified Ecological Provenance Loop:</h5>
                  {activeConnections.map((line: any, idx: number) => {
                    const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                    return (
                      <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-emerald-500">↳</span>
                          <span>Partnered directly with</span>
                          <strong 
                            onClick={() => supplier && setActiveProfileId(supplier.id)}
                            className="text-white font-medium underline decoration-emerald-500/30 cursor-pointer hover:text-emerald-400 transition"
                          >
                            {supplier ? supplier.business_name : 'Local Producer'}
                          </strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] italic text-slate-400">"{line.relationship_details}"</span>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            {line.verified_ethic}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meta Address Footer */}
              <div className="text-[9px] font-mono text-slate-600 flex justify-between pt-2 border-t border-slate-800/40">
                <span>Network Routing Handle: {merchant.owner_wallet}</span>
                <span>Region Flag: {merchant.city}, {merchant.country_code}</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}