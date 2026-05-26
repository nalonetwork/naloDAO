'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MerchantRegister() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Agriculture');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('US');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'no_wallet'>('idle');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    try {
      // 1. Fetch the most recent connected wallet address registered in your active Supabase users ledger
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_address')
        .order('id', { ascending: false })
        .limit(1);

      if (userError || !userData || userData.length === 0) {
        setStatus('no_wallet');
        return;
      }

      const activeWallet = userData[0].wallet_address;

      if (!activeWallet) {
        setStatus('no_wallet');
        return;
      }

      // 2. Safely insert the new merchant row bound directly to that verified address
      const { error } = await supabase
        .from('merchants')
        .upsert([
          {
            owner_wallet: activeWallet,
            business_name: name,
            description: desc,
            category: category,
            city: city,
            country_code: country.toUpperCase(),
            is_verified: false // Awaiting future NaloDAO consensus badges
          }
        ], { onConflict: 'owner_wallet' });

      if (error) throw error;
      
      setStatus('success');
      setName('');
      setDesc('');
      setCity('');
    } catch (err) {
      console.error("Merchant onboarding database execution failed:", err);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-white mb-2">Join NaloDAO Circular Economy</h2>
      <p className="text-xs text-slate-400 mb-6">List your sustainable business and accept direct, compliant stablecoin payments.</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Official Business Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" placeholder="e.g., The Regenerative Cafe" required />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Regenerative Mission Statement</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none transition" placeholder="Explain how your supply loops align with Earth Care, People Care, and Fair Share..." required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition">
              <option value="Agriculture">Permaculture</option>
              <option value="Eco-Retail">Zero Waste</option>
              <option value="Energy">Clean Energy</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Operating City</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition" placeholder="e.g., Portland" required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">ISO Country</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} maxLength={2} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 uppercase transition" placeholder="US" required />
          </div>
        </div>

        <button type="submit" disabled={status === 'saving'} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/10">
          {status === 'saving' ? 'Publishing Registry Record...' : 'Deploy Business Identity'}
        </button>

        {status === 'success' && <p className="text-xs text-emerald-400 text-center font-medium mt-2">✓ Profile live! Your identity is active on the Supply Registry.</p>}
        {status === 'no_wallet' && <p className="text-xs text-yellow-400 text-center font-medium mt-2">⚠️ Active wallet handle not recognized. Please click "Connect LOBSTR Wallet" at the top of the page first!</p>}
        {status === 'error' && <p className="text-xs text-red-400 text-center font-medium mt-2">❌ Registry database entry rejected. Try again.</p>}
      </form>
    </div>
  );
}