'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GuildBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeType, setNoticeType] = useState('SURPLUS');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [settleAmounts, setSettleAmounts] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const fetchNotices = async () => {
    const { data } = await supabase.from('guild_notices').select('*').order('created_at', { ascending: false });
    setNotices(data || []);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    const activeWallet = localStorage.getItem('nalo_wallet_address') || 'G_ANONYMOUS_STEWARD_FALLBACK_NODE';
    
    const fallbacks = [
      'https://images.unsplash.com/photo-1464225226634-758beb0a499a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'
    ];
    const pickedImage = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    const { error } = await supabase.from('guild_notices').insert([{
      owner_wallet: activeWallet,
      notice_type: noticeType,
      title,
      details,
      contact_info: contactInfo,
      image_url: pickedImage
    }]);

    if (!error) {
      setStatus('success');
      setTitle('');
      setDetails('');
      setContactInfo('');
      fetchNotices();
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleDirectSettle = async (targetWallet: string, id: string) => {
    const amount = settleAmounts[id];
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid USDC amount to clear this resource contract.");
      return;
    }

    try {
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const userAddress = await KitClass.getAddress();
      const derivedWallet = typeof userAddress === 'string' ? userAddress : userAddress[0]?.address || userAddress.address;

      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(derivedWallet);

      const USDC_ASSET = new stellarSdk.Asset("USDC", "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT");

      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({ destination: targetWallet, asset: USDC_ASSET, amount }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      await server.submitTransaction(stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC));

      alert("🎉 Direct Settlement Complete! Funds routed to producer node with zero merchant extraction.");
      setSettleAmounts(prev => ({ ...prev, [id]: '' }));
    } catch (err: any) {
      alert(`Settlement Failed: ${err?.message || "Check wallet configurations."}`);
    }
  };

  const handleLinkRelationship = async (supplierWallet: string, noticeTitle: string) => {
    const activeWallet = localStorage.getItem('nalo_wallet_address');
    if (!activeWallet) {
      alert("Please connect your Ecosystem Passport at the top of the page before formalizing connections.");
      return;
    }

    const { error } = await supabase.from('supply_lines').insert([{
      buyer_wallet: activeWallet,
      supplier_wallet: supplierWallet,
      relationship_details: `Established via Guild Board exchange item: "${noticeTitle}"`,
      verified_ethic: 'Fair Share'
    }]);

    if (error) {
      alert("Relationship already mapped or linked inside database tracks.");
    } else {
      alert("🌱 Relationship Ledger Fixed! This loop is now permanently logged under your active marketplace provenance tracks.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start w-full max-w-5xl mx-auto mt-4 text-slate-200">
      
      {/* LEFT COLUMN: LOGISTICS PUBLISHING COMPONENT */}
      <div className="bg-[#0b0f13] border border-slate-800/80 p-5 rounded-xl shadow-2xl space-y-4 text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-transparent" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Broadcast Bioregional Status</h3>
          <p className="text-xs text-slate-500 font-light mt-0.5 leading-relaxed">List immediate agricultural gluts or look for input requirements across the network rows.</p>
        </div>

        <form onSubmit={handlePublishNotice} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Notice Type</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 focus-within:border-purple-500/40 transition"><select value={noticeType} onChange={e => setNoticeType(e.target.value)} className="w-full bg-transparent text-white text-xs focus:outline-none cursor-pointer">
              <option value="SURPLUS" className="bg-slate-950">🍏 [SURPLUS] We Have Resource Glut</option>
              <option value="WANTED" className="bg-slate-950">🔍 [WANTED] Seeking Material Inputs</option>
            </select></div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Title</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/60 transition"><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 50 lbs Organic Tomatoes" className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" required /></div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Details</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/60 transition"><textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Provide details on quantity, organic parameters, or terms..." className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700 resize-none leading-relaxed" required /></div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Contact Routing Handle</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/60 transition"><input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="e.g., Signal: @farmroots" className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" required /></div>
          </div>

          <button type="submit" disabled={status === 'saving'} className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-widest py-3 rounded-lg transition hover:brightness-110 shadow-lg">
            {status === 'saving' ? 'Broadcasting Notice...' : 'Publish to Guild Board'}
          </button>
          {status === 'success' && <p className="text-[10px] font-mono font-bold text-emerald-400 text-center mt-1 uppercase tracking-wider">✓ Notice posted live</p>}
        </form>
      </div>

      {/* RIGHT COLUMNS: RICH INTERACTIVE EXCHANGE ITEMS LOG */}
      <div className="md:col-span-2 space-y-4">
        <div className="border-b border-slate-800/60 pb-3 text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Active Bioregional Logistics Feed</h3>
          <p className="text-xs text-slate-500">Claim resource surpluses or settle contracts directly using secure digital dollar bridges.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notices.map((n) => {
            const isFungalCompost = n.title && n.title.toLowerCase().includes('fungal');
            const reliableFungalBlockUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Shitake_growing_on_substrate.jpg/600px-Shitake_growing_on_substrate.jpg";
            const currentImgSource = isFungalCompost ? reliableFungalBlockUrl : n.image_url;

            return (
              <div key={n.id} className="bg-slate-950/40 border border-slate-800/60 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl backdrop-blur-md group hover:border-slate-700/80 transition duration-150 relative">
                <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-purple-500 to-emerald-500 group-hover:h-full transition-all duration-200" />
                
                {/* Cover Photo Segment */}
                <div className="h-36 w-full bg-slate-950 relative overflow-hidden border-b border-slate-900">
                  {currentImgSource ? (
                    <img 
                      src={currentImgSource} 
                      alt={n.title} 
                      onError={(e) => {
                        e.currentTarget.src = isFungalCompost ? reliableFungalBlockUrl : "https://images.unsplash.com/photo-1464225226634-758beb0a499a?auto=format&fit=crop&w=600&q=80";
                      }}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-[1.01] transition duration-200" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-950/20 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-[10px]">🌾 Resource Exchange Asset</div>
                  )}
                  
                  <span className={`absolute top-3 left-3 text-[8px] font-mono uppercase font-black tracking-widest px-2 py-0.5 rounded shadow-md border ${
                    n.notice_type === 'SURPLUS' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                  }`}>
                    {n.notice_type}
                  </span>
                </div>

                {/* Notice Body */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-emerald-400 transition leading-snug">{n.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-light font-sans">{n.details}</p>
                  </div>

                  {/* INTERACTIVE ACTIONS COMPONENT LAYOUT PANEL */}
                  <div className="space-y-3 pt-3 border-t border-slate-900 font-mono text-[11px]">
                    
                    {/* Row 1: Communications metadata bridge triggers */}
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-500 uppercase tracking-wider font-bold">📞 Routing Hub:</span>
                      <button onClick={() => alert(`Launching communication system to dial: ${n.contact_info}`)} className="text-emerald-400 hover:underline font-black uppercase tracking-wide">
                        {n.contact_info} ↗
                      </button>
                    </div>

                    {/* Row 2: In-card USDC micro-settlement forms field */}
                    <div className="flex gap-2 pt-0.5">
                      <div className="relative rounded-lg shadow-sm w-full bg-slate-900 border border-slate-800 focus-within:border-emerald-500/60 transition h-9 flex items-center px-2.5">
                        <input type="number" placeholder="Settle Amount" value={settleAmounts[n.id] || ''} onChange={e => setSettleAmounts(prev => ({ ...prev, [n.id]: e.target.value }))} className="w-full bg-transparent text-white text-xs focus:outline-none placeholder-slate-700 text-right pr-0.5" />
                        <span className="text-[9px] font-bold text-slate-500 select-none shrink-0 ml-1">USDC</span>
                      </div>
                      <button onClick={() => handleDirectSettle(n.owner_wallet, n.id)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[10px] font-black uppercase tracking-wider px-3 rounded-lg transition h-9 shrink-0">
                        Settle
                      </button>
                    </div>

                    {/* Row 3: formalize provenance connection loops button triggers */}
                    <button onClick={() => handleLinkRelationship(n.owner_wallet, n.title)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition text-center block shadow-lg">
                      🤝 Connect Supply Line
                    </button>

                    <div className="text-[8px] text-slate-600 text-center select-none pt-0.5 font-bold">
                      NODE: {n.owner_wallet.slice(0, 8)}...{n.owner_wallet.slice(-8)}
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}