'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); 
  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const kitInstanceRef = useRef<any>(null); 

 // Pulls the active live Circle USDC balance directly from the raw Horizon JSON endpoint
  const fetchLiveUSDCBalance = async (address: string) => {
    if (!address) return;
    try {
      // 1. Fetch the raw, unmasked JSON account details directly from the public live ledger endpoint
      const response = await fetch(`https://horizon.stellar.org/accounts/${address}?cb=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Horizon API responded with status: ${response.status}`);
      }

      const accountData = await response.json();
      
      if (!accountData || !accountData.balances) {
        setUsdcBalance('0.00');
        return;
      }

      const circleIssuerKey = "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT".toLowerCase();

      // 2. Scan the raw JSON balances array using a bulletproof string check
      const targetAsset = accountData.balances.find((b: any) => {
        const hasUsdcCode = b.asset_code && b.asset_code.toUpperCase() === "USDC";
        const hasValidIssuer = b.asset_issuer && b.asset_issuer.toLowerCase() === circleIssuerKey;
        return hasUsdcCode && hasValidIssuer;
      });

      // 3. If found, parse and show the true ledger balance instantly
      if (targetAsset && targetAsset.balance) {
        const parsedBalance = parseFloat(targetAsset.balance).toFixed(2);
        setUsdcBalance(parsedBalance);
      } else {
        // Fallback: Check for any open alternative USDC parameters
        const alternateAsset = accountData.balances.find((b: any) => b.asset_code && b.asset_code.toUpperCase() === "USDC");
        if (alternateAsset && alternateAsset.balance) {
          setUsdcBalance(parseFloat(alternateAsset.balance).toFixed(2));
        } else {
          setUsdcBalance('0.00');
        }
      }
    } catch (err) {
      console.warn("Direct Horizon ledger fetch fallback:", err);
      setUsdcBalance('0.00');
    }
  };

  const saveAuthenticatedSession = async (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('nalo_wallet_address', address);
    
    // Trigger an immediate balance check the moment they connect
    fetchLiveUSDCBalance(address);

    const { error: dbError } = await supabase
      .from('users')
      .upsert({ wallet_address: address }, { onConflict: 'wallet_address' });

    if (dbError) console.error("Session database sync rejected:", dbError.message);
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem('nalo_wallet_address');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      fetchLiveUSDCBalance(savedAddress);

      // Set up a quiet background thread loop to update their balance every 10 seconds
      balanceIntervalRef.current = setInterval(() => {
        fetchLiveUSDCBalance(savedAddress);
      }, 10000);
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

        kitInstanceRef.current = Kit;

        if (containerRef.current) {
          containerRef.current.innerHTML = ''; 
          Kit.createButton(containerRef.current);
        }

        intervalRef.current = setInterval(async () => {
          try {
            const session = await Kit.getAddress();
            const address = typeof session === 'string' ? session : session?.address || session[0]?.address;
            
            if (address && address.startsWith('G')) {
              saveAuthenticatedSession(address);
              if (intervalRef.current) clearInterval(intervalRef.current);
              
              // Start the balance background loop thread for newly connected profiles
              balanceIntervalRef.current = setInterval(() => {
                fetchLiveUSDCBalance(address);
              }, 10000);
            }
          } catch (e) {}
        }, 1500);

      } catch (err) {
        console.error("Failed to inject official kit trigger button:", err);
      }
    };

    loadAndInjectModalButton();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (balanceIntervalRef.current) clearInterval(balanceIntervalRef.current);
    };
  }, []);

  const handleDisconnect = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (balanceIntervalRef.current) clearInterval(balanceIntervalRef.current);

    try {
      if (kitInstanceRef.current && kitInstanceRef.current.disconnect) {
        await kitInstanceRef.current.disconnect();
      }
    } catch (err) {}

    setWalletAddress(null);
    setUsdcBalance('0.00');
    localStorage.removeItem('nalo_wallet_address');
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {walletAddress ? (
        <div className="flex items-center gap-4 bg-slate-900 border border-emerald-500/20 pl-4 pr-3 py-2 rounded-2xl shadow-2xl backdrop-blur-md">
          
          {/* Real-time Balance Display Tracker */}
          <div className="flex flex-col items-end border-r border-slate-800 pr-4 text-right">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold">Liquid Balance</span>
            <span className="text-sm font-bold font-mono text-white flex items-center gap-1">
              <span className="text-xs text-emerald-400 font-medium">$</span>
              {usdcBalance}
              <span className="text-[10px] text-slate-400 font-medium tracking-wide ml-0.5">USDC</span>
            </span>
          </div>

          {/* Connection Identity Info */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Passport Verified</span>
              <span className="text-xs text-emerald-400 font-mono tracking-wider">
                {walletAddress.slice(0, 5)}...{walletAddress.slice(-5)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleDisconnect}
            className="bg-slate-950 hover:bg-red-500 hover:text-white border border-slate-800 hover:border-red-500 text-slate-400 text-xs font-mono px-3 py-2 rounded-xl transition duration-200 active:scale-95 group flex items-center gap-1"
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