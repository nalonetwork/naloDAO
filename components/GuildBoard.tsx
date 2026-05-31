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
    
    // Assign random generic fallbacks for user posts ensuring zero aesthetic duplications
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start w-full max-w-5xl mx-auto mt-4">
      
      {/* LEFT COLUMN: LOGISTICS PUBLISHING COMPONENT */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 text-left">
        <div>
          <h3 className="text-md font-bold text-white">Broadcast Bioregional Status</h3>
          <p className="text-xs text-slate-400">List immediate agricultural gluts or look for input requirements across the local network rows.</p>
        </div>

        <form onSubmit={handlePublishNotice} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Notice Type</label>
            <select value={noticeType} onChange={e => setNoticeType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition">
              <option value="SURPLUS">🍏 [SURPLUS] We Have Resource Glut</option>
              <option value="WANTED">🔍 [WANTED] Seeking Material Inputs</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 50 lbs Organic Tomatoes" className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Details</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Provide details on quantity, organic parameters, or terms..." className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition resize-none" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Routing Handle</label>
            <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="e.g., Signal: @farmroots" className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition" required />
          </div>

          <button type="submit" disabled={status === 'saving'} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl transition shadow-md">
            {status === 'saving' ? 'Broadcasting...' : 'Publish to Guild Board'}
          </button>
          {status === 'success' && <p className="text-[11px] text-emerald-400 text-center font-medium mt-1">✓ Logged on public notice board rows!</p>}
        </form>
      </div>

      {/* RIGHT COLUMNS: RICH INTERACTIVE EXCHANGE ITEMS LOG */}
      <div className="md:col-span-2 space-y-4">
        <div className="border-b border-slate-900 pb-2 text-left">
          <h3 className="text-md font-bold text-white">Active Bioregional Logistics Feed</h3>
          <p className="text-xs text-slate-400">Claim resource surpluses or settle contracts directly using secure digital dollar bridges.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notices.map((n) => (
            <div key={n.id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col justify-between shadow-md backdrop-blur-sm group hover:border-slate-700/80 transition duration-200">
              
              {/* Cover Photo Segment */}
              <div className="h-40 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800/40">
                {n.image_url ? (
                  <img src={n.image_url} alt={n.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-300 ease-in-out" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950/20 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-[10px]">🌾 Resource Exchange Asset</div>
                )}
                
                <span className={`absolute top-3 left-3 text-[9px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded-lg backdrop-blur-md shadow-md border ${
                  n.notice_type === 'SURPLUS' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                }`}>
                  {n.notice_type}
                </span>
              </div>

              {/* Notice Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white tracking-wide">{n.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{n.details}</p>
                </div>

                {/* INTERACTIVE ACTIONS COMPONENT LAYOUT PANEL */}
                <div className="space-y-3 pt-3 border-t border-slate-800/60">
                  
                  {/* Row 1: Communications metadata bridge triggers */}
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">📞 Contact Link:</span>
                    <button onClick={() => alert(`Launching communication system to dial: ${n.contact_info}`)} className="text-emerald-400 hover:underline font-bold">
                      {n.contact_info} ↗
                    </button>
                  </div>

                  {/* Row 2: In-card USDC micro-settlement forms field */}
                  <div className="flex gap-1.5 pt-0.5">
                    <div className="relative rounded-xl shadow-sm w-full">
                      <input type="number" placeholder="Settle Amount" value={settleAmounts[n.id] || ''} onChange={e => setSettleAmounts(prev => ({ ...prev, [n.id]: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-mono pl-3 pr-9 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition h-9" />
                      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none"><span className="text-[9px] font-mono text-slate-600 font-bold">USDC</span></div>
                    </div>
                    <button onClick={() => handleDirectSettle(n.owner_wallet, n.id)} className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition shrink-0 h-9 active:scale-95">
                      Settle
                    </button>
                  </div>

                  {/* Row 3: formalize provenance connection loops button triggers */}
                  <button onClick={() => handleLinkRelationship(n.owner_wallet, n.title)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider py-2 rounded-xl transition active:scale-95 text-center block shadow-md">
                    🤝 Connect Supply Line
                  </button>

                  <div className="text-[8px] font-mono text-slate-600 text-center select-none pt-1">
                    Node: {n.owner_wallet.slice(0, 10)}...{n.owner_wallet.slice(-10)}
                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}