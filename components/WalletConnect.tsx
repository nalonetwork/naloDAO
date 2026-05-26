'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // On mount, look for an active, authenticated passport session in local state storage
  useEffect(() => {
    const savedAddress = localStorage.getItem('nalo_passport_address');
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const handlePassportAuthentication = async () => {
    setIsConnecting(true);
    try {
      // Import the lightweight web intent module dynamically
      const albedoModule = await import('@albedo-link/intent');
      const albedo = albedoModule.default;

      // Request a public identity key authentication session
      const res = await albedo.publicKey({});
      const address = res.pubkey;

      if (address && address.startsWith('G')) {
        setWalletAddress(address);
        localStorage.setItem('nalo_passport_address', address);

        // Synchronize the verified browser identity to your Supabase users cloud ledger
        const { error: dbError } = await supabase
          .from('users')
          .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

        if (dbError) {
          console.error("Cloud registration failed:", dbError.message);
        } else {
          console.log("Success! Economy Passport mapped cleanly to Supabase ledger layers.");
        }
      }
    } catch (err: any) {
      console.error("Passport authentication aborted:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('nalo_passport_address');
  };

  return (
    <div className="flex items-center justify-center">
      {walletAddress ? (
        <div className="flex items-center gap-3 bg-slate-900/90 border border-emerald-500/20 pl-3 pr-2 py-1.5 rounded-xl shadow-md">
          <div className="flex flex-col items-start text-left">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold">Active Passport</span>
            <span className="text-xs text-emerald-400 font-mono">
              {walletAddress.slice(0, 5)}...{walletAddress.slice(-5)}
            </span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-[10px] font-mono px-2.5 py-2 rounded-lg transition-all duration-150"
          >
            Exit
          </button>
        </div>
      ) : (
        <button
          onClick={handlePassportAuthentication}
          disabled={isConnecting}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-500/10 active:scale-95"
        >
          {isConnecting ? 'Opening Secure Portal...' : 'Get My Economy Passport 🌱'}
        </button>
      )}
    </div>
  );
}