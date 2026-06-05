'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MarketplaceFeed() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const readRegistry = async () => {
      const { data } = await supabase.from('merchants').select('*');
      setMerchants(data || []);
    };
    readRegistry();
  }, []);

  const handleCheckout = async (merchantWallet: string, id: string) => {
    const paymentAmount = amounts[id];
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid checkout payment amount.");
      return;
    }

    try {
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const userAddress = await KitClass.getAddress();
      const derivedUserWallet = typeof userAddress === 'string' ? userAddress : userAddress[0]?.address || userAddress.address;

      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(derivedUserWallet);

      const USDC_ASSET = new stellarSdk.Asset(
        "USDC",
        "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT"
      );

      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({
          destination: merchantWallet,
          asset: USDC_ASSET,
          amount: paymentAmount
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      
      const submitTx = stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC);
      await server.submitTransaction(submitTx);

      alert("🎉 Compliant Payment Successful! Funds deposited directly to the merchant's wallet.");
      setAmounts(prev => ({ ...prev, [id]: '' }));

    } catch (err: any) {
      console.error("Stellar payment pipeline halted:", err);
      alert(`Transaction Rejected: ${err?.message || "Check your wallet balance and try again."}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 mt-8 text-slate-200">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800/60 pb-3 text-left">Verified Regulated Producers</h3>
      
      {merchants.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/10 shadow-inner">
          <p className="text-xs text-slate-500 italic font-mono uppercase tracking-widest">No sustainable businesses currently active in the market tracks.</p>
        </div>
      ) : (
        merchants.map((m) => (
          <div key={m.id} className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md shadow-xl hover:border-slate-700/80 transition duration-150 relative group">
            <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-purple-500 to-emerald-400 group-hover:h-full transition-all duration-200" />
            
            <div className="text-left">
              <div className="flex items-center gap-2.5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wide font-sans">{m.business_name}</h4>
                <span className="text-[8px] uppercase font-mono font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-sm">
                  {m.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md font-light leading-relaxed font-sans">{m.description}</p>
              <p className="text-[9px] text-slate-500 font-mono mt-2 select-all font-bold">📍 {m.city}, {m.country_code} • ROUTE: {m.owner_wallet.slice(0,6)}...{m.owner_wallet.slice(-6)}</p>
            </div>

            <div className="flex sm:flex-col items-stretch sm:items-end gap-2.5 shrink-0 w-full sm:w-auto font-mono">
              <div className="relative rounded-lg shadow-inner w-full sm:w-28 bg-slate-900 border border-slate-800 focus-within:border-emerald-500 h-9 flex items-center px-2.5">
                <input type="number" placeholder="0.00" value={amounts[m.id] || ''} onChange={e => setAmounts(prev => ({ ...prev, [m.id]: e.target.value }))} className="w-full bg-transparent text-white text-xs text-right focus:outline-none placeholder-slate-700 pr-0.5" />
                <div className="flex items-center pointer-events-none ml-1 shrink-0"><span className="text-[9px] font-bold text-slate-500">USDC</span></div>
              </div>
              <button onClick={() => handleCheckout(m.owner_wallet, m.id)} className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 h-9 rounded-lg transition hover:brightness-110 active:scale-[0.99] shadow-md shrink-0">
                Pay Merchant
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}