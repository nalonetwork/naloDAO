'use client';

import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Dynamically import the core toolkit and modules helper packages
      const sdkModules = await import('@creit.tech/stellar-wallets-kit/sdk');
      const utilsModules = await import('@creit.tech/stellar-wallets-kit/modules/utils');
      
      // Resolve the true class constructors
      const KitClass = (sdkModules as any).StellarWalletsKit || (sdkModules as any).default?.StellarWalletsKit;
      const getDefaultModules = (utilsModules as any).defaultModules || (utilsModules as any).default?.defaultModules;

      if (!KitClass) {
        throw new Error("Could not locate StellarWalletsKit module properties.");
      }

      // 2. Initialize the static controller with the open-source wallet presets
      KitClass.init({
        modules: getDefaultModules ? getDefaultModules() : []
      });

      // 3. Launch the modal popup layout card container
      await KitClass.openModal({
        onWalletSelected: async (option: any) => {
          try {
            // Assign selection
            KitClass.setWallet(option.id);
            
            // 4. Request public address key string from the active session
            const { address } = await KitClass.getAddress();
            setWalletAddress(address);

            // 5. Stream the actual Mainnet address to your Supabase users SQL grid
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
          } catch (innerErr) {
            console.error("Failed managing user address resolution inside selection callback:", innerErr);
          }
        }
      });

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
    <div>
      {walletAddress ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono bg-slate-900 border border-emerald-500/20 px-3 py-1 rounded-md">
            Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
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
          {isConnecting ? 'Opening Connect Card...' : 'Connect Stellar Wallet'}
        </button>
      )}
    </div>
  );
}