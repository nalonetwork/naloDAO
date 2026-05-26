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
      // 1. Target the exact sub-paths defined by the v2 SDK
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const utilsModule = await import('@creit.tech/stellar-wallets-kit/modules/utils');

      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;
      const getDefaultModules: any = utilsModule.defaultModules || (utilsModule as any).default?.defaultModules;

      if (!KitClass) throw new Error("StellarWalletsKit class engine not found");

      // 2. Initialize the static controller with ALL default modules registered
      try {
        KitClass.init({
          modules: getDefaultModules ? getDefaultModules() : []
        });
      } catch (e) {
        // Quietly catch if it's already initialized by another frame
      }

      // 3. Set your active target to LOBSTR
      KitClass.setWallet('lobstr');

      // 4. Request the public key string safely from the extension channel
      const sessionData = await KitClass.getAddress();
      
      let address = '';
      if (typeof sessionData === 'string') {
        address = sessionData;
      } else if (Array.isArray(sessionData) && sessionData[0]) {
        address = sessionData[0]?.address || sessionData[0];
      } else if (sessionData && typeof sessionData === 'object') {
        address = sessionData.address || sessionData.publicKey || '';
      }

      // 5. If data formats validate, sync directly to your Supabase users table rows
      if (address && typeof address === 'string' && address.startsWith('G')) {
        setWalletAddress(address);

        const { error: dbError } = await supabase
          .from('users')
          .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

        if (dbError) {
          console.error("Database registration rejected:", dbError.message);
        } else {
          console.log("Success! Wallet address synchronized with Supabase SQL ledger.");
        }
      } else {
        throw new Error("Received an unparsable wallet format from the extension layers.");
      }

    } catch (err: any) {
      console.error("Wallet connection failed:", err?.message || err);
      alert(`Connection failed: ${err?.message || "Make sure your LOBSTR browser extension is unlocked."}`);
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
          {isConnecting ? 'Connecting LOBSTR...' : 'Connect LOBSTR Wallet'}
        </button>
      )}
    </div>
  );
}