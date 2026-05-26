'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Embedded Supabase configuration to keep everything self-contained and path-error free
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Dynamic root import to keep Next.js Turbopack fast and happy
      const kitModule = await import('@creit.tech/stellar-wallets-kit');
      
      // Extract the core kit class as a flexible type to resolve errors 2554, 2339, and 2576
      const Kit: any = kitModule.StellarWalletsKit || (kitModule as any).default?.StellarWalletsKit;

      if (!Kit) {
        throw new Error("Could not extract StellarWalletsKit module from package root.");
      }

      // 2. Initialize using the static configuration format
      Kit.init({
        network: 'public', // Connects directly to live LOBSTR Mainnet account frequencies
        modules: []        // Uses the standard built-in core UI module configurations
      });

      // 3. Open the modal card layout utilizing the static structural loop
      await Kit.openModal({
        onClosed: () => console.log("Connection modal overlay dismissed"),
        onWalletSelected: async (option: any) => {
          try {
            // Assign the user's selected wallet choice parameter statically
            Kit.setWallet(option.id);
            
            // Extract public address key securely from the active session
            const sessionData = await Kit.getAddress();
            const address = sessionData?.address || sessionData;
            
            if (address && typeof address === 'string') {
              setWalletAddress(address);

              // 4. Record the mainnet address straight to your Supabase users SQL table grid
              const { error: dbError } = await supabase
                .from('users')
                .upsert(
                  { wallet_address: address }, 
                  { onConflict: 'wallet_address' }
                );

              if (dbError) {
                console.error("Database registration rejected:", dbError.message);
              } else {
                console.log("Success! Wallet registered in your Supabase cloud table ledger.");
              }
            }
          } catch (innerErr) {
            console.error("Error extracting public key inside selection loop:", innerErr);
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
          {isConnecting ? 'Opening Wallet Modal...' : 'Connect Stellar Wallet'}
        </button>
      )}
    </div>
  );
}