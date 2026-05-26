'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SacredMarketplace() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [supplyLines, setSupplyLines] = useState<any[]>([]);
  const [checkoutAmounts, setCheckoutAmounts] = useState<{ [key: string]: string }>({});
  const [selectedEthicFilter, setSelectedEthicFilter] = useState<string>('All');

  const loadEcosystemData = async () => {
    // Parallel fetch both businesses and their ecological interconnections
    const [merchantRes, supplyRes] = await Promise.all([
      supabase.from('merchants').select('*'),
      supabase.from('supply_lines').select('*')
    ]);
    setMerchants(merchantRes.data || []);
    setSupplyLines(supplyRes.data || []);
  };

  useEffect(() => {
    loadEcosystemData();
  }, []);

  const handleSacredPayment = async (merchantWallet: string, id: string) => {
    const amount = checkoutAmounts[id];
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount to transfer.");
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
        "GA5ZBLAMTP6F34IEU6CHH77WCQE75577VAFZOMZIBZ36EIKKAA5CTFHT" // Circle Official Regulated Asset Contract Issuer Key
      );

      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({
          destination: merchantWallet,
          asset: USDC_ASSET,
          amount: amount
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      const submitTx = stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC);
      await server.submitTransaction(submitTx);

      alert(`🎉 Transaction complete! Settle loop finalized directly with zero extraction fees.`);
      setCheckoutAmounts(prev => ({ ...prev, [id]: '' }));
    } catch (err: any) {
      console.error(err);
      alert(`Payment Interrupted: ${err?.message || "Check network connections."}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-4">
      
      {/* Ethic Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Regenerative Commerce Network</h3>
          <p className="text-xs text-slate-400">Auditing asset flows through the lens of Sacred Economics.</p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          {['All', 'Earth Care', 'People Care', 'Fair Share'].map((ethic) => (
            <button
              key={ethic}
              onClick={() => setSelectedEthicFilter(ethic)}
              className={`px-2 py-1 rounded transition ${
                selectedEthicFilter === ethic ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {ethic}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Interconnected Producers */}
      <div className="space-y-4">
        {merchants.map((merchant) => {
          // Find if this business buys from other regenerative partners in our database
          const activeConnections = supplyLines.filter(line => line.buyer_wallet === merchant.owner_wallet);
          
          // Filter out card view layout based on selected permaculture pillar tags
          if (selectedEthicFilter !== 'All' && !activeConnections.some(c => c.verified_ethic === selectedEthicFilter)) {
            return null;
          }

          return (
            <div key={merchant.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl shadow-xl backdrop-blur-sm space-y-4 hover:border-slate-700/80 transition duration-200">
              
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-md font-bold text-white">{merchant.business_name}</h4>
                    <span className="text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {merchant.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{merchant.description}</p>
                </div>

                {/* Direct Checkout Panel */}
                <div className="flex items-center gap-2 shrink-0 bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={checkoutAmounts[merchant.id] || ''}
                    onChange={e => setCheckoutAmounts(prev => ({ ...prev, [merchant.id]: e.target.value }))}
                    className="w-16 bg-transparent text-white text-xs font-mono text-right focus:outline-none placeholder-slate-700"
                  />
                  <span className="text-[10px] font-mono text-slate-500 mr-1">USDC</span>
                  <button
                    onClick={() => handleSacredPayment(merchant.owner_wallet, merchant.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Pay
                  </button>
                </div>
              </div>

              {/* Dynamic Provenance Story Tracker (The Connection Bridge) */}
              {activeConnections.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800/40 p-3.5 rounded-xl space-y-2">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Verified Ecological Provenance Loop:</h5>
                  {activeConnections.map((line: any, idx: number) => {
                    const supplier = merchants.find(m => m.owner_wallet === line.supplier_wallet);
                    return (
                      <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-emerald-500">↳</span>
                          <span>Partnered directly with</span>
                          <strong className="text-white font-medium underline decoration-emerald-500/30">{supplier ? supplier.business_name : 'Local Producer'}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] italic text-slate-400">"{line.relationship_details}"</span>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            {line.verified_ethic}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meta Address Footer */}
              <div className="text-[9px] font-mono text-slate-600 flex justify-between pt-2 border-t border-slate-800/40">
                <span>Network Routing Handle: {merchant.owner_wallet}</span>
                <span>Region Flag: {merchant.city}, {merchant.country_code}</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}