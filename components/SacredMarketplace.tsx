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
      // 🌿 BRANCH A: HIGH-UTILITY MOLLISONIAN PERMACULTURE DESIGN CORE (INVITING LIGHT)
      const landMapAsset = currentProfile.property_banner_url || currentProfile.banner_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80';

      return (
        <div className="w-full max-w-5xl mx-auto bg-white/90 border border-stone-200 rounded-3xl overflow-hidden shadow-xl mt-4 animate-fade-in text-left text-slate-800">
          
          {/* GIS Satellite Aerial Photo Section */}
          <div className="h-64 sm:h-80 w-full relative bg-stone-100 border-b border-stone-200">
            <img 
              src={landMapAsset} 
              alt="Mollisonian Design Registry Satellite Frame"
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent select-none" />
            
            <button 
              onClick={() => setActiveProfileId(null)}
              className="absolute top-6 left-6 px-4 py-2 bg-white/95 border border-stone-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600 transition shadow-md active:scale-95"
            >
              ← Back to Directory
            </button>

            <div className="absolute top-6 right-6 bg-emerald-50 border border-emerald-200 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-700 px-3 py-1.5 rounded-xl shadow-sm select-none">
              🌐 Live GIS Node Connection Locked
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 relative -mt-10 space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-stone-100 pb-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                  {currentProfile.category} Node Model
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif tracking-tight">{currentProfile.business_name}</h1>
                <p className="text-[11px] font-mono text-slate-500 max-w-2xl break-all">
                  📍 {currentProfile.physical_address || "14477 Cavendish Drive, Foley, AL"} &bull; Target Hub: <span className="text-slate-400">{currentProfile.owner_wallet}</span>
                </p>
              </div>

              {/* Permaculture GIS Onboarding Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-white border border-stone-200 p-2.5 rounded-2xl font-mono text-center shrink-0 shadow-sm">
                <div className="px-3 py-1">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Spatial Scale</span>
                  <span className="text-xs font-bold text-slate-800">0.3 Acres</span>
                </div>
                <div className="px-3 py-1 border-x border-stone-100">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">USDA Hardiness</span>
                  <span className="text-xs font-bold text-amber-600">8b / 9a</span>
                </div>
                <div className="px-3 py-1">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Catchment Basin</span>
                  <span className="text-xs font-bold text-teal-600">Foley Basin</span>
                </div>
              </div>
            </div>

            {/* Grant Vectors Submodule */}
            <div className="bg-gradient-to-br from-stone-50 to-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="text-sm">💵</span>
                <h4 className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-bold">USDA & Local Community Grant Vectors</h4>
              </div>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Governmental allocation vectors calculated based on matching state conservation parameters:
              </p>
              <ul className="space-y-2.5 pl-1 pt-1 text-xs text-slate-700 font-serif leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 select-none font-sans mt-0.5">&bull;</span>
                  <span><strong>USDA NRCS EQIP Support:</strong> Direct cost-share matching available for local organic high-tunnels, cover cropping, and rotational silvopasture setups.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 select-none font-sans mt-0.5">&bull;</span>
                  <span><strong>State Watershed Management Incentives:</strong> Cost matching options for installing sediment retention structures and riparian buffers along slope lines.</span>
                </li>
              </ul>
            </div>

            {/* Sector Analysis Tool */}
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-1.5">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 font-black">Mollisonian Sector Analysis (Wild Energy Inputs)</h3>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">Mapping external energetic vectors passing through the property boundaries to optimize asset positioning.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-stone-50/80 border border-stone-200/60 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wider text-[11px]"><span>☀️</span> Radiation Sector (Sun Paths)</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-light">Draft Studio: Open the node layout editor to configure your Solstice sun paths and solar capture ratios.</p>
                </div>

                <div className="bg-stone-50/80 border border-stone-200/60 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-wider text-[11px]"><span>💨</span> Aeolian Sector (Winds)</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-light">Draft Studio: Input native winter/summer wind currents and map upcoming windbreak perennial shelterbelt lines.</p>
                </div>

                <div className="bg-stone-50/80 border border-stone-200/60 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-wider text-[11px]"><span>🔥</span> Thermal Risk Sector (Wildfire)</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-light">Draft Studio: Map out regional thermal risk factors, wind-driven paths, and dry vegetative fuel buffers.</p>
                </div>

                <div className="bg-stone-50/80 border border-stone-200/60 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-[11px]"><span>💧</span> Topographic Gradient (Hydrology Flow)</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-light">Draft Studio: Detail gradient contour water runoff paths to position swales, passive dams, and keylines.</p>
                </div>
              </div>
            </div>

            {/* INTEGRATED MOLLISONIAN TREE VALUE INDEX (TVI) CALCULATOR */}
            <div className="bg-gradient-to-br from-stone-50 via-white to-stone-50 border border-stone-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-md">🌳</span>
                  <h4 className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-bold">
                    Tree Value Index (TVI) Assetization Engine
                  </h4>
                </div>
                <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Whitepaper Sec. 4.5
                </span>
              </div>
              
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                In accordance with NaloDAO Core Monetary Principles, living trees function as active infrastructure. 
                Rather than calculating value through extraction (timber logs), the ledger aggregates continuous ecosystem service vectors:
              </p>

              {/* Dynamic Interactive Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-white border border-stone-200 p-4 rounded-xl space-y-3 font-mono text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Registry Audit Inputs</span>
                  
                  <div className="space-y-1">
                    <label className="text-slate-600 block text-[11px]">Count Active Living Trees:</label>
                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 focus-within:border-emerald-500">
                      <input 
                        type="number" 
                        defaultValue="24" 
                        id="tvi-tree-count"
                        className="w-full bg-transparent text-slate-800 font-bold focus:outline-none"
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
                      <span className="text-[10px] text-slate-400 font-bold ml-1 shrink-0">TREES</span>
                    </div>
                  </div>
                </div>

                {/* Mathematical Output Ledger Index Breakdown */}
                <div className="bg-stone-50/50 border border-stone-200 p-4 rounded-xl flex flex-col justify-between space-y-3 font-mono text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Aggregated System Valuation</span>
                  
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 block uppercase">Real-World Environmental Asset Value:</span>
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight" id="tvi-calc-output">
                      $12,960.00
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded block w-max mt-1 font-bold" id="tvi-token-output">
                      86,400 NALO Mint Capacity
                    </span>
                  </div>
                </div>
              </div>

              {/* Valuation Vector Matrix Table */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden text-[10px] font-mono">
                <div className="grid grid-cols-3 bg-stone-50 px-4 py-2 text-slate-500 font-bold uppercase tracking-wider border-b border-stone-200">
                  <span>Valuation Vector</span>
                  <span className="text-center">Metric Standard</span>
                  <span className="text-right">Value Weight / Tree</span>
                </div>
                <div className="px-4 py-2 border-b border-stone-100 flex justify-between text-slate-600">
                  <span className="w-1/3 text-left">🌱 Replacement Cost (RC)</span>
                  <span className="w-1/3 text-center text-slate-400">Nursery Stock Parity</span>
                  <span className="w-1/3 text-right text-slate-800 font-bold">$100.00</span>
                </div>
                <div className="px-4 py-2 border-b border-stone-100 flex justify-between text-slate-600">
                  <span className="w-1/3 text-left">🐓 Ecological Contribution (EC)</span>
                  <span className="w-1/3 text-center text-slate-400">Habitat / Soil Web Inoculation</span>
                  <span className="w-1/3 text-right text-slate-800 font-bold">$250.00</span>
                </div>
                <div className="px-4 py-2 border-b border-stone-100 flex justify-between text-slate-600">
                  <span className="w-1/3 text-left">🛢️ Carbon Sequestration (CC)</span>
                  <span className="w-1/3 text-center text-slate-400">48 lbs CO2 Reabsorb Annually</span>
                  <span className="w-1/3 text-right text-slate-800 font-bold">$40.00</span>
                </div>
                <div className="px-4 py-2 flex justify-between text-slate-600">
                  <span className="w-1/3 text-left">❤️ Beauty / Cultural (BC)</span>
                  <span className="w-1/3 text-center text-slate-400">Bioregional Preservation Balance</span>
                  <span className="w-1/3 text-right text-slate-800 font-bold">$100.00</span>
                </div>
              </div>
            </div>

            {/* Concentric Zoning Module */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-stone-200 pb-1.5">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 font-black">Ecosystem Energy Efficiency (Mollison Zoning Maps)</h3>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">Arranging infrastructure radially based on frequency of human visitation loops to save manual tracking energy.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-stone-50/50 border border-stone-200/60 p-4 rounded-xl space-y-1">
                  <span className="text-emerald-600 font-bold block">🏠 ZONE 1: Home Core</span>
                  <p className="text-[11px] text-slate-600 font-sans font-light leading-relaxed">Kitchen gardens, seed beds, rainwater tanks, worm farms, and propagation setups requiring daily visit loops.</p>
                </div>
                <div className="bg-stone-50/50 border border-stone-200/60 p-4 rounded-xl space-y-1">
                  <span className="text-teal-600 font-bold block">🐓 ZONE 2: Semi-Intensive</span>
                  <p className="text-[11px] text-slate-600 font-sans font-light leading-relaxed">Poultry coops, honeybee hives, small multi-tier orchards, complex composting yards, and deep main-crop root vegetables.</p>
                </div>
                <div className="bg-stone-50/50 border border-stone-200/60 p-4 rounded-xl space-y-1">
                  <span className="text-slate-500 font-bold block">🌲 ZONE 5: Wild Forage</span>
                  <p className="text-[11px] text-slate-600 font-sans font-light leading-relaxed">Unmanaged wilderness ecosystems left to natural ecological succession loops. Sourcing wildlife research data lines.</p>
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Non-Custodial USDC In-Card Financial Widget */}
            <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden w-full shadow-inner">
              <div className="bg-stone-100 px-6 py-3 border-b border-stone-200 flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-500">
                <span className="uppercase tracking-[0.15em] text-emerald-600 font-black">Secure Settlement Core</span>
                <span className="font-serif italic text-slate-500 hidden sm:inline">Direct non-custodial capital bridges via Stellar Ledger Network</span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full space-y-2">
                    <label htmlFor={`profile-pay-${currentProfile.id}`} className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block font-bold px-1">
                      Enter Transfer Amount (USDC)
                    </label>
                    <div className="flex items-center bg-white px-4 py-3 rounded-xl border border-stone-200 focus-within:border-emerald-500 transition h-12">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        id={`profile-pay-${currentProfile.id}`}
                        value={checkoutAmounts[currentProfile.id] || ''}
                        onChange={e => setCheckoutAmounts(prev => ({ ...prev, [currentProfile.id]: e.target.value }))}
                        className="w-full bg-transparent text-slate-800 text-md font-mono focus:outline-none placeholder-stone-200"
                      />
                      <span className="text-[10px] font-mono font-black text-slate-500 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-md ml-2 select-none shrink-0">USDC</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSacredPayment(currentProfile.owner_wallet, currentProfile.id.toString(), checkoutAmounts[currentProfile.id])}
                    className="w-full sm:w-48 h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition shadow-sm active:scale-95 shrink-0"
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
      // 🛍️ BRANCH B: COMMERCIAL ENTERPRISE LAYOUT FOR CAFE & ECO-STORES (INVITING LIGHT)
      return (
        <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-3xl border border-stone-200 overflow-hidden shadow-xl mt-4 animate-fade-in text-slate-800">
          <div className="h-48 sm:h-64 w-full relative bg-stone-100">
            <img 
              src={currentProfile.banner_url || currentProfile.image_url || 'https://images.unsplash.com/photo-1464225226634-758beb0a499a?auto=format&fit=crop&w=1200&q=80'} 
              alt="Registry Node Banner"
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => setActiveProfileId(null)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2 bg-white/95 border border-stone-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition z-20 shadow-md"
            >
              ← Back to Network
            </button>
          </div>

          <div className="p-4 sm:p-8 relative -mt-16 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <img 
                  src={currentProfile.logo_url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&h=150&q=80'} 
                  alt="Brand Logo" 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white bg-stone-50 shadow-md relative z-10"
                />
                <div className="pb-1 text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none">{currentProfile.business_name}</h1>
                  <p className="text-[11px] font-mono text-slate-400 mt-2 break-all max-w-xs sm:max-w-xl">Node Handle: {currentProfile.owner_wallet}</p>
                </div>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-mono px-3 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 self-start sm:self-auto sm:mb-2 font-bold">
                {currentProfile.category}
              </span>
            </div>

            <hr className="border-stone-100" />

            <div className="space-y-6">
              <div className="space-y-3 text-left">
                <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-bold">Stewardship Metrology Statement</h3>
                <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line font-serif italic max-w-3xl">
                  {currentProfile.detailed_bio || currentProfile.description}
                </p>
              </div>

              {profileConnections.length > 0 && (
                <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl space-y-3 max-w-3xl">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold text-left">Verified Ecological Provenance Loop:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profileConnections.map((line: any, idx: number) => {
                      const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                      return (
                        <div key={idx} className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 text-xs text-left shadow-sm">
                          <div className="text-slate-600 truncate">
                            <span className="text-emerald-500 mr-2">↳</span>
                            <span>Inputs:</span>
                            <strong className="text-slate-900 ml-1 underline cursor-pointer hover:text-emerald-600" onClick={() => supplier && setActiveProfileId(supplier.id)}>
                              {supplier ? supplier.business_name : 'Registry Partner'}
                            </strong>
                          </div>
                          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded shrink-0 font-bold">{line.verified_ethic}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden w-full shadow-inner">
              <div className="bg-stone-100 px-6 py-3 border-b border-stone-200 flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-500">
                <span className="uppercase tracking-[0.15em] text-emerald-600 font-black">Secure Settlement Core</span>
                <span className="font-serif italic text-slate-500 hidden sm:inline">Non-custodial infrastructure loop via Stellar Asset Bridge</span>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3 font-mono text-xs text-slate-500 bg-white border border-stone-200 p-4 rounded-xl text-left shadow-sm">
                  <div className="flex justify-between items-center">
                    <span>Allocation Category:</span>
                    <span className="text-slate-800 font-bold tracking-wide">{currentProfile.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stellar Target Handle:</span>
                    <span className="text-slate-700 font-mono font-bold tracking-tight break-all pl-4 text-right">{currentProfile.owner_wallet}</span>
                  </div>
                </div>

                <hr className="border-stone-100" />

                <div className="space-y-2">
                  <label htmlFor={`profile-pay-${currentProfile.id}`} className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block font-bold px-1 text-left">Enter Transfer Amount</label>
                  <div className="flex items-center bg-white px-5 py-4 rounded-xl border border-stone-200 focus-within:border-emerald-500 transition h-14">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      id={`profile-pay-${currentProfile.id}`}
                      value={checkoutAmounts[currentProfile.id] || ''}
                      onChange={e => setCheckoutAmounts(prev => ({ ...prev, [currentProfile.id]: e.target.value }))}
                      className="w-full bg-transparent text-slate-800 text-xl font-mono focus:outline-none placeholder-stone-200"
                    />
                    <span className="text-xs font-mono font-black text-slate-400 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg ml-2 select-none shrink-0">USDC</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={() => handleSacredPayment(currentProfile.owner_wallet, currentProfile.id.toString(), checkoutAmounts[currentProfile.id])} className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition duration-200 shadow-md tracking-[0.2em]">
                    Authorize & Pay
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-2 text-[10px] font-mono text-slate-400 pt-4 border-t border-stone-100 text-left">
              <span>Registry Location: {currentProfile.physical_address || 'Bioregional Zone 1'}</span>
              <span>Contact Core: {currentProfile.contact_email || 'steward@nalo.network'}</span>
              <span>Region Flag: {currentProfile.city}, {currentProfile.country_code}</span>
            </div>
          </div>
        </div>
      );
    }
  }

  // --- STANDARD GRID CATALOG VIEW ---
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-4 text-slate-800">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 text-left">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-wide">Regenerative Commerce Network</h3>
          <p className="text-xs text-slate-500">Auditing asset flows through the lens of Sacred Economics.</p>
        </div>
        <div className="flex gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-[11px] font-mono shadow-inner">
          {['All', 'Earth Care', 'People Care', 'Fair Share'].map((ethic) => (
            <button
              key={ethic}
              onClick={() => setSelectedEthicFilter(ethic)}
              className={`px-2.5 py-1 rounded-lg transition font-mono ${
                selectedEthicFilter === ethic ? 'bg-white text-emerald-600 font-bold shadow-sm border border-stone-200/40' : 'text-slate-500 hover:text-slate-800'
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
            <div key={merchant.id} className="bg-white border border-stone-200 rounded-3xl shadow-md overflow-hidden hover:border-emerald-300 transition duration-200 group flex flex-col">
              <div className="h-44 w-full bg-stone-100 relative overflow-hidden border-b border-stone-200">
                {merchant.image_url ? (
                  <img 
                    src={merchant.image_url} 
                    alt={merchant.business_name}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300 ease-in-out opacity-95 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-slate-400 font-mono text-[10px]">
                    🌾 No Custom Image Registered
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-white/95 border border-stone-200 text-[9px] font-mono uppercase font-bold tracking-widest text-emerald-600 px-2.5 py-1 rounded-xl shadow-sm">
                  {merchant.category}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4 text-left">
                  <div className="flex gap-4">
                    <img 
                      src={merchant.logo_url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&h=150&q=80'} 
                      alt={`${merchant.business_name} logo`} 
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-white shrink-0 shadow-sm relative -mt-10 z-10"
                    />
                    <div>
                      <h4 
                        onClick={() => setActiveProfileId(merchant.id)}
                        className="text-md font-bold text-slate-900 hover:text-emerald-600 cursor-pointer transition underline decoration-transparent hover:decoration-emerald-500/40浏览 underline-offset-4"
                      >
                        {merchant.business_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-light leading-relaxed">{merchant.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 bg-stone-50 p-1.5 rounded-xl border border-stone-200 shadow-inner">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={checkoutAmounts[merchant.id] || ''}
                      onChange={e => setCheckoutAmounts(prev => ({ ...prev, [merchant.id]: e.target.value }))}
                      className="w-14 bg-transparent text-slate-800 text-xs font-mono text-right focus:outline-none placeholder-stone-300 pr-1"
                    />
                    <span className="text-[9px] font-mono text-slate-400 font-bold select-none">USDC</span>
                    <button
                      onClick={() => handleSacredPayment(merchant.owner_wallet, merchant.id.toString())}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 uppercase tracking-wider"
                    >
                      Pay
                    </button>
                  </div>
                </div>

                {activeConnections.length > 0 && (
                  <div className="bg-stone-50/50 border border-stone-200/60 p-4 rounded-xl space-y-2 text-left">
                    <h5 className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Verified Ecological Provenance Loop:</h5>
                    {activeConnections.map((line: any, idx: number) => {
                      const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-stone-100 first:border-t-0 pt-2 first:pt-0">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-emerald-500 font-bold">↳</span>
                            <span className="text-slate-400 font-light">Partnered directly with</span>
                            <strong 
                              onClick={() => supplier && setActiveProfileId(supplier.id)}
                              className="text-slate-900 font-medium underline decoration-stone-200 cursor-pointer hover:text-emerald-600 transition"
                            >
                              {supplier ? supplier.business_name : 'Local Producer'}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <span className="text-[11px] italic text-slate-400 font-light">"{line.relationship_details}"</span>
                            <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                              {line.verified_ethic}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-[9px] font-mono text-slate-400 flex justify-between pt-2 border-t border-stone-100 select-none">
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