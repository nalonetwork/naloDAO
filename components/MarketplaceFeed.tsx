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
      // 1. Pull the official Stellar transaction construction classes dynamically
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const userAddress = await KitClass.getAddress();
      const derivedUserWallet = typeof userAddress === 'string' ? userAddress : userAddress[0]?.address || userAddress.address;

      // 2. Connect to the public Horizon network infrastructure to fetch live sequence numbers
      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(derivedUserWallet);

      // 3. Explicitly target Circle's official, globally regulated Stellar USDC asset parameters
      const USDC_ASSET = new stellarSdk.Asset(
        "USDC",
        "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT" // Official Circle Issuer Contract Address
      );

      // 4. Build a standard on-chain payment instruction payload
      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' }) // Standard base fee protection
        .addOperation(stellarSdk.Operation.payment({
          destination: merchantWallet,
          asset: USDC_ASSET,
          amount: paymentAmount
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      // 5. Send the transaction to the user's LOBSTR wallet for signing
      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      
      // 6. Broadcast the signed transaction directly to the global network ledger
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
    <div className="w-full max-w-2xl mx-auto space-y-4 mt-8">
      <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Verified Regulated Producers</h3>
      
      {merchants.length === 0 ? (
        <p className="text-xs text-slate-500 italic font-mono">No sustainable businesses currently active in the market tracks.</p>
      ) : (
        merchants.map((m) => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{m.business_name}</h4>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {m.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">{m.description}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-2">📍 {m.city}, {m.country_code} • Route: {m.owner_wallet.slice(0,6)}...{m.owner_wallet.slice(-6)}</p>
            </div>

            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              <div className="relative rounded-xl shadow-sm">
                <input type="number" placeholder="0.00" value={amounts[m.id] || ''} onChange={e => setAmounts(prev => ({ ...prev, [m.id]: e.target.value }))} className="w-24 bg-slate-950 border border-slate-800 text-white pr-7 pl-3 py-1.5 rounded-lg text-xs font-mono text-right focus:outline-none focus:border-emerald-500" />
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none"><span className="text-[10px] font-mono text-slate-500">USD</span></div>
              </div>
              <button onClick={() => handleCheckout(m.owner_wallet, m.id)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition">
                Pay Merchant
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}