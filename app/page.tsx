import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
      <header className="max-w-2xl space-y-6">
        {/* 🌱 Badge */}
        <span className="inline-block text-emerald-400 font-semibold tracking-wide uppercase text-xs border border-emerald-400/30 px-3 py-1 rounded-full bg-emerald-400/10 mb-2">
          NaloDAO x Stellar 🌱
        </span>
        
        {/* Main Hero Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white">
          A New Economy <br />
          <span className="text-emerald-400">for Earth</span>
        </h1>
        
        {/* Core Vision Description */}
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Building a decentralized, Web3-native platform where regenerative activities are tracked, rewarded, and governed natively on the low-emission **Stellar Network**.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95">
            Connect Stellar Wallet
          </button>
          <button className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium px-6 py-3 rounded-xl border border-slate-800 transition-all duration-200 active:scale-95">
            Explore Soroban Contracts
          </button>
        </div>
      </header>
    </div>
  );
}