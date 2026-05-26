'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. EMBEDDED BRIDGE: This completely resolves the 2307 import error!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 2. Dynamic module loading to keep Next.js Turbopack fast and happy
      const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit');
      const { defaultModules } = await import('@creit.tech/stellar-wallets-kit/modules/utils');

      // 3. Instantiate the connection class instance (Targets Live Stellar Mainnet)
      const kit = new StellarWalletsKit({
        network: 'public', 
        modules: defaultModules() // Automatically handles QR codes for LOBSTR mobile users
      });

      // 4. Open the visual wallet card selection overlay
      await kit.openModal({
        onClosed: () => console.log("Connection modal closed by user"),
        onWalletSelected: async (option: any) => {
          try {
            // Register their chosen wallet provider
            kit.setWallet(option.id);
            
            // Extract the user's public address string from their approval action
            const sessionData = await kit.getAddress();
            const address = sessionData.address;
            
            if (address) {
              setWalletAddress(address);

              // 5. Send that real address straight to your Supabase users SQL table
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
          } catch (innerErr) {
            console.error("Failed parsing public key in selection callback:", innerErr);
          }
          return option.id;
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
          {isConnecting ? 'Opening Connect UI...' : 'Connect Stellar Wallet'}
        </button>
      )}
    </div>
  );
}