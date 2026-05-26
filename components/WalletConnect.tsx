'use client';

import React, { useState } from 'react';
import { StellarWalletsKit, WalletNetwork, WalletType } from '@creit.tech/stellar-wallets-kit';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Create a single, permanent instance of the wallet kit pointing to Stellar Testnet
  const [kit] = useState(() => new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWallet: WalletType.FREIGHTER // Defaults to Freighter, can expand
  }));

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Open the clean modular pop-up UI
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            // 2. Set the active wallet provider extension based on choice
            kit.setWallet(option.id);
            
            // 3. Request the user's public address key
            const publicKey = await kit.getPublicKey();
            setWalletAddress(publicKey);
          } catch (err) {
            console.error("Error fetching public key:", err);
          }
        }
      });
    } catch (error) {
      console.error("Wallet modal connection failed:", error);
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
          {isConnecting ? 'Opening Wallets...' : 'Connect Stellar Wallet'}
        </button>
      )}
    </div>
  );
}