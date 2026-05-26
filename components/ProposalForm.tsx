'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Self-contained connection instance to prevent path errors
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

    // Calculate voting end date based on form dropdown select parameters
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + parseInt(days));

    try {
      const { error } = await supabase
        .from('proposals')
        .insert([
          {
            title,
            description,
            creator_wallet: 'NaloDAO Admin Administered', // Temporary hardcode placeholder until we map global session state
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
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Create Governance Proposal</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Proposal Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Allocate 50,000 XLM to Community Liquidity Pool"
            className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description / Blueprint Details</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a thorough overview of the proposed strategic transaction parameters..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Voting Duration</label>
          <select 
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="3">3 Days (Accelerated Vote)</option>
            <option value="7">7 Days (Standard Cycle)</option>
            <option value="14">14 Days (Extended Deliberation)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition"
        >
          {status === 'saving' ? 'Broadcasting Proposal...' : 'Submit Proposal to Ledger'}
        </button>

        {status === 'success' && (
          <p className="text-sm text-emerald-400 text-center mt-2">✓ Proposal successfully synchronized and live for public voting!</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400 text-center mt-2">❌ Database submission rejected. Check network configurations.</p>
        )}
      </form>
    </div>
  );
}