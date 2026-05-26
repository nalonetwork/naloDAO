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

  // Synchronize authenticated addresses down to the state layers and Supabase
  const saveAuthenticatedSession = async (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('nalo_wallet_address', address);

    const { error: dbError } = await supabase
      .from('users')
      .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

    if (dbError) console.error("Session database sync rejected:", dbError.message);
  };

  useEffect(() => {
    // Retain persistent address records across browser reloads
    const savedAddress = localStorage.getItem('nalo_wallet_address');
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }

    const loadAndInjectModalButton = async () => {
      if (isInitializedRef.current || !containerRef.current) return;
      isInitializedRef.current = true;

      try {
        // 1. Dynamic imports of official v2 module targets
        const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
        const utilsModule = await import('@creit.tech/stellar-wallets-kit/modules/utils');

        const Kit: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;
        const getDefaultModules: any = utilsModule.defaultModules || (utilsModule as any).default?.defaultModules;

        if (!Kit) return;

        // 2. Clear lingering processes and initialize targeting mainnet
        try {
          Kit.init({
            network: 'public',
            modules: getDefaultModules ? getDefaultModules() : []
          });
        } catch (e) {
          // Already initialized
        }

        // 3. Inject the official button directly into our DOM layout container ref
        if (containerRef.current) {
          containerRef.current.innerHTML = ''; // Sanitize container
          Kit.createButton(containerRef.current);
        }

        // 4. Set up an open data listener. The moment any wallet or web passport connects, this captures it!
        const interval = setInterval(async () => {
          try {
            const session = await Kit.getAddress();
            const address = typeof session === 'string' ? session : session?.address || session[0]?.address;
            
            if (address && address.startsWith('G')) {
              saveAuthenticatedSession(address);
              clearInterval(interval);
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
  }, []);

  const handleDisconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('nalo_wallet_address');
    // Force a minor page state reload to safely wipe the library container cache
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {walletAddress ? (
        <div className="flex items-center gap-3 bg-slate-900/90 border border-emerald-500/20 pl-3 pr-2 py-1.5 rounded-xl shadow-xl">
          <div className="flex flex-col items-start text-left">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold">
              Account Passport Connected
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
        /* The official UI framework modal button gets dynamically painted right into this div */
        <div 
          ref={containerRef} 
          className="[&>button]:bg-emerald-500 [&>button]:hover:bg-emerald-600 [&>button]:!text-slate-950 [&>button]:font-extrabold [&>button]:px-6 [&>button]:py-3 [&>button]:!rounded-xl [&>button]:text-sm [&>button]:transition-all [&>button]:duration-200 [&>button]:shadow-lg [&>button]:shadow-emerald-500/10 [&>button]:active:scale-95"
        />
      )}
    </div>
  );
}