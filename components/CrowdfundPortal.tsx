'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CrowdfundPortal() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');
  const [receiver, setReceiver] = useState('');
  const [duration, setDuration] = useState('14');
  const [fundAmounts, setFundAmounts] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    setCampaigns(data || []);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(duration));

    const designBackdrops = [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?auto=format&fit=crop&w=600&q=80'
    ];
    const assignedImage = designBackdrops[Math.floor(Math.random() * designBackdrops.length)];

    try {
      const { error } = await supabase
        .from('campaigns')
        .insert([
          {
            title,
            description: desc,
            target_amount: parseFloat(target),
            raised_amount: 0,
            beneficiary_wallet: receiver,
            ends_at: expirationDate.toISOString(),
            image_url: assignedImage
          }
        ]);

      if (error) throw error;
      
      setStatus('success');
      setTitle('');
      setDesc('');
      setTarget('');
      setReceiver('');
      fetchCampaigns();
    } catch (err) {
      console.error("Campaign injection failure:", err);
      setStatus('error');
    }
  };

  const handleContribute = async (campaignId: string, currentRaised: number, destinationWallet: string) => {
    const amountToContribute = fundAmounts[campaignId];
    if (!amountToContribute || parseFloat(amountToContribute) <= 0) {
      alert("Please enter a valid amount to contribute.");
      return;
    }

    try {
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const userAddress = await KitClass.getAddress();
      const derivedUserWallet = typeof userAddress === 'string' ? userAddress : userAddress[0]?.address || userAddress.address;

      if (!derivedUserWallet) {
        alert("Please connect your passport wallet handle at the top of the page first.");
        return;
      }

      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(derivedUserWallet);

      const USDC_ASSET = new stellarSdk.Asset(
        "USDC",
        "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT"
      );

      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({
          destination: destinationWallet,
          asset: USDC_ASSET,
          amount: amountToContribute
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      const submitTx = stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC);
      await server.submitTransaction(submitTx);

      const newTotal = currentRaised + parseFloat(amountToContribute);
      const { error: dbError } = await supabase
        .from('campaigns')
        .update({ raised_amount: newTotal })
        .eq('id', campaignId);

      if (dbError) throw dbError;

      alert("🎉 Surplus Shared! Your USDC contribution has been permanently recorded on-chain.");
      setFundAmounts(prev => ({ ...prev, [campaignId]: '' }));
      fetchCampaigns();

    } catch (err: any) {
      console.error("Crowdfund transfer canceled:", err);
      alert(`Contribution Failed: ${err?.message || "Please confirm your balance parameters and try again."}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start w-full max-w-5xl mx-auto mt-4 text-slate-200">
      
      {/* LEFT COLUMN: CAMPAIGN LAUNCH FORM */}
      <div className="bg-[#0b0f13] border border-slate-800/80 p-5 rounded-xl shadow-2xl space-y-5 text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Pitch Earth-Care Action</h3>
          <p className="text-xs text-slate-500 font-light mt-0.5 leading-relaxed">Request funding directly from the decentralized community treasury chest.</p>
        </div>

        <form onSubmit={handleLaunchCampaign} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Project Objective</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/60 transition"><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Downtown Public Food Forest" className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" required /></div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Resource Breakdown / Vision</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/60 transition"><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Explain exactly how these funds will heal local ecosystem layers..." className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700 resize-none leading-relaxed" required /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Target (USDC)</label>
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-emerald-500/60 transition"><input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000" className="w-full bg-transparent text-white text-xs font-mono focus:outline-none placeholder-slate-700" required /></div>
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Duration</label>
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 focus-within:border-emerald-500/60 transition"><select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer">
                <option value="14" className="bg-slate-950">14 Days</option>
                <option value="21" className="bg-slate-950">21 Days</option>
                <option value="30" className="bg-slate-950">30 Days</option>
              </select></div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Beneficiary Escrow Routing Address</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/60 transition"><input type="text" value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="G..." className="w-full bg-transparent text-white text-[11px] font-mono focus:outline-none placeholder-slate-700 tracking-tight" required /></div>
          </div>

          <button type="submit" disabled={status === 'saving'} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-widest py-3 rounded-lg transition hover:brightness-110 active:scale-[0.99] shadow-lg">
            {status === 'saving' ? 'Broadcasting Pool...' : 'Launch Funding Pool'}
          </button>

          {status === 'success' && <p className="text-[10px] font-mono font-bold text-emerald-400 text-center mt-1 uppercase tracking-wider">✓ Pool live on-chain</p>}
          {status === 'error' && <p className="text-[10px] font-mono font-bold text-red-400 text-center mt-1 uppercase tracking-wider">❌ Broadcast rejected</p>}
        </form>
      </div>

      {/* RIGHT COLUMNS: ACTIVE MUTUAL AID CAMPAIGNS FEED */}
      <div className="md:col-span-2 space-y-4">
        <div className="border-b border-slate-800/60 pb-3 text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Active Fair-Share Pools</h3>
          <p className="text-xs text-slate-500">Directly fund verified local resilience initiatives with zero management deductions.</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 shadow-inner">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">No active funding vectors tracked on public ledger</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const percentage = Math.min(Math.round((c.raised_amount / c.target_amount) * 100), 100);
              const formattedExpiration = new Date(c.ends_at).toLocaleDateString();

              return (
                <div key={c.id} className="bg-slate-950/40 border border-slate-800/60 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl backdrop-blur-md group hover:border-slate-700/80 transition duration-150 relative">
                  <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-emerald-500 to-purple-500 group-hover:h-full transition-all duration-200" />
                  
                  {/* Vibrant Merchant Cover Photo Segment */}
                  <div className="h-36 w-full bg-slate-950 relative overflow-hidden border-b border-slate-900">
                    {c.image_url ? (
                      <img 
                        src={c.image_url} 
                        alt={c.title}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-[1.01] transition duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-950/20 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-[10px]">
                        🌱 Ecosystem Project Photo
                      </div>
                    )}
                    
                    <span className="absolute top-3 right-3 bg-slate-950/90 border border-slate-900 text-[8px] font-mono uppercase font-black tracking-widest text-emerald-400 px-2 py-0.5 rounded shadow-md">
                      {percentage}% Funded
                    </span>
                  </div>

                  {/* Context Info Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-emerald-400 transition leading-snug">{c.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-light font-sans">{c.description}</p>
                    </div>

                    {/* Funding Gauge Progress Bars */}
                    <div className="space-y-3 pt-2 border-t border-slate-900 text-left">
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                        <div style={{ width: `${percentage}%` }} className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full transition-all duration-500 rounded-full" />
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono font-bold select-none">
                        <span className="text-slate-500">Raised: <span className="text-white font-mono font-black">{parseFloat(c.raised_amount).toFixed(2)}</span> / {c.target_amount} <span className="text-emerald-500">USDC</span></span>
                        <span className="text-slate-600 font-normal">Ends: {formattedExpiration}</span>
                      </div>

                      {/* Interactive Contribution Panel */}
                      <div className="flex gap-2 pt-1 font-mono">
                        <div className="relative rounded-lg shadow-sm w-full bg-slate-900 border border-slate-800 focus-within:border-emerald-500/60 transition h-9 flex items-center px-2.5">
                          <input type="number" placeholder="Amount" value={fundAmounts[c.id] || ''} onChange={e => setFundAmounts(prev => ({ ...prev, [c.id]: e.target.value }))} className="w-full bg-transparent text-white text-xs focus:outline-none placeholder-slate-700 text-right pr-1" />
                          <span className="text-[9px] text-slate-500 font-bold ml-1 select-none shrink-0">USDC</span>
                        </div>
                        <button onClick={() => handleContribute(c.id, c.raised_amount, c.beneficiary_wallet)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-lg transition shrink-0 uppercase tracking-wider h-9 shadow-md">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}