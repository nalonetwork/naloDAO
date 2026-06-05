'use client';

import React from 'react';

export default function MoneyGramBridge() {
  
  const launchMoneyGramPortal = () => {
    const savedAddress = localStorage.getItem('nalo_wallet_address');
    if (!savedAddress) {
      alert("Please connect your Passport Wallet at the top of the page before launching the Cash Registry.");
      return;
    }

    const moneygramUrl = `https://ramp-sandbox.moneygram.com/vc/v1/anchor/transfer` + 
                         `?asset_code=USDC` +
                         `&account=${savedAddress}` +
                         `&lang=en`;

    window.open(moneygramUrl, '_blank', 'width=500,height=700,status=no,menubar=no');
  };

  return (
    <div className="bg-[#0b0f13] border border-slate-800/80 p-5 rounded-xl shadow-2xl space-y-4 text-left relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 font-sans">
          💵 MoneyGram Cash Registry
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed font-sans">
          Turn paper bills into digital asset dollars (USDC), or cash out your tokenized earnings at over 400,000 global physical retail desks. No bank account required.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 font-mono">
        <button 
          onClick={launchMoneyGramPortal}
          className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-emerald-400 text-xs font-bold py-2.5 rounded-lg transition duration-150 active:scale-[0.99] tracking-wide uppercase"
        >
          📥 Cash-In (Deposit Cash)
        </button>
        <button 
          onClick={launchMoneyGramPortal}
          className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-purple-400 text-xs font-bold py-2.5 rounded-lg transition duration-150 active:scale-[0.99] tracking-wide uppercase"
        >
          📤 Cash-Out (Withdraw Cash)
        </button>
      </div>

      <div className="text-[9px] font-mono text-slate-600 text-center pt-2.5 border-t border-slate-900 uppercase tracking-widest font-bold select-none">
        🔒 Secured via standard Stellar SEP-24 Compliance Protocols
      </div>
    </div>
  );
}