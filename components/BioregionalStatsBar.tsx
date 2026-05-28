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
    // Set up a background pulse to refresh the indicators every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-16 w-full bg-slate-900/20 animate-pulse rounded-xl border border-slate-900" />;

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      
      {/* Metric Card 1: Economic Autonomy */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 text-left shadow-lg backdrop-blur-sm">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0">
          💰
        </div>
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Ecosystem Circulation</span>
          <span className="text-xl font-bold font-mono text-white">
            ${parseFloat(stats.total_circulating_capital.toString()).toFixed(2)}
            <span className="text-xs text-emerald-400 ml-1">USDC</span>
          </span>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">Capital retained locally within our community loops.</p>
        </div>
      </div>

      {/* Metric Card 2: Waste Diversion Log */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 text-left shadow-lg backdrop-blur-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0">
          🌾
        </div>
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Resource Recoveries</span>
          <span className="text-xl font-bold font-mono text-white">
            {stats.active_resource_logs} <span className="text-xs text-amber-300 font-normal">Active Logs</span>
          </span>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">Agricultural gluts and materials saved from waste streams.</p>
        </div>
      </div>

      {/* Metric Card 3: Governance Activity */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 text-left shadow-lg backdrop-blur-sm">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-lg shrink-0">
          🗳️
        </div>
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Consensus Signature Weight</span>
          <span className="text-xl font-bold font-mono text-white">
            {stats.community_inputs_logged} <span className="text-xs text-teal-400 font-normal">Verified Votes</span>
          </span>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">Unique cryptographic protocol inputs recorded on the ledger.</p>
        </div>
      </div>

    </div>
  );
}