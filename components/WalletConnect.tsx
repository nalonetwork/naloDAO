'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
// Import the kit directly at the top—this completely stops Turbopack from losing module functions
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';

// Self-contained Supabase initialization config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const kitRef = useRef<StellarWalletsKit | null>(null);

  useEffect(() => {
    // Safely instantiate the kit instance once the component mounts inside the browser window
    if (!kitRef.current) {
      kitRef.current = new StellarWalletsKit({
        network: 'public', // Points directly to live LOBSTR Mainnet frequencies
        modules: defaultModules() // Injects out-of-the-box LOBSTR QR layout protocols
      });
    }
  }, []);

  const handleConnect = async () => {
    if (!kitRef.current) return;
    setIsConnecting(true);

    try {
      // Open the visual wallet card overlay using the persistent instance reference safely
      const { address } = await kitRef.current.openModal({
        onClosed: () => console.log("Connection modal closed"),
        onWalletSelected: async (option: any) => {
          kitRef.current?.setWallet(option.id);
          return option.id;
        }
      });

      if (address) {
        setWalletAddress(address);

        // Record the address directly to your Supabase users table rows grid ledger
        const { error: dbError } = await supabase
          .from('users')
          .upsert(
            { wallet_address: address }, 
            { onConflict: 'wallet_address' }
          );

        if (dbError) {
          console.error("Database registration rejected:", dbError.message);
        } else {
          console.log("Success! Real wallet address synchronized with Supabase SQL ledger.");
        }
      }

    } catch (err: any) {
      console.error("Stellar wallet connection canceled or failed:", err?.message || err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {walletAddress ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono bg-slate-900 border border-emerald-500/20 px-3 py-1 rounded-md">
            Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <button 
            onClick={disconnectWallet}
            className="text-xs text-red-400 underline hover:text-red-300 transition"
          >
            Disconnect Session
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          {isConnecting ? 'Opening Wallet Modal...' : 'Connect Stellar Wallet'}
        </button>
      )}
    </div>
  );
}