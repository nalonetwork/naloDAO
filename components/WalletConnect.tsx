'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Dynamic import at runtime to keep Turbopack happy
      const kitModule = await import('@creit.tech/stellar-wallets-kit');
      const KitEngine: any = kitModule.StellarWalletsKit || (kitModule as any).default?.StellarWalletsKit;

      if (!KitEngine) throw new Error("StellarWalletsKit not found");

      // 2. Initialize targeting the live Mainnet
      try {
        KitEngine.init({ network: 'public', modules: [] });
      } catch (e) {
        // Already initialized
      }

      // 3. Set LOBSTR as our designated provider
      KitEngine.setWallet('lobstr');

      // 4. Request the public key address string securely from the wallet
      const sessionData = await KitEngine.getAddress();
      const address = sessionData?.address || sessionData;

      if (address && typeof address === 'string') {
        setWalletAddress(address);

        // 5. Sync directly to your Supabase users SQL grid row
        const { error: dbError } = await supabase
          .from('users')
          .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

        if (dbError) {
          console.error("Database registration rejected:", dbError.message);
        } else {
          console.log("Success! Wallet address synchronized with Supabase.");
        }
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err?.message || err);
      alert("Make sure your LOBSTR browser extension is unlocked and active, or try again!");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {walletAddress ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono bg-slate-900 border border-emerald-500/20 px-3 py-1 rounded-md">
            Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <button onClick={disconnectWallet} className="text-xs text-red-400 underline hover:text-red-300 transition">
            Disconnect Session
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting LOBSTR...' : 'Connect LOBSTR Wallet'}
        </button>
      )}
    </div>
  );
}