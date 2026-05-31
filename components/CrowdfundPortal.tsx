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

    // A collection of pristine, non-duplicative permaculture/environmental images for fresh user submissions
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
            image_url: assignedImage // ◄── Assigns a unique cover url link automatically
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start w-full max-w-5xl mx-auto mt-4">
      
      {/* LEFT COLUMN: CAMPAIGN LAUNCH FORM */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-md font-bold text-white text-left">Pitch Earth-Care Action</h3>
          <p className="text-xs text-slate-400 text-left">Request funding directly from the decentralized community treasury chest.</p>
        </div>

        <form onSubmit={handleLaunchCampaign} className="space-y-3 text-left">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Project Objective</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Downtown Public Food Forest" className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition" required />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Resource Breakdown / Vision</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Explain exactly how these funds will heal local ecosystem layers..." className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target (USDC)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000" className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition">
                <option value="14">14 Days</option>
                <option value="21">21 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Beneficiary Escrow Routing Address</label>
            <input type="text" value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="G..." className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-[11px] font-mono focus:outline-none focus:border-emerald-500 transition" required />
          </div>

          <button type="submit" disabled={status === 'saving'} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl transition shadow-md shadow-emerald-500/5">
            {status === 'saving' ? 'Broadcasting Proposal...' : 'Launch Funding Pool'}
          </button>

          {status === 'success' && <p className="text-[11px] text-emerald-400 text-center font-medium mt-1">✓ Campaign live on public tracks!</p>}
          {status === 'error' && <p className="text-[11px] text-red-400 text-center font-medium mt-1">❌ Submission rejected. Try again.</p>}
        </form>
      </div>

      {/* RIGHT COLUMNS: ACTIVE MUTUAL AID CAMPAIGNS FEED */}
      <div className="md:col-span-2 space-y-4">
        <div className="border-b border-slate-900 pb-2 text-left">
          <h3 className="text-md font-bold text-white">Active Fair-Share Pools</h3>
          <p className="text-xs text-slate-400">Directly fund verified local resilience initiatives with zero management deductions.</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <p className="text-xs text-slate-500 font-mono">No open mutual aid campaigns currently active on the ledger.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const percentage = Math.min(Math.round((c.raised_amount / c.target_amount) * 100), 100);
              const formattedExpiration = new Date(c.ends_at).toLocaleDateString();

              return (
                <div key={c.id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col justify-between shadow-md backdrop-blur-sm group hover:border-slate-700/80 transition duration-200">
                  
                  {/* Vibrant Merchant Cover Photo Segment */}
                  <div className="h-40 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800/40">
                    {c.image_url ? (
                      <img 
                        src={c.image_url} 
                        alt={c.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-300 ease-in-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-950/20 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-[10px]">
                        🌱 Ecosystem Project Photo
                      </div>
                    )}
                    
                    {/* Floating Category Percentage Overlay */}
                    <span className="absolute top-3 right-3 bg-slate-950/90 border border-slate-800/60 text-[9px] font-mono uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 rounded-lg backdrop-blur-md shadow-md">
                      {percentage}% Funded
                    </span>
                  </div>

                  {/* Context Info Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-emerald-400 transition">{c.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-light">{c.description}</p>
                    </div>

                    {/* Funding Gauge Progress Bars */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-800/60 text-left">
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/40">
                        <div style={{ width: `${percentage}%` }} className="bg-emerald-400 h-full transition-all duration-500 rounded-full" />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                        <span className="text-slate-400">Raised: <strong className="text-white font-medium">{parseFloat(c.raised_amount).toFixed(2)}</strong> / {c.target_amount} USDC</span>
                        <span className="text-slate-500 font-normal">Ends: {formattedExpiration}</span>
                      </div>

                      {/* Interactive Contribution Panel */}
                      <div className="flex gap-1.5 pt-1.5">
                        <div className="relative rounded-xl shadow-sm w-full">
                          <input type="number" placeholder="Amount" value={fundAmounts[c.id] || ''} onChange={e => setFundAmounts(prev => ({ ...prev, [c.id]: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-mono pl-3 pr-9 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition h-9" />
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none"><span className="text-[9px] font-mono text-slate-600 font-bold">USDC</span></div>
                        </div>
                        <button onClick={() => handleContribute(c.id, c.raised_amount, c.beneficiary_wallet)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition shrink-0 shadow-lg shadow-emerald-500/5 h-9 active:scale-95 uppercase tracking-wide">
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