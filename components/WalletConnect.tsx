'use client';

import React, { useState, useEffect } from 'react';

// Declare global window interface for TypeScript so it knows LOBSTR exists
declare global {
  interface Window {
    lobstr?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (transactionXdr: string) => Promise<string>;
    };
  }
}

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);

  // Check if the user actually has LOBSTR extension installed in their browser
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lobstr) {
      setHasExtension(true);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (!window.lobstr) {
        // If they don't have LOBSTR, open a new tab to download it
        window.open('https://lobstr.co/', '_blank');
        return;
      }

      // Request the public address key directly from LOBSTR
      const publicKey = await window.lobstr.getPublicKey();
      setWalletAddress(publicKey);
    } catch (error) {
      console.error("LOBSTR Wallet connection failed:", error);
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
          {/* Shows connected wallet address status */}
          <span className="text-xs text-emerald-400 font-mono bg-slate-900 border border-emerald-500/20 px-3 py-1 rounded-md">
            LOBSTR Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
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
          {!hasExtension 
            ? 'Install LOBSTR Wallet' 
            : isConnecting 
              ? 'Connecting...' 
              : 'Connect LOBSTR Wallet'
          }
        </button>
      )}
    </div>
  );
}