'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Reference hook to securely halt background loop tracks
  const kitInstanceRef = useRef<any>(null); // Retain active memory handle of the compiled SDK class object

  const saveAuthenticatedSession = async (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('nalo_wallet_address', address);

    const { error: dbError } = await supabase
      .from('users')
      .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

    if (dbError) console.error("Session database sync rejected:", dbError.message);
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem('nalo_wallet_address');
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }

    const loadAndInjectModalButton = async () => {
      if (isInitializedRef.current || !containerRef.current) return;
      isInitializedRef.current = true;

      try {
        const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
        const utilsModule = await import('@creit.tech/stellar-wallets-kit/modules/utils');

        const Kit: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;
        const getDefaultModules: any = utilsModule.defaultModules || (utilsModule as any).default?.defaultModules;

        if (!Kit) return;

        try {
          Kit.init({
            network: 'public',
            modules: getDefaultModules ? getDefaultModules() : []
          });
        } catch (e) {}

        // Save reference handle to the kit object so we can trigger methods on it later
        kitInstanceRef.current = Kit;

        if (containerRef.current) {
          containerRef.current.innerHTML = ''; 
          Kit.createButton(containerRef.current);
        }

        // Active lookup scanner connection loop
        intervalRef.current = setInterval(async () => {
          try {
            const session = await Kit.getAddress();
            const address = typeof session === 'string' ? session : session?.address || session[0]?.address;
            
            if (address && address.startsWith('G')) {
              saveAuthenticatedSession(address);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          } catch (e) {
            // Awaiting user selection interactions silently
          }
        }, 1500);

      } catch (err) {
        console.error("Failed to inject official kit trigger button:", err);
      }
    };

    loadAndInjectModalButton();

    // Cleanup loop tracking state on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleDisconnect = async () => {
    // 1. Permanently terminate our scanning loop thread first to prevent background checks
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 2. Clear out the library instance memory cache directly via its native destructor API
    try {
      if (kitInstanceRef.current && kitInstanceRef.current.disconnect) {
        await kitInstanceRef.current.disconnect();
      }
    } catch (err) {
      console.warn("Library cache structure already cleared:", err);
    }

    // 3. Purge the application hard disk storage and front-end states
    setWalletAddress(null);
    localStorage.removeItem('nalo_wallet_address');

    // 4. Force state tracking refresh to wipe lingering background instances clean
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {walletAddress ? (
        <div className="flex items-center gap-4 bg-slate-900 border border-emerald-500/20 pl-4 pr-3 py-2 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">
                Passport Verified
              </span>
              <span className="text-xs text-emerald-400 font-mono tracking-wider">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleDisconnect}
            className="bg-slate-950 hover:bg-red-500 hover:text-white border border-slate-800 hover:border-red-500 text-slate-400 text-xs font-mono px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 group flex items-center gap-1"
          >
            <span>Disconnect</span>
            <span className="text-[10px] opacity-60 group-hover:opacity-100">✕</span>
          </button>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="[&>button]:bg-emerald-500 [&>button]:hover:bg-emerald-600 [&>button]:!text-slate-950 [&>button]:font-extrabold [&>button]:px-6 [&>button]:py-3 [&>button]:!rounded-xl [&>button]:text-sm [&>button]:transition-all [&>button]:duration-200 [&>button]:shadow-lg [&>button]:shadow-emerald-500/10 [&>button]:active:scale-95"
        />
      )}
    </div>
  );
}