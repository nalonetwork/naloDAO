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
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    try {
      // 1. Dynamically access the active toolkit instance variables 
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const address = await KitClass.getAddress();
      const derivedWallet = typeof address === 'string' ? address : address[0]?.address || address.address;

      if (!derivedWallet) {
        alert("Please connect your LOBSTR wallet before registering your business profile.");
        setStatus('idle');
        return;
      }

      // 2. Insert the structured entry straight into the secure Supabase ledger grid
      const { error } = await supabase
        .from('merchants')
        .upsert([
          {
            owner_wallet: derivedWallet,
            business_name: name,
            description: desc,
            category: category,
            city: city,
            country_code: country,
            is_verified: false // Set to false initially until the DAO votes to approve it
          }
        ], { onConflict: 'owner_wallet' });

      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error("Merchant onboarding operation aborted:", err);
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
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500" required />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Regenerative Mission Statement</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none" required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500">
              <option value="Agriculture">Permaculture</option>
              <option value="Eco-Retail">Zero Waste</option>
              <option value="Energy">Clean Energy</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Operating City</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">ISO Country</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} maxLength={2} placeholder="US" className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 uppercase" required />
          </div>
        </div>

        <button type="submit" disabled={status === 'saving'} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm transition">
          {status === 'saving' ? 'Publishing Registry Record...' : 'Deploy Business Identity'}
        </button>

        {status === 'success' && <p className="text-xs text-emerald-400 text-center">✓ Profile live! Your listing is now ready for DAO voting verification.</p>}
        {status === 'error' && <p className="text-xs text-red-400 text-center">❌ Registry database entry rejected. Try again.</p>}
      </form>
    </div>
  );
}