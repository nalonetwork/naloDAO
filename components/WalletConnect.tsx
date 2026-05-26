'use client';

import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Dynamically import the kit and preset utils at click-time
      const modules = await import('@creit.tech/stellar-wallets-kit');
      const utils = await import('@creit.tech/stellar-wallets-kit/modules/utils');
      
      const KitConstructor = (modules as any).StellarWalletsKit || (modules as any).default?.StellarWalletsKit;
      const getDefaultModules = (utils as any).defaultModules || (utils as any).default?.defaultModules;

      if (!KitConstructor) {
        throw new Error("Could not locate StellarWalletsKit module constructor.");
      }

      // 2. Initialize targeting the live Stellar Mainnet ('public')
      const kit = new KitConstructor({
        network: 'public', // Changed to public mainnet to match your real LOBSTR account
        modules: getDefaultModules ? getDefaultModules() : [] // Injects LOBSTR QR and connection protocols
      });

      // 3. Deploy the visual connection menu selection card
      await kit.openModal({
        onWalletSelected: async (option: any) => {
          try {
            kit.setWallet(option.id);
            
            // 4. Extract public address key securely from user approval action
            const { address } = await kit.getAddress();
            setWalletAddress(address);

            // 5. Send real address row safely straight to your Supabase SQL layer
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