'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Embedded self-contained Supabase bridge configuration to avoid any path errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Dynamically import the modules to satisfy Turbopack development servers
      const kitModule = await import('@creit.tech/stellar-wallets-kit');
      const utilsModule = await import('@creit.tech/stellar-wallets-kit/modules/utils');

      // 2. Escape strict type checks by utilizing an "any" container signature mapping
      const KitEngine: any = kitModule.StellarWalletsKit || (kitModule as any).default?.StellarWalletsKit;
      const getDefaultModules: any = utilsModule.defaultModules || (utilsModule as any).default?.defaultModules;

      if (!KitEngine) {
        throw new Error("StellarWalletsKit module target could not be resolved.");
      }

      // 3. Fallback execution constructor routine handling instance vs static allocations safely
      let kitInstance: any;
      
      try {
        // Attempt Instance allocation format first
        kitInstance = new KitEngine({
          network: 'public',
          modules: getDefaultModules ? getDefaultModules() : []
        });
      } catch (e) {
        // Fallback to Static allocation configuration if instant creation is restricted
        KitEngine.init({
          network: 'public',
          modules: getDefaultModules ? getDefaultModules() : []
        });
        kitInstance = KitEngine;
      }

      // 4. Resolve the modal invocation method dynamically based on structural traits
      const openMethod = kitInstance.openModal ? kitInstance.openModal.bind(kitInstance) : KitEngine.openModal?.bind(KitEngine);

      if (!openMethod) {
        throw new Error("Could not extract a valid modal presentation handle from this library version.");
      }

      // 5. Open connection overlay panel view safely
      const result = await openMethod({
        onClosed: () => setIsConnecting(false),
        onWalletSelected: async (option: any) => {
          if (kitInstance.setWallet) kitInstance.setWallet(option.id);
          else if (KitEngine.setWallet) KitEngine.setWallet(option.id);
          return option.id;
        }
      });

      // 6. Extract address data records 
      const sessionData = result?.address ? result : (await (kitInstance.getAddress ? kitInstance.getAddress() : KitEngine.getAddress()));
      const address = sessionData?.address || sessionData;

      if (address && typeof address === 'string') {
        setWalletAddress(address);

        // Sync the mainnet address directly to your Supabase users SQL grid row
        const { error: dbError } = await supabase
          .from('users')
          .upsert(
            { wallet_address: address }, 
            { onConflict: 'wallet_address' }
          );

        if (dbError) {
          console.error("Database registration rejected:", dbError.message);
        } else {
          console.log("Success! Wallet address synchronized with Supabase SQL ledger.");
        }
      }

    } catch (err: any) {
      console.error("Stellar wallet connection lifecycle exception:", err?.message || err);
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
          {isConnecting ? 'Awaiting Connection...' : 'Connect Stellar Wallet'}
        </button>
      )}
    </div>
  );
}