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
            is_verified: false
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
    <div className="w-full max-w-xl mx-auto bg-[#0b0f13] border border-slate-800/80 p-6 rounded-xl shadow-2xl relative overflow-hidden text-slate-200">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-purple-500" />
      <div className="text-left">
        <h2 className="text-base font-bold uppercase tracking-wider text-white">Join NaloDAO Circular Economy</h2>
        <p className="text-xs text-slate-500 font-light mt-0.5 leading-relaxed">List your sustainable business and accept direct, compliant stablecoin payments.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 mt-6 text-left">
        <div className="space-y-1">
          <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Official Business Name</label>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition">
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" placeholder="e.g., The Regenerative Cafe" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Regenerative Mission Statement</label>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition">
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700 resize-none leading-relaxed" placeholder="Explain how your supply loops align with Earth Care, People Care, and Fair Share..." required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Category</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 focus-within:border-emerald-500/60 transition">
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-transparent text-white text-xs focus:outline-none cursor-pointer">
                <option value="Agriculture" className="bg-slate-950">Permaculture</option>
                <option value="Eco-Retail" className="bg-slate-950">Zero Waste</option>
                <option value="Energy" className="bg-slate-950">Clean Energy</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Operating City</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition">
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" placeholder="e.g., Portland" required />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">ISO Country</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition">
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} maxLength={2} className="w-full bg-transparent text-white text-xs font-mono uppercase tracking-widest focus:outline-none placeholder-slate-700" placeholder="US" required />
            </div>
          </div>
        </div>

        <button type="submit" disabled={status === 'saving'} className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-widest py-3.5 rounded-lg transition hover:brightness-110 active:scale-[0.99] shadow-lg shadow-emerald-500/5">
          {status === 'saving' ? 'Publishing Registry Record...' : 'Deploy Business Identity'}
        </button>

        {status === 'success' && <p className="text-[10px] font-mono font-bold text-emerald-400 text-center mt-2 uppercase tracking-wider">✓ Profile live! Identity loaded into registry tracks.</p>}
        {status === 'no_wallet' && <p className="text-[10px] font-mono font-bold text-yellow-400 text-center mt-2 uppercase tracking-wider">⚠️ Address not registered. Connect passport handle first!</p>}
        {status === 'error' && <p className="text-[10px] font-mono font-bold text-red-400 text-center mt-2 uppercase tracking-wider">❌ Registry entry rejected. Try again.</p>}
      </form>
    </div>
  );
}