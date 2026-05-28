'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

interface Proposal {
  id: string;
  title: string;
  description: string;
  yes_votes: number;
  no_votes: number;
  ends_at: string;
}

export default function ProposalFeed() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState<{ [key: string]: boolean }>({});

  const fetchProposals = async () => {
    try {
      const { data } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
      setProposals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProposals(); }, []);

  const castCryptographicVote = async (proposalId: string, currentVotes: number, voteType: 'yes_votes' | 'no_votes') => {
    if (votingStatus[proposalId]) return;

    // 1. Double-Check Local Caching Isolation: Has this browser key session voted already?
    const activeWallet = localStorage.getItem('nalo_wallet_address');
    if (!activeWallet) {
      alert("Please connect your Ecosystem Passport at the top of the page before casting a vote.");
      return;
    }

    // 2. Check the database to see if this wallet has already voted on this proposal
    const { data: existingVote } = await supabase
      .from('votes_ledger')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('user_wallet', activeWallet)
      .maybeSingle();

    if (existingVote) {
      alert("🔒 Security Lock: Your wallet passport has already cast a vote on this proposal framework. Multi-voting is restricted.");
      return;
    }

    // 3. OPTIMISTIC UI STATE UPDATE: Instantly reflect the increment on screen for immediate feedback
    setProposals(prevProposals =>
      prevProposals.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, [voteType]: currentVotes + 1 }
          : proposal
      )
    );

    setVotingStatus(prev => ({ ...prev, [proposalId]: true }));

    try {
      // 4. Import Stellar network tools dynamically
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(activeWallet);

      // 5. Dynamically source the official NaloDAO governance treasury configuration handle
      const DAO_TREASURY = process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS;
      
      if (!DAO_TREASURY || !DAO_TREASURY.startsWith('G')) {
        throw new Error("The NaloDAO Treasury wallet configuration is missing or invalid.");
      }
      
      // Build the immutable cryptographic payment transaction block
      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({
          destination: DAO_TREASURY,       // Routes the 0.00001 XLM micro-fee to your treasury account
          asset: stellarSdk.Asset.native(), 
          amount: "0.00001" 
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      // 6. Prompt user's browser wallet extension or passport web-portal for signature confirmation
      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      const submitTx = stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC);
      await server.submitTransaction(submitTx);

      // 7. On-chain transaction succeeded! Log the unique vote mapping row to the database ledger
      const choiceLabel = voteType === 'yes_votes' ? 'YES' : 'NO';
      const { error: ledgerError } = await supabase
        .from('votes_ledger')
        .insert([{ proposal_id: proposalId, user_wallet: activeWallet, vote_choice: choiceLabel }]);

      if (ledgerError) throw ledgerError;

      // 8. 🌟 STEWARDSHIP IMPACT REWARD: Increment user score parameters by +15 points
      const { data: userProfile } = await supabase
        .from('users')
        .select('stewardship_score')
        .eq('wallet_address', activeWallet)
        .maybeSingle();

      const currentScore = userProfile?.stewardship_score || 0;

      await supabase
        .from('users')
        .update({ stewardship_score: currentScore + 15 })
        .eq('wallet_address', activeWallet);

      // Register the structural audit trail record for historical points verification tracking
      await supabase
        .from('stewardship_ledger')
        .insert([{ 
          user_wallet: activeWallet, 
          points_awarded: 15, 
          action_description: `Participated in Consensus Protocol Voting on Proposal ID: ${proposalId}` 
        }]);

      // 9. Synchronize the final metrics database totals to match
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ [voteType]: currentVotes + 1 })
        .eq('id', proposalId);

      if (updateError) throw updateError;

      alert("🎉 Vote verified! Your micro-fee has cleared and +15 Stewardship Points have been added to your passport.");
      fetchProposals();

    } catch (err: any) {
      console.error("Governance pipeline operation dropped:", err);
      
      // OPTIMISTIC UI REVERSAL: Revert UI state values instantly if network or execution steps fail
      setProposals(prevProposals =>
        prevProposals.map(proposal =>
          proposal.id === proposalId
            ? { ...proposal, [voteType]: currentVotes }
            : proposal
        )
      );
      
      alert(`Voting Halted: ${err?.message || "Please check your network parameters and try again."}`);
    } finally {
      setVotingStatus(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  if (isLoading) return <p className="text-xs text-slate-500 font-mono text-center py-4">Auditing consensus tracks...</p>;

  return (
    <div className="space-y-4">
      {proposals.map((p) => {
        const total = p.yes_votes + p.no_votes;
        const yesPercent = total > 0 ? Math.round((p.yes_votes / total) * 100) : 0;
        const noPercent = total > 0 ? Math.round((p.no_votes / total) * 100) : 0;

        return (
          <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
            <div>
              <h4 className="text-sm font-bold text-white">{p.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/60">
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800/40">
                {total === 0 ? <div className="bg-slate-800 w-full h-full" /> : (
                  <>
                    <div style={{ width: `${yesPercent}%` }} className="bg-emerald-500 h-full transition-all duration-300" />
                    <div style={{ width: `${noPercent}%` }} className="bg-red-500 h-full transition-all duration-300" />
                  </>
                )}
              </div>
              <div className="flex justify-between text-[11px] font-mono font-bold">
                <span className="text-emerald-400">YES: {p.yes_votes} ({yesPercent}%)</span>
                <span className="text-red-400">NO: {p.no_votes} ({noPercent}%)</span>
              </div>
            </div>

            <div className="flex gap-2 text-xs font-mono font-bold">
              <button 
                disabled={votingStatus[p.id]} 
                onClick={() => castCryptographicVote(p.id, p.yes_votes, 'yes_votes')}
                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:text-slate-950 text-emerald-400 py-2 rounded-xl transition duration-150 disabled:opacity-40 active:scale-95"
              >
                {votingStatus[p.id] ? 'Processing...' : 'Vote YES 👍 (0.00001 XLM)'}
              </button>
              <button 
                disabled={votingStatus[p.id]} 
                onClick={() => castCryptographicVote(p.id, p.no_votes, 'no_votes')}
                className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:text-white text-red-400 py-2 rounded-xl transition duration-150 disabled:opacity-40 active:scale-95"
              >
                {votingStatus[p.id] ? 'Processing...' : 'Vote NO 👎 (0.00001 XLM)'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}