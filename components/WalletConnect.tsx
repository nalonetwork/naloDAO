'use client';

import React, { useState, useEffect } from 'react';
// Import our secure Supabase bridge engine
import { supabase } from './supabaseClient';

declare global {
  interface Window {
    lobstr?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
    };
  }
}

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);

  useEffect(() => {
    // Check immediately if it's already there
    if (typeof window !== 'undefined' && window.lobstr) {
      setHasExtension(true);
      return;
    }

    // Otherwise, check every 100ms for up to 2 seconds while the browser loads extensions
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window !== 'undefined' && window.lobstr) {
        setHasExtension(true);
        clearInterval(interval);
      } else if (attempts >= 20) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (!window.lobstr) {
        window.open('https://lobstr.co/', '_blank');
        return;
      }

      // 1. Grab public key from the browser extension
      const publicKey = await window.lobstr.getPublicKey();
      setWalletAddress(publicKey);

      // 2. Sync with Supabase Database via UPSERT
      // This checks if the user exists; if not, it automatically creates a new row!
      const { error } = await supabase
        .from('users')
        .upsert(
          { wallet_address: publicKey }, 
          { onConflict: 'wallet_address' }
        );

      if (error) {
        console.error("Failed to sync member profile to database:", error.message);
      } else {
        console.log("Member successfully synchronized with NaloDAO database ledger.");
      }

   } catch (err: any) {
      console.error("LOBSTR connection failed:", err?.message || err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <div>
      {walletAddress ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono bg-slate-900 border border-emerald-500/20 px-3 py-1 rounded-md">
            LOBSTR Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <button 
            onClick={disconnectWallet}
            className="text-xs text-red-400 underline hover:text-red-300 transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          {!hasExtension 
            ? 'Install LOBSTR Wallet' 
            : isConnecting 
              ? 'Connecting...' 
              : 'Connect LOBSTR Wallet'
          }
        </button>
      )}
    </div>
  );
}