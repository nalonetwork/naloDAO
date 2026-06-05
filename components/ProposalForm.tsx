'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProposalForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState('7');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setStatus('saving');

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + parseInt(days));

    try {
      const { error } = await supabase
        .from('proposals')
        .insert([
          {
            title,
            description,
            creator_wallet: 'NaloDAO Admin Administered',
            ends_at: endsAt.toISOString()
          }
        ]);

      if (error) throw error;

      setStatus('success');
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error("Failed to post proposal:", err);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0b0f13] border border-slate-800/80 p-6 rounded-xl shadow-2xl relative overflow-hidden text-slate-200">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-purple-500" />
      <div className="text-left">
        <h2 className="text-base font-bold uppercase tracking-wider text-white">Create Governance Proposal</h2>
        <p className="text-xs text-slate-500 font-light mt-0.5 leading-relaxed">Broadcast transaction frameworks or structural parameters directly onto the public ledger blocks.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-6 text-left">
        <div className="space-y-1">
          <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Proposal Title</label>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Allocate 50,000 XLM to Community Liquidity Pool"
              className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Description / Blueprint Details</label>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition">
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a thorough overview of the proposed strategic transaction parameters..."
              rows={4}
              className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700 resize-none leading-relaxed"
              required
            />
          </div>
        </div>

        <div className="space-y-1 font-mono text-xs">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Voting Duration</label>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 focus-within:border-emerald-500/60 transition">
            <select 
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="3" className="bg-slate-950">3 Days (Accelerated Vote)</option>
              <option value="7" className="bg-slate-950">7 Days (Standard Cycle)</option>
              <option value="14" className="bg-slate-950">14 Days (Extended Deliberation)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-widest py-3.5 rounded-lg transition hover:brightness-110 active:scale-[0.99] shadow-lg shadow-emerald-500/5"
        >
          {status === 'saving' ? 'Broadcasting Proposal...' : 'Submit Proposal to Ledger'}
        </button>

        {status === 'success' && (
          <p className="text-[10px] font-mono font-bold text-emerald-400 text-center mt-2 uppercase tracking-wider">✓ Proposal synchronized live for public voting!</p>
        )}
        {status === 'error' && (
          <p className="text-[10px] font-mono font-bold text-red-400 text-center mt-2 uppercase tracking-wider">❌ Entry rejected. Check network configurations.</p>
        )}
      </form>
    </div>
  );
}