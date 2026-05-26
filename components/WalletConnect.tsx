'use client';

import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Dynamically import the core library and utils at click-time
      const modules = await import('@creit.tech/stellar-wallets-kit/sdk');
      const utils = await import('@creit.tech/stellar-wallets-kit/utils');
      const modulesUtils = await import('@creit.tech/stellar-wallets-kit/modules/utils');
      
      // Extract the core static class controller and modules
      const KitClass = (modules as any).StellarWalletsKit || (modules as any).default?.StellarWalletsKit;
      const WalletNetwork = (utils as any).WalletNetwork || (utils as any).default?.WalletNetwork;
      const getDefaultModules = (modulesUtils as any).defaultModules || (modulesUtils as any).default?.defaultModules;

      if (!KitClass) {
        throw new Error("Could not locate StellarWalletsKit static class engine.");
      }

      // 2. Initialize the static controller targeting the live Stellar Public Mainnet
      KitClass.init({
        network: WalletNetwork?.PUBLIC || 'public',
        modules: getDefaultModules ? getDefaultModules() : [] // Injects LOBSTR QR and standard protocols
      });

      // 3. Open the static visual selection card modal wrapper
      await KitClass.openModal({
        onWalletSelected: async (option: any) => {
          try {
            // Assign the choice provider option
            KitClass.setWallet(option.id);
            
            // Extract public address key securely from user approval action
            const { address } = await KitClass.getAddress();
            setWalletAddress(address);

            // 4. Record directly to your Supabase SQL Row ledger
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