'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function GuildBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [type, setType] = useState('SURPLUS');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const fetchNotices = async () => {
    const { data } = await supabase.from('guild_notices').select('*').order('created_at', { ascending: false });
    setNotices(data || []);
  };

  useEffect(() => { fetchNotices(); }, []);

  const postNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    const wallet = localStorage.getItem('nalo_wallet_address') || 'Anonymous Steward';

    const { error } = await supabase.from('guild_notices').insert([{
      owner_wallet: wallet,
      notice_type: type,
      title,
      details,
      contact_info: contact
    }]);

    if (!error) {
      setStatus('success');
      setTitle('');
      setDetails('');
      setContact('');
      fetchNotices();
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-4 items-start">
      {/* Creation form column */}
      <form onSubmit={postNotice} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 text-left shadow-md">
        <h3 className="text-sm font-bold text-white">Broadcast Bioregional Status</h3>
        
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Notice Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-2 py-2 rounded-xl focus:outline-none">
            <option value="SURPLUS">🥕 [SURPLUS] We Have Resource Glut</option>
            <option value="WANTED">🔍 [WANTED] Sourcing Local Demand</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 50 lbs Organic Tomatoes" className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none" required />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Details</label>
          <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Provide details on quantity, organic parameters, or terms..." className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none resize-none" required />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Contact Routing Handle</label>
          <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g., Signal: @farmroots or phone number" className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none" required />
        </div>

        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-2 rounded-xl transition">
          {status === 'saving' ? 'Broadcasting...' : 'Publish to Guild Board'}
        </button>
        {status === 'success' && <p className="text-[10px] text-emerald-400 text-center font-mono">✓ Broadcast successfully compiled!</p>}
      </form>

      {/* Grid listing column */}
      <div className="md:col-span-2 space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-start justify-between gap-4 text-left">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  n.notice_type === 'SURPLUS' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {n.notice_type}
                </span>
                <h4 className="text-sm font-bold text-white">{n.title}</h4>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{n.details}</p>
              <div className="text-[10px] font-mono text-slate-500 mt-2 flex gap-4">
                <span>📞 Router: {n.contact_info}</span>
                <span>👤 Source: {n.owner_wallet.slice(0,6)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}