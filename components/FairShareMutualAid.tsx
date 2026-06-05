'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MutualAidProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  funding_goal: number;
  amount_raised: number;
  creator_wallet: string;
  ends_at: string;
  is_example: boolean;
}

export default function FairShareMutualAid() {
  const [proposals, setProposals] = useState<MutualAidProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("");

  const loadMutualAidData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProposals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMutualAidData();
  }, []);

  const handleContribute = async (proposalId: string, currentRaised: number, goal: number) => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return alert("Please specify a valid contribution amount.");
    
    const parsedAmount = parseFloat(fundAmount);
    const newTotalRaised = currentRaised + parsedAmount;

    try {
      const { error } = await supabase
        .from('proposals')
        .update({ amount_raised: newTotalRaised })
        .eq('id', proposalId);

      if (error) throw error;

      alert(`Successfully routed ${parsedAmount} USDC via Fair-Share Mutual Aid! 🌿`);
      setFundAmount("");
      setContributingId(null);
      loadMutualAidData();
    } catch (err: any) {
      alert("Transaction logging failed: " + err.message);
    }
  };

  if (loading) return <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 italic p-8">Loading shared surplus metrics...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 mt-4 text-white">
      
      {/* Dynamic Section Header Banner */}
      <div className="border-b border-slate-800/60 pb-4 text-left">
        <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold">Permaculture Third Ethic Matrix</span>
        <h2 className="text-xl font-bold uppercase font-sans tracking-wide mt-1">Fair-Share Mutual Aid Pool</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl font-light">
          The conscious redistribution of systemic capital, resource, and energy surpluses back into community infrastructure grids to actively regenerate land stewardship nodes.
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
          <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">No active capital pooling vectors logged in the database track yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {proposals.map((proposal) => {
            const goalValue = proposal.funding_goal || 1;
            const raisedValue = proposal.amount_raised || 0;
            const percentFunded = Math.min(Math.round((raisedValue / goalValue) * 100), 100);
            
            const daysRemaining = Math.max(
              Math.ceil((new Date(proposal.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              0
            );

            return (
              <div 
                key={proposal.id} 
                className={`bg-slate-950/40 border p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition duration-150 relative backdrop-blur-md shadow-xl group ${
                  proposal.is_example ? 'border-slate-800/60' : 'border-emerald-500/20'
                }`}
              >
                <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-emerald-500 to-purple-500 group-hover:h-full transition-all duration-200" />

                {/* Upper Metadata Ribbon Tags */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                    {proposal.category || 'General Capital Loop'}
                  </span>
                  {proposal.is_example && (
                    <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 border border-slate-900 px-1.5 py-0.5 bg-slate-950 rounded select-none">
                      Concept Template
                    </span>
                  )}
                </div>

                {/* Core Descriptive Text Stack */}
                <div className="space-y-1.5 text-left">
                  <h4 className="text-sm font-bold tracking-wide text-white uppercase font-sans leading-snug">{proposal.title}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed font-sans line-clamp-4 hover:line-clamp-none transition duration-200 cursor-pointer">
                    {proposal.description}
                  </p>
                </div>

                {/* Mathematical Visual Progress Bar Grid */}
                <div className="space-y-2 pt-2 border-t border-slate-900 text-left">
                  <div className="flex justify-between text-[9px] font-mono font-bold">
                    <div>
                      <span className="text-white font-mono font-black">{raisedValue.toLocaleString()}</span>
                      <span className="text-slate-500 font-normal"> / {goalValue.toLocaleString()} USDC</span>
                    </div>
                    <span className="font-black text-emerald-400">{percentFunded}%</span>
                  </div>
                  
                  {/* Outer Track Gauge Frame */}
                  <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentFunded}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[8px] font-mono text-slate-600 select-none">
                    <span>POLLED TREASURY GOAL</span>
                    <span>⏳ {daysRemaining} DAYS REMAINING</span>
                  </div>
                </div>

                {/* Web3 Interactivity Contribution Action Section */}
                <div className="pt-2 border-t border-slate-900 font-mono">
                  {contributingId === proposal.id ? (
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 focus-within:border-emerald-500/60 h-9 flex items-center">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={fundAmount} 
                          onChange={(e) => setFundAmount(e.target.value)} 
                          className="w-full bg-transparent text-xs font-mono text-white text-right focus:outline-none placeholder-slate-700 pr-0.5"
                        />
                        <span className="text-[8px] font-bold text-slate-600 uppercase select-none ml-1">USDC</span>
                      </div>
                      <button 
                        onClick={() => handleContribute(proposal.id, raisedValue, goalValue)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider px-3 h-9 rounded-lg transition hover:brightness-110"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setContributingId(null)}
                        className="text-[10px] font-mono text-slate-600 hover:text-white uppercase px-1 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-600 truncate max-w-[120px] block select-all font-bold">
                        📇 {proposal.creator_wallet.slice(0, 6)}...{proposal.creator_wallet.slice(-6)}
                      </span>
                      <button 
                        onClick={() => { setContributingId(proposal.id); setFundAmount(""); }}
                        className="w-full sm:w-auto bg-slate-900 border border-slate-800/80 hover:border-slate-700 hover:text-emerald-400 text-slate-300 text-center py-1.5 px-3 rounded-lg transition duration-150 tracking-wider uppercase font-black"
                      >
                        Redirect Surplus →
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}