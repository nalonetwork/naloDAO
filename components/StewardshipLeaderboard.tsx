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
        .limit(10); // Show top 10 community leaders

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

  // Custom permaculture-themed ranking badges based on their community score thresholds
  const getStewardRank = (score: number) => {
    if (score >= 100) return { title: '🌳 Ancient Oak', style: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (score >= 50) return { title: '🌿 Fruit Tree', style: 'bg-teal-500/20 text-teal-400 border-teal-500/30' };
    if (score >= 25) return { title: '🌱 Sprout Steward', style: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
    return { title: '🌾 Seedling', style: 'bg-slate-800 text-slate-400 border-slate-700/60' };
  };

  if (loading) return <p className="text-xs text-slate-500 font-mono text-center py-4">Compiling community impact data...</p>;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4 text-left backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <div>
          <h3 className="font-serif text-md font-bold text-white">Bioregional Hall of Fame</h3>
          <p className="text-[11px] text-slate-400">Honoring the citizens investing the most energy into our local economy.</p>
        </div>
        <button onClick={fetchLeaderboard} className="text-[10px] font-mono text-emerald-400 hover:underline">⟳ Sync</button>
      </div>

      <div className="space-y-2">
        {leaders.map((leader, index) => {
          const rank = getStewardRank(leader.stewardship_score);
          const isTopThree = index < 3;

          return (
            <div 
              key={leader.wallet_address} 
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                isTopThree ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-900/20 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Visual Rank Placement Numbers */}
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-mono font-black ${
                  index === 0 ? 'bg-amber-400 text-slate-950 shadow-md' :
                  index === 1 ? 'bg-slate-300 text-slate-950' :
                  index === 2 ? 'bg-amber-600 text-white' : 'text-slate-500'
                }`}>
                  {index + 1}
                </span>

                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-300 font-medium">
                    {leader.wallet_address.slice(0, 6)}...{leader.wallet_address.slice(-6)}
                  </span>
                  <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border mt-1 font-bold w-max ${rank.style}`}>
                    {rank.title}
                  </span>
                </div>
              </div>

              {/* Dynamic Stewardship Score Display */}
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-emerald-400">{leader.stewardship_score}</span>
                <span className="block text-[8px] font-mono uppercase tracking-wider text-slate-500 font-bold">Steward Points</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}