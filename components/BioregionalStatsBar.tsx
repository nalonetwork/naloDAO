'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function BioregionalStatsBar() {
  const [stats, setStats] = useState({
    total_circulating_capital: 0,
    active_resource_logs: 0,
    community_inputs_logged: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bioregional_stats')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error reading community stats view:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-16 w-full max-w-5xl mx-auto bg-slate-950/40 animate-pulse rounded-xl border border-slate-900" />;

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      
      {/* Metric Card 1: Economic Autonomy */}
      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-4 text-left shadow-xl backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-full w-[2px] bg-emerald-500/40 group-hover:bg-emerald-400 transition duration-150" />
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-md shrink-0 shadow-inner">
          💰
        </div>
        <div>
          <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Ecosystem Circulation</span>
          <span className="text-lg font-black font-mono text-white tracking-tight">
            ${parseFloat(stats.total_circulating_capital.toString()).toFixed(2)}
            <span className="text-[10px] text-emerald-400 ml-1 font-bold select-none">USDC</span>
          </span>
          <p className="text-[10px] text-slate-400 font-light mt-0.5 leading-tight">Capital retained locally within our community loops.</p>
        </div>
      </div>

      {/* Metric Card 2: Waste Diversion Log */}
      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-4 text-left shadow-xl backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-full w-[2px] bg-amber-500/40 group-hover:bg-amber-400 transition duration-150" />
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-md shrink-0 shadow-inner">
          🌾
        </div>
        <div>
          <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Resource Recoveries</span>
          <span className="text-lg font-black font-mono text-white tracking-tight">
            {stats.active_resource_logs} <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider ml-0.5">Active Logs</span>
          </span>
          <p className="text-[10px] text-slate-400 font-light mt-0.5 leading-tight">Agricultural gluts and materials saved from waste streams.</p>
        </div>
      </div>

      {/* Metric Card 3: Governance Activity */}
      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-4 text-left shadow-xl backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-full w-[2px] bg-purple-500/40 group-hover:bg-purple-400 transition duration-150" />
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-md shrink-0 shadow-inner">
          🗳️
        </div>
        <div>
          <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Consensus Signature Weight</span>
          <span className="text-lg font-black font-mono text-white tracking-tight">
            {stats.community_inputs_logged} <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider ml-0.5">Verified Votes</span>
          </span>
          <p className="text-[10px] text-slate-400 font-light mt-0.5 leading-tight">Unique cryptographic protocol inputs recorded on the ledger.</p>
        </div>
      </div>

    </div>
  );
}