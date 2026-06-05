'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function StewardshipLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address, stewardship_score')
        .order('stewardship_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaders(data || []);
    } catch (err) {
      console.error("Error pulling points leaderboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getStewardRank = (score: number) => {
    if (score >= 100) return { title: '🌳 Ancient Oak', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5' };
    if (score >= 50) return { title: '🌿 Fruit Tree', style: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
    if (score >= 25) return { title: '🌱 Sprout Steward', style: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    return { title: '🌾 Seedling', style: 'bg-slate-900 text-slate-500 border-slate-800' };
  };

  if (loading) return <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 text-center py-4">Compiling community impact data...</p>;

  return (
    <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-xl shadow-2xl space-y-4 text-left backdrop-blur-md relative overflow-hidden group w-full">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-purple-600" />
      
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white">Bioregional Hall of Fame</h3>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">Honoring the citizens investing the most energy into our local economy.</p>
        </div>
        <button onClick={fetchLeaderboard} className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md transition duration-150">Sync ⟳</button>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
        {leaders.map((leader, index) => {
          const rank = getStewardRank(leader.stewardship_score);
          const isTopThree = index < 3;

          return (
            <div 
              key={leader.wallet_address} 
              className={`flex items-center justify-between p-3 rounded-xl border transition duration-150 relative overflow-hidden ${
                isTopThree ? 'bg-slate-950/80 border-slate-800/80 shadow-md' : 'bg-slate-900/10 border-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Visual Rank Placement Numbers */}
                <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-[10px] font-mono font-black border tracking-tighter shrink-0 ${
                  index === 0 ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 border-amber-400 shadow-md' :
                  index === 1 ? 'bg-slate-200 text-slate-950 border-slate-300' :
                  index === 2 ? 'bg-amber-700 text-white border-amber-600' : 'text-slate-500 border-slate-800 bg-slate-950/40'
                }`}>
                  {index + 1}
                </span>

                <div className="flex flex-col text-left">
                  <span className="text-xs font-mono text-slate-300 font-bold select-all">
                    {leader.wallet_address.slice(0, 6)}...{leader.wallet_address.slice(-6)}
                  </span>
                  <span className={`text-[8px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border mt-1 font-bold w-max ${rank.style}`}>
                    {rank.title}
                  </span>
                </div>
              </div>

              {/* Dynamic Stewardship Score Display */}
              <div className="text-right font-mono">
                <span className="text-sm font-black text-emerald-400 tracking-tight">{leader.stewardship_score}</span>
                <span className="block text-[8px] uppercase tracking-widest text-slate-600 font-bold mt-0.5">Points</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}