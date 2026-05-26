'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent duplicate initializations during development multi-renders
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupStellarKit = async () => {
      try {
        // 1. Dynamic imports to keep Turbopack happy
        const sdkModules = await import('@creit.tech/stellar-wallets-kit/sdk');
        const utilsModules = await import('@creit.tech/stellar-wallets-kit/modules/utils');
        
        const KitClass = (sdkModules as any).StellarWalletsKit || (sdkModules as any).default?.StellarWalletsKit;
        const getDefaultModules = (utilsModules as any).defaultModules || (utilsModules as any).default?.defaultModules;

        if (!KitClass) return;

        // 2. Initialize the static Core SDK Controller
        KitClass.init({
          modules: getDefaultModules ? getDefaultModules() : []
        });

        // 3. Render the official Modal UI wrapper into our container element
        if (buttonContainerRef.current) {
          KitClass.createButton(buttonContainerRef.current);
        }

        // 4. Create an interval loop to watch when a user finishes scanning & logging in
        const addressCheckLoop = setInterval(async () => {
          try {
            const sessionData = await KitClass.getAddress();
            if (sessionData?.address && sessionData.address !== walletAddress) {
              const connectedAddress = sessionData.address;
              setWalletAddress(connectedAddress);
              clearInterval(addressCheckLoop);

              // 5. Instantly register the real Mainnet address into your Supabase grid row
              const { error: dbError } = await supabase
                .from('users')
                .upsert(
                  { wallet_address: connectedAddress }, 
                  { onConflict: 'wallet_address' }
                );

              if (dbError) {
                console.error("Database enrollment rejected:", dbError.message);
              } else {
                console.log("Success! Real wallet address synchronized with Supabase SQL ledger.");
              }
            }
          } catch (e) {
            // Quietly loop until the user actually selects a wallet option from the screen
          }
        }, 1000);

        return () => clearInterval(addressCheckLoop);

      } catch (err) {
        console.error("Stellar Wallets Kit layout system failed:", err);
      }
    };

    setupStellarKit();
  }, []);

  const disconnectWallet = () => {
    setWalletAddress(null);
    if (typeof window !== 'undefined') {
      window.location.reload(); // Refresh to clean instance data mappings completely
    }
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
        /* The SDK will draw the official Stellar ecosystem button inside this element */
        <div 
          ref={buttonContainerRef} 
          className="stellar-kit-button-wrapper"
        />
      )}
    </div>
  );
}