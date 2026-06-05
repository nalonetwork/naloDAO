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
  image_url?: string;
  logo_url?: string;
  banner_url?: string;
  property_banner_url?: string;
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

  const isPermacultureRegistryNode = 
    currentProfile?.category?.toLowerCase() === 'agriculture' || 
    currentProfile?.business_name?.toLowerCase().includes('roe') ||
    currentProfile?.description?.toLowerCase().includes('permaculture') ||
    currentProfile?.description?.toLowerCase().includes('acre') ||
    currentProfile?.description?.toLowerCase().includes('farm');

  // --- INTERACTIVE PROFILE VIEW INTERCEPTOR ---
  if (activeProfileId && currentProfile) {
    const profileConnections = supplyLines.filter(line => line.buyer_wallet === currentProfile.owner_wallet);

    if (isPermacultureRegistryNode) {
      // 🌿 BRANCH A: HIGH-UTILITY MOLLISONIAN PERMACULTURE DESIGN CORE (SOLANA/STELLAR HYBRID)
      const landMapAsset = currentProfile.property_banner_url || currentProfile.banner_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80';

      return (
        <div className="w-full max-w-4xl mx-auto bg-[#0b0f13] rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md mt-4 animate-fade-in text-left">
          
          <div className="h-48 sm:h-64 w-full relative bg-slate-950">
            <img 
              src={landMapAsset} 
              alt="Mollisonian Design Registry Satellite Frame"
              className="w-full h-full object-cover opacity-30"
            />
            <button 
              onClick={() => setActiveProfileId(null)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2 bg-slate-950/90 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition z-20 shadow-md"
            >
              ← Back to Directory
            </button>
          </div>

          <div className="p-4 sm:p-8 relative -mt-16 space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/40 pb-6">
              <div className="flex items-end gap-4">
                <img 
                  src={currentProfile.logo_url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&h=150&q=80'} 
                  alt="Brand Logo" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-slate-800 bg-slate-950 shadow-xl relative z-10"
                />
                <div className="pb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{currentProfile.business_name}</h1>
                  <p className="text-[11px] font-mono text-slate-500 mt-2 break-all max-w-xs sm:max-w-xl">
                    Node Handle: <span className="text-slate-400">{currentProfile.owner_wallet}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto shadow-sm">
                {currentProfile.category}
              </span>
            </div>

            {/* Grant Vectors Submodule */}
            <div className="bg-slate-950/60 border border-slate-800/50 p-5 rounded-xl shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-[3px] bg-emerald-500/50" />
              <div className="flex items-center gap-2 border-b border-slate-800/40 pb-2">
                <span className="text-sm">💵</span>
                <h4 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">USDA & Local Community Grant Vectors</h4>
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Governmental allocation vectors calculated based on matching state conservation parameters:
              </p>
              <ul className="space-y-2.5 pl-1 pt-1 text-xs text-slate-300 font-sans leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 select-none mt-0.5">&bull;</span>
                  <span><strong>USDA NRCS EQIP Support:</strong> Direct cost-share matching available for local organic high-tunnels, cover cropping, and rotational silvopasture setups.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 select-none mt-0.5">&bull;</span>
                  <span><strong>State Watershed Management Incentives:</strong> Cost matching options for installing sediment retention structures and riparian buffers along slope lines.</span>
                </li>
              </ul>
            </div>

            {/* Sector Analysis Tool */}
            <div className="space-y-4">
              <div className="border-b border-slate-800/40 pb-2">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-black">Mollisonian Sector Analysis (Wild Energy Inputs)</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Mapping external energetic vectors passing through the property boundaries to optimize asset positioning.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-2 transition hover:border-slate-700">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]"><span>☀️</span> Radiation Sector (Sun Paths)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-light">Draft Studio: Open the node layout editor to configure your Solstice sun paths and solar capture ratios.</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-2 transition hover:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]"><span>💨</span> Aeolian Sector (Winds)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-light">Draft Studio: Input native winter/summer wind currents and map upcoming windbreak perennial shelterbelt lines.</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-2 transition hover:border-slate-700">
                  <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]"><span>🔥</span> Thermal Risk Sector (Wildfire)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-light">Draft Studio: Map out regional thermal risk factors, wind-driven paths, and dry vegetative fuel buffers.</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-2 transition hover:border-slate-700">
                  <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]"><span>💧</span> Topographic Gradient (Hydrology Flow)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-light">Draft Studio: Detail gradient contour water runoff paths to position swales, passive dams, and keylines.</p>
                </div>
              </div>
            </div>

            {/* INTEGRATED MOLLISONIAN TREE VALUE INDEX (TVI) CALCULATOR */}
            <div className="bg-gradient-to-br from-slate-950 via-[#0e1318] to-slate-950 border border-slate-800/80 p-6 rounded-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-md">🌳</span>
                  <h4 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                    Tree Value Index (TVI) Assetization Engine
                  </h4>
                </div>
                <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Whitepaper Sec. 4.5
                </span>
              </div>
              
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                In accordance with NaloDAO Core Monetary Principles, living trees function as active infrastructure. 
                Rather than calculating value through extraction (timber logs), the ledger aggregates continuous ecosystem service vectors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-950/80 border border-slate-800/60 p-4 rounded-lg space-y-3 font-mono text-xs shadow-inner">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Registry Audit Inputs</span>
                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[11px]">Count Active Living Trees:</label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 focus-within:border-emerald-500/60">
                      <input 
                        type="number" 
                        defaultValue="24" 
                        id="tvi-tree-count"
                        className="w-full bg-transparent text-white font-bold focus:outline-none"
                        onChange={() => {
                          const count = parseFloat((document.getElementById('tvi-tree-count') as HTMLInputElement)?.value || '0');
                          const valueSpan = document.getElementById('tvi-calc-output');
                          const tokenSpan = document.getElementById('tvi-token-output');
                          if (valueSpan && tokenSpan) {
                            const rawValue = count * 540; 
                            valueSpan.innerText = `$${rawValue.toLocaleString()}`;
                            tokenSpan.innerText = `${(rawValue / 0.15).toLocaleString()} NALO`;
                          }
                        }}
                      />
                      <span className="text-[10px] text-slate-500 font-bold ml-1 shrink-0">TREES</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-lg flex flex-col justify-between space-y-3 font-mono text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Aggregated System Valuation</span>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-500 block uppercase">Real-World Environmental Asset Value:</span>
                    <div className="text-2xl font-black text-white font-mono tracking-tight" id="tvi-calc-output">
                      $12,960.00
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded block w-max mt-1 font-bold" id="tvi-token-output">
                      86,400 NALO Mint Capacity
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-lg overflow-hidden text-[10px] font-mono shadow-inner">
                <div className="grid grid-cols-3 bg-slate-950 px-4 py-2 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-900">
                  <span>Valuation Vector</span>
                  <span className="text-center">Metric Standard</span>
                  <span className="text-right">Value Weight / Tree</span>
                </div>
                <div className="px-4 py-2 border-b border-slate-900 flex justify-between text-slate-300">
                  <span className="w-1/3 text-left">🌱 Replacement Cost (RC)</span>
                  <span className="w-1/3 text-center text-slate-500">Nursery Stock Parity</span>
                  <span className="w-1/3 text-right text-white font-bold">$100.00</span>
                </div>
                <div className="px-4 py-2 border-b border-slate-900 flex justify-between text-slate-300">
                  <span className="w-1/3 text-left">🐓 Ecological Contribution (EC)</span>
                  <span className="w-1/3 text-center text-slate-500">Habitat / Soil Web Inoculation</span>
                  <span className="w-1/3 text-right text-white font-bold">$250.00</span>
                </div>
                <div className="px-4 py-2 border-b border-slate-900 flex justify-between text-slate-300">
                  <span className="w-1/3 text-left">🛢️ Carbon Sequestration (CC)</span>
                  <span className="w-1/3 text-center text-slate-400">48 lbs CO2 Reabsorb Annually</span>
                  <span className="w-1/3 text-right text-white font-bold">$40.00</span>
                </div>
                <div className="px-4 py-2 flex justify-between text-slate-300">
                  <span className="w-1/3 text-left">❤️ Beauty / Cultural (BC)</span>
                  <span className="w-1/3 text-center text-slate-400">Bioregional Preservation Balance</span>
                  <span className="w-1/3 text-right text-white font-bold">$100.00</span>
                </div>
              </div>
            </div>

            {/* Concentric Zoning Module */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-800/40 pb-1.5">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-black">Ecosystem Energy Efficiency (Mollison Zoning Maps)</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Arranging infrastructure radially based on frequency of human visitation loops to save manual tracking energy.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold block">🏠 ZONE 1: Home Core</span>
                  <p className="text-[11px] text-slate-400 font-sans font-light leading-relaxed">Kitchen gardens, seed beds, rainwater tanks, worm farms, and propagation setups requiring daily visit loops.</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
                  <span className="text-teal-400 font-bold block">🐓 ZONE 2: Semi-Intensive</span>
                  <p className="text-[11px] text-slate-400 font-sans font-light leading-relaxed">Poultry coops, honeybee hives, small multi-tier orchards, complex composting yards, and deep main-crop root vegetables.</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
                  <span className="text-purple-400 font-bold block">🌲 ZONE 5: Wild Forage</span>
                  <p className="text-[11px] text-slate-400 font-sans font-light leading-relaxed">Unmanaged wilderness ecosystems left to natural ecological succession loops. Sourcing wildlife research data lines.</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-800/40" />

            {/* Non-Custodial USDC In-Card Financial Widget */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden w-full shadow-2xl">
              <div className="bg-slate-900/40 px-6 py-3 border-b border-slate-800/60 flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-500">
                <span className="uppercase tracking-[0.15em] text-emerald-400 font-black">Secure Settlement Core</span>
                <span className="font-sans italic text-slate-400 hidden sm:inline">Direct non-custodial capital bridges via Stellar Ledger Network</span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full space-y-2">
                    <label htmlFor={`profile-pay-${currentProfile.id}`} className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold px-1">
                      Enter Transfer Amount (USDC)
                    </label>
                    <div className="flex items-center bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-emerald-500/60 transition h-12">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        id={`profile-pay-${currentProfile.id}`}
                        value={checkoutAmounts[currentProfile.id] || ''}
                        onChange={e => setCheckoutAmounts(prev => ({ ...prev, [currentProfile.id]: e.target.value }))}
                        className="w-full bg-transparent text-white text-md font-mono focus:outline-none placeholder-slate-700"
                      />
                      <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md ml-2 select-none shrink-0">USDC</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSacredPayment(currentProfile.owner_wallet, currentProfile.id.toString(), checkoutAmounts[currentProfile.id])}
                    className="w-full sm:w-48 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition shadow-lg active:scale-95 shrink-0"
                  >
                    Authorize & Pay
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    } else {
      // 🛍️ BRANCH B: COMMERCIAL ENTERPRISE LAYOUT FOR CAFE & ECO-STORES (SOLANA/STELLAR HYBRID)
      return (
        <div className="w-full max-w-4xl mx-auto bg-[#0b0f13] rounded-xl border border-slate-800/80 shadow-2xl backdrop-blur-md mt-4 animate-fade-in text-slate-200">
          <div className="h-48 sm:h-64 w-full relative bg-slate-950">
            <img 
              src={currentProfile.banner_url || currentProfile.image_url || 'https://images.unsplash.com/photo-1464225226634-758beb0a499a?auto=format&fit=crop&w=1200&q=80'} 
              alt="Registry Node Banner"
              className="w-full h-full object-cover opacity-30"
            />
            <button 
              onClick={() => setActiveProfileId(null)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition z-20 shadow-md"
            >
              ← Back to Network
            </button>
          </div>

          <div className="p-4 sm:p-8 relative -mt-16 space-y-8 bg-[#0b0f13]/90 rounded-b-xl text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/40 pb-6">
              <div className="flex items-end gap-4">
                <img 
                  src={currentProfile.logo_url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&h=150&q=80'} 
                  alt="Brand Logo" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-slate-800 bg-slate-950 shadow-xl relative z-10"
                />
                <div className="pb-1 text-left">
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">{currentProfile.business_name}</h1>
                  <p className="text-[11px] font-mono text-slate-500 mt-2 break-all max-w-xs sm:max-w-xl">Node Handle: <span className="text-slate-400">{currentProfile.owner_wallet}</span></p>
                </div>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 self-start sm:self-auto shadow-sm">
                {currentProfile.category}
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 text-left">
                <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">Stewardship Metrology Statement</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line font-sans font-light bg-slate-950 p-4 rounded-xl border border-slate-900 max-w-3xl">
                  {currentProfile.detailed_bio || currentProfile.description}
                </p>
              </div>

              {profileConnections.length > 0 && (
                <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-3 max-w-3xl shadow-inner">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold text-left">Verified Ecological Provenance Loop:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profileConnections.map((line: any, idx: number) => {
                      const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                      return (
                        <div key={idx} className="flex items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-lg border border-slate-800/80 text-xs text-left shadow-sm font-mono">
                          <div className="text-slate-300 truncate font-sans">
                            <span className="text-emerald-400 mr-2">↳</span>
                            <span>Inputs:</span>
                            <strong className="text-white ml-1 underline cursor-pointer hover:text-emerald-400 font-bold" onClick={() => supplier && setActiveProfileId(supplier.id)}>
                              {supplier ? supplier.business_name : 'Registry Partner'}
                            </strong>
                          </div>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 font-bold">{line.verified_ethic}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden w-full shadow-2xl">
              <div className="bg-slate-900/40 px-6 py-3 border-b border-slate-800/60 flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-500">
                <span className="uppercase tracking-[0.15em] text-emerald-400 font-black">Secure Settlement Core</span>
                <span className="font-sans italic text-slate-400 hidden sm:inline">Non-custodial infrastructure loop via Stellar Asset Bridge</span>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3 font-mono text-xs text-slate-400 bg-slate-900 border border-slate-800 p-4 rounded-lg text-left shadow-inner">
                  <div className="flex justify-between items-center">
                    <span>Allocation Category:</span>
                    <span className="text-white font-bold tracking-wide">{currentProfile.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stellar Target Handle:</span>
                    <span className="text-white font-mono font-bold tracking-tight break-all pl-4 text-right">{currentProfile.owner_wallet}</span>
                  </div>
                </div>

                <hr className="border-slate-800/40" />

                <div className="space-y-2">
                  <label htmlFor={`profile-pay-${currentProfile.id}`} className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold px-1 text-left">Enter Transfer Amount</label>
                  <div className="flex items-center bg-slate-900 px-5 py-4 rounded-xl border border-slate-800 focus-within:border-emerald-500 transition h-14">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      id={`profile-pay-${currentProfile.id}`}
                      value={checkoutAmounts[currentProfile.id] || ''}
                      onChange={e => setCheckoutAmounts(prev => ({ ...prev, [currentProfile.id]: e.target.value }))}
                      className="w-full bg-transparent text-white text-xl font-mono focus:outline-none placeholder-slate-700"
                    />
                    <span className="text-xs font-mono font-black text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg ml-2 select-none shrink-0">USDC</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={() => handleSacredPayment(currentProfile.owner_wallet, currentProfile.id.toString(), checkoutAmounts[currentProfile.id])} className="w-full h-14 bg-gradient-to-r from-emerald-500 to-purple-600 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition duration-200 shadow-xl tracking-[0.2em]">
                    Authorize & Pay
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-2 text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-800/40 text-left">
              <span>Registry Location: {currentProfile.physical_address || 'Bioregional Zone 1'}</span>
              <span>Contact Core: {currentProfile.contact_email || 'steward@nalo.network'}</span>
              <span>Region Flag: {currentProfile.city}, {currentProfile.country_code}</span>
            </div>
          </div>
        </div>
      );
    }
  }

  // --- RESTORED STANDARD GRID CATALOG VIEW ---
  return (
    <div className="w-full space-y-6 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 text-left">
        <div>
          <h3 className="text-md font-bold text-white uppercase tracking-wider">Regenerative Commerce Network</h3>
          <p className="text-xs text-slate-500 mt-0.5">Auditing asset flows through the lens of Sacred Economics.</p>
        </div>
        <div className="flex gap-1.5 bg-slate-950 border border-slate-900 p-1 rounded-xl text-[10px] font-mono shadow-inner">
          {['All', 'Earth Care', 'People Care', 'Fair Share'].map((ethic) => (
            <button
              key={ethic}
              onClick={() => setSelectedEthicFilter(ethic)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${
                selectedEthicFilter === ethic ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {ethic}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {merchants.map((merchant) => {
          const activeConnections = supplyLines.filter(line => line.buyer_wallet === merchant.owner_wallet);
          
          if (selectedEthicFilter !== 'All' && !activeConnections.some(c => c.verified_ethic === selectedEthicFilter)) {
            return null;
          }

          return (
            <div key={merchant.id} className="bg-slate-950/40 border border-slate-800/60 rounded-xl overflow-hidden backdrop-blur-md hover:border-slate-700/80 transition duration-150 flex flex-col group relative">
              <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-emerald-400 to-purple-500 group-hover:h-full transition-all duration-200" />
              <div className="h-44 w-full bg-slate-950 relative overflow-hidden border-b border-slate-900">
                {merchant.image_url ? (
                  <img 
                    src={merchant.image_url} 
                    alt={merchant.business_name}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200 opacity-75 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950/20 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-[10px]">
                    🌾 No Custom Image Registered
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-slate-950/90 border border-slate-900 text-[8px] font-mono uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 rounded shadow-md">
                  {merchant.category}
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4 text-left">
                  <div className="flex gap-3">
                    <img 
                      src={merchant.logo_url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&h=150&q=80'} 
                      alt={`${merchant.business_name} logo`} 
                      className="w-11 h-11 rounded-lg object-cover border border-slate-800 bg-slate-950 relative -mt-9 shadow-lg"
                    />
                    <div>
                      <h4 
                        onClick={() => setActiveProfileId(merchant.id)}
                        className="text-sm font-bold text-white hover:text-emerald-400 cursor-pointer transition uppercase tracking-wide"
                      >
                        {merchant.business_name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-light leading-relaxed">{merchant.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-900 rounded-lg shadow-inner shrink-0 h-9">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={checkoutAmounts[merchant.id] || ''}
                      onChange={e => setCheckoutAmounts(prev => ({ ...prev, [merchant.id]: e.target.value }))}
                      className="w-12 bg-transparent text-white text-xs font-mono text-right focus:outline-none placeholder-slate-800 pr-0.5"
                    />
                    <span className="text-[8px] font-mono text-slate-600 font-bold select-none">USDC</span>
                    <button
                      onClick={() => handleSacredPayment(merchant.owner_wallet, merchant.id.toString())}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded transition uppercase tracking-wide"
                    >
                      Pay
                    </button>
                  </div>
                </div>

                {activeConnections.length > 0 && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1 text-left text-[11px] font-mono shadow-inner">
                    <h5 className="text-[8px] uppercase font-bold text-slate-500 block tracking-wider">Verified Ecological Provenance Loop:</h5>
                    {activeConnections.map((line: any, idx: number) => {
                      const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-slate-900/60 first:border-t-0 pt-2 first:pt-0 font-sans">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="text-emerald-400 font-bold">↳</span>
                            <span className="text-slate-400 font-light">Partnered directly with</span>
                            <strong 
                              onClick={() => supplier && setActiveProfileId(supplier.id)}
                              className="text-white font-medium underline decoration-emerald-500/30 cursor-pointer hover:text-emerald-400 transition font-bold"
                            >
                              {supplier ? supplier.business_name : 'Local Producer'}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto font-mono text-[11px]">
                            <span className="text-slate-400 font-light font-sans italic">"{line.relationship_details}"</span>
                            <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold shrink-0">
                              {line.verified_ethic}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-[8px] font-mono text-slate-600 flex justify-between pt-2 border-t border-slate-900 select-none">
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