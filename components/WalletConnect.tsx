'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Auto-load active persistent sessions from local storage on component mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('nalo_wallet_address');
    const savedType = localStorage.getItem('nalo_wallet_type');
    if (savedAddress && savedType) {
      setWalletAddress(savedAddress);
      setWalletType(savedType);
    }
  }, []);

  const finalizeSession = async (address: string, type: string) => {
    setWalletAddress(address);
    setWalletType(type);
    localStorage.setItem('nalo_wallet_address', address);
    localStorage.setItem('nalo_wallet_type', type);
    setShowOptions(false);

    // Sync to your Supabase users relational cloud ledger
    const { error: dbError } = await supabase
      .from('users')
      .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

    if (dbError) console.error("Database sync rejected:", dbError.message);
  };

  const connectAlbedoPassport = async () => {
    try {
      const albedoModule = await import('@albedo-link/intent');
      const albedo = albedoModule.default;
      const res = await albedo.publicKey({});
      if (res.pubkey && res.pubkey.startsWith('G')) {
        finalizeSession(res.pubkey, 'Web Passport');
      }
    } catch (err) {
      console.error("Albedo authentication canceled.");
    }
  };

  const connectLobstrWallet = async () => {
    try {
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const utilsModule = await import('@creit.tech/stellar-wallets-kit/modules/utils');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;
      const getDefaultModules: any = utilsModule.defaultModules || (utilsModule as any).default?.defaultModules;

      if (!KitClass) throw new Error("StellarWalletsKit class not found");

      try {
        KitClass.init({ modules: getDefaultModules ? getDefaultModules() : [] });
      } catch (e) {}

      KitClass.setWallet('lobstr');
      const sessionData = await KitClass.getAddress();
      
      let address = '';
      if (typeof sessionData === 'string') address = sessionData;
      else if (Array.isArray(sessionData) && sessionData[0]) address = sessionData[0]?.address || sessionData[0];
      else if (sessionData && typeof sessionData === 'object') address = sessionData.address || sessionData.publicKey || '';

      if (address && address.startsWith('G')) {
        finalizeSession(address, 'LOBSTR Account');
      }
    } catch (err) {
      console.error("LOBSTR extension pipeline blocked or uninstalled.");
      alert("Could not pull LOBSTR metadata. Ensure your extension is unlocked, or use the Web Passport instead!");
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setWalletType(null);
    localStorage.removeItem('nalo_wallet_address');
    localStorage.removeItem('nalo_wallet_type');
  };

  return (
    <div className="relative flex flex-col items-center">
      {walletAddress ? (
        /* ACTIVE SESSION DASHBOARD VIEW */
        <div className="flex items-center gap-3 bg-slate-900/90 border border-emerald-500/20 pl-3 pr-2 py-1.5 rounded-xl shadow-xl">
          <div className="flex flex-col items-start text-left">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold">
              Connected via {walletType}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {walletAddress.slice(0, 5)}...{walletAddress.slice(-5)}
            </span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-[10px] font-mono px-2.5 py-2 rounded-lg transition-all"
          >
            Exit
          </button>
        </div>
      ) : (
        /* DISCONNECTED ACCOUNT CONNECT BUTTON TRIGGER */
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            {showOptions ? 'Close Connection Panel' : 'Connect My Account 🌱'}
          </button>

          {/* HIDDEN TIERED CHOICE SELECTION MODAL LAYER */}
          {showOptions && (
            <div className="absolute top-14 z-50 w-64 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl space-y-2 animate-fade-in">
              <button
                onClick={connectAlbedoPassport}
                className="w-full text-left bg-slate-950 hover:bg-slate-800/80 p-2.5 rounded-lg border border-slate-800/60 transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">✨ Web Economy Passport</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Instant browser account, zero downloads.</div>
              </button>

              <button
                onClick={connectLobstrWallet}
                className="w-full text-left bg-slate-950 hover:bg-slate-800/80 p-2.5 rounded-lg border border-slate-800/60 transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">🛡️ LOBSTR Wallet Link</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Connect your browser extension.</div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}