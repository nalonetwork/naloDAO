'use client';

import React from 'react';

export default function MoneyGramBridge() {
  
  const launchMoneyGramPortal = () => {
    const savedAddress = localStorage.getItem('nalo_wallet_address');
    if (!savedAddress) {
      alert("Please connect your Passport Wallet at the top of the page before launching the Cash Registry.");
      return;
    }

    // Official developer sandbox interactive portal anchor endpoint targeting Stellar USDC
    // In production, this shifts to the allowlisted live enterprise domain endpoint.
    const moneygramUrl = `https://ramp-sandbox.moneygram.com/vc/v1/anchor/transfer` + 
                         `?asset_code=USDC` +
                         `&account=${savedAddress}` +
                         `&lang=en`;

    // Open the compliant modal webview window securely
    window.open(moneygramUrl, '_blank', 'width=500,height=700,status=no,menubar=no');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
      <div>
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          💵 MoneyGram Cash Registry
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Turn paper bills into digital digital asset dollars (USDC), or cash out your tokenized earnings at over 400,000 global physical retail desks. No bank account required.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button 
          onClick={launchMoneyGramPortal}
          className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-bold py-2.5 rounded-xl transition duration-150 active:scale-95"
        >
          📥 Cash-In (Deposit Cash)
        </button>
        <button 
          onClick={launchMoneyGramPortal}
          className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-bold py-2.5 rounded-xl transition duration-150 active:scale-95"
        >
          📤 Cash-Out (Withdraw Cash)
        </button>
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center pt-1 border-t border-slate-800/40">
        🔒 Secured via standard Stellar SEP-24 Compliance Protocols
      </div>
    </div>
  );
}