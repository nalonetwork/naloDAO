'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);

  const connectWithAlbedoWebWallet = async () => {
    try {
      // Load the web-native secure pop-up engine
      const albedo = (await import('@albedo-link/intent')).default;
      
      // Request secure browser session key authorization
      const res = await albedo.publicKey({});
      const address = res.pubkey;

      if (address && address.startsWith('G')) {
        finalizeWalletSession(address, 'Albedo Web Wallet');
      }
    } catch (err: any) {
      console.error("Albedo authentication rejected:", err);
      alert("Web wallet connection closed.");
    }
  };

  const connectWithLobstrExtension = async () => {
    try {
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const utilsModule = await import('@creit.tech/stellar-wallets-kit/modules/utils');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;
      const getDefaultModules: any = utilsModule.defaultModules || (utilsModule as any).default?.defaultModules;

      if (!KitClass) throw new Error("StellarWalletsKit missing");

      try {
        KitClass.init({ network: 'public', modules: getDefaultModules ? getDefaultModules() : [] });
      } catch (e) {}

      KitClass.setWallet('lobstr');
      const sessionData = await KitClass.getAddress();
      
      let address = '';
      if (typeof sessionData === 'string') address = sessionData;
      else if (Array.isArray(sessionData) && sessionData[0]) address = sessionData[0]?.address || sessionData[0];
      else if (sessionData && typeof sessionData === 'object') address = sessionData.address || sessionData.publicKey || '';

      if (address && address.startsWith('G')) {
        finalizeWalletSession(address, 'LOBSTR Extension');
      } else {
        throw new Error("No address provided from extension context.");
      }
    } catch (err: any) {
      console.error("LOBSTR tracking failed, routing to Web Wallet fallback:", err);
      // Automatically run fallback if the extension throws an error or is missing!
      await connectWithAlbedoWebWallet();
    }
  };

  const finalizeWalletSession = async (address: string, type: string) => {
    setWalletAddress(address);
    setWalletType(type);

    // Synchronize user profile rows to your Supabase ledger
    const { error: dbError } = await supabase
      .from('users')
      .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

    if (dbError) console.error("Session sync rejected:", dbError.message);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletType(null);
  };

  const triggerUnifiedOnboarding = async () => {
    setIsConnecting(true);
    // Attempt the premium extension link. If it fails, it instantly opens the Albedo Web creation window!
    await connectWithLobstrExtension();
    setIsConnecting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl max-w-sm mx-auto">
      {walletAddress ? (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
            Securely Authenticated via {walletType}
          </span>
          <span className="text-xs text-emerald-400 font-mono bg-slate-950 border border-emerald-500/20 px-3 py-1 rounded-md">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
          </span>
          <button 
            onClick={disconnectWallet} 
            className="text-[11px] text-red-400 underline hover:text-red-300 transition mt-1"
          >
            Disconnect Passport
          </button>
        </div>
      ) : (
        <div className="space-y-3 w-full">
          <button
            onClick={triggerUnifiedOnboarding}
            disabled={isConnecting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50 text-sm"
          >
            {isConnecting ? 'Awaiting Passport Verification...' : 'Connect Passport Wallet'}
          </button>
          
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800/60"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-slate-600">New To Web3?</span>
            <div className="flex-grow border-t border-slate-800/60"></div>
          </div>

          <button
            onClick={connectWithAlbedoWebWallet}
            disabled={isConnecting}
            className="w-full bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 font-medium px-4 py-2.5 rounded-xl text-xs transition"
          >
            ✨ Create Instant Web Wallet (No Downloads Required)
          </button>
        </div>
      )}
    </div>
  );
}