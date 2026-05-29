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
    // Fetch directly from your live postgres proposals table tracking framework
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
      // 1. Database Update Handshake Loop
      const { error } = await supabase
        .from('proposals')
        .update({ amount_raised: newTotalRaised })
        .eq('id', proposalId);

      if (error) throw error;

      alert(`Successfully routed ${parsedAmount} USDC via Fair-Share Mutual Aid! 🌿`);
      setFundAmount("");
      setContributingId(null);
      loadMutualAidData(); // Hot reload UI grid metrics instantly
    } catch (err: any) {
      alert("Transaction logging failed: " + err.message);
    }
  };

  if (loading) return <div className="text-xs font-mono text-slate-500 italic p-8">Loading shared surplus metrics...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 mt-4 text-white">
      
      {/* Dynamic Section Header Banner */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold">Permaculture Third Ethic Matrix</span>
        <h2 className="text-2xl font-bold tracking-tight mt-1">Fair-Share Mutual Aid Pool</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          The conscious redistribution of systemic capital, resource, and energy surpluses back into community infrastructure grids to actively regenerate land stewardship nodes.
        </p>
      </div>

      {proposals.length === 0 ? (
        <p className="text-xs text-slate-600 font-mono italic">No active capital pooling vectors logged in the database track yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => {
            // Safe inline percentage calculator engine
            const goalValue = proposal.funding_goal || 1;
            const raisedValue = proposal.amount_raised || 0;
            const percentFunded = Math.min(Math.round((raisedValue / goalValue) * 100), 100);
            
            // Calculate remaining calendar timelines from ends_at date layout
            const daysRemaining = Math.max(
              Math.ceil((new Date(proposal.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              0
            );

            return (
              <div 
                key={proposal.id} 
                className={`bg-slate-950/40 border rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition relative backdrop-blur-sm shadow-xl ${
                  proposal.is_example ? 'border-slate-800/80' : 'border-emerald-500/20'
                }`}
              >
                {/* Upper Metadata Ribbon Tags */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    {proposal.category || 'General Capital Loop'}
                  </span>
                  {proposal.is_example && (
                    <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 border border-slate-800 px-1.5 py-0.5 bg-slate-900 rounded select-none">
                      Concept Template
                    </span>
                  )}
                </div>

                {/* Core Descriptive Text Stack */}
                <div className="space-y-2">
                  <h4 className="text-md font-bold tracking-tight text-white leading-snug">{proposal.title}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed font-sans line-clamp-4 hover:line-clamp-none transition duration-200 cursor-pointer">
                    {proposal.description}
                  </p>
                </div>

                {/* Mathematical Visual Progress Bar Grid */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-white font-bold">{raisedValue.toLocaleString()} USDC</span>
                      <span className="text-slate-600 text-[9px]"> raised</span>
                    </div>
                    <span className="font-bold text-emerald-400">{percentFunded}%</span>
                  </div>
                  
                  {/* Outer Track Gauge Frame */}
                  <div className="w-full h-2 bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentFunded}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                    <span>Goal: {goalValue.toLocaleString()} USDC</span>
                    <span>⏳ {daysRemaining} Days Left</span>
                  </div>
                </div>

                {/* Web3 Interactivity Contribution Action Section */}
                <div className="pt-2 border-t border-slate-900">
                  {contributingId === proposal.id ? (
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={fundAmount} 
                          onChange={(e) => setFundAmount(e.target.value)} 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                        <span className="absolute right-3 top-1.5 text-[9px] font-mono text-slate-600 uppercase">USDC</span>
                      </div>
                      <button 
                        onClick={() => handleContribute(proposal.id, raisedValue, goalValue)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setContributingId(null)}
                        className="text-[10px] font-mono text-slate-500 hover:text-white uppercase px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-600 truncate max-w-[150px] block select-all">
                        📇 {proposal.creator_wallet}
                      </span>
                      <button 
                        onClick={() => { setContributingId(proposal.id); setFundAmount(""); }}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-emerald-400 text-slate-300 text-center py-2 px-4 rounded-xl transition duration-200 tracking-wider uppercase font-bold shrink-0"
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