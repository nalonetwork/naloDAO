'use client';

import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Dynamically import the kit ONLY when the user clicks the button.
      // This completely stops Next.js Turbopack from breaking during build time!
      const { StellarWalletsKit, WalletNetwork, WalletType } = await import('@creit.tech/stellar-wallets-kit');

      const kit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        // This will create a clean UI modal supporting LOBSTR and other Stellar options
        selectedWallet: WalletType.LOBSTR
      });

      // 1. Request the public key string from the wallet layer
      const { address } = await kit.getAddress();
      setWalletAddress(address);

      // 2. Sync cleanly to your Supabase SQL Table
      const { error: dbError } = await supabase
        .from('users')
        .upsert(
          { wallet_address: address }, 
          { onConflict: 'wallet_address' }
        );

      if (dbError) {
        console.error("Database sync failed:", dbError.message);
      } else {
        console.log("Success! Wallet registered in Supabase SQL layer.");
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
          {isConnecting ? 'Connecting LOBSTR...' : 'Connect LOBSTR Wallet'}
        </button>
      )}
    </div>
  );
}