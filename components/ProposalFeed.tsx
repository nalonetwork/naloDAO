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

    const activeWallet = localStorage.getItem('nalo_wallet_address');
    if (!activeWallet) {
      alert("Please connect your Ecosystem Passport at the top of the page before casting a vote.");
      return;
    }

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

    setProposals(prevProposals =>
      prevProposals.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, [voteType]: currentVotes + 1 }
          : proposal
      )
    );

    setVotingStatus(prev => ({ ...prev, [proposalId]: true }));

    try {
      const stellarSdk = await import('@stellar/stellar-sdk');
      const sdkModule = await import('@creit.tech/stellar-wallets-kit/sdk');
      const KitClass: any = sdkModule.StellarWalletsKit || (sdkModule as any).default?.StellarWalletsKit;

      const server = new stellarSdk.Horizon.Server("https://horizon.stellar.org");
      const accountSource = await server.loadAccount(activeWallet);

      const DAO_TREASURY = process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS;
      
      if (!DAO_TREASURY || !DAO_TREASURY.startsWith('G')) {
        throw new Error("The NaloDAO Treasury wallet configuration is missing or invalid.");
      }
      
      const tx = new stellarSdk.TransactionBuilder(accountSource, { fee: '10000' })
        .addOperation(stellarSdk.Operation.payment({
          destination: DAO_TREASURY,
          asset: stellarSdk.Asset.native(), 
          amount: "0.00001" 
        }))
        .setNetworkPassphrase(stellarSdk.Networks.PUBLIC)
        .setTimeout(180)
        .build();

      const { result } = await KitClass.sign({ transactionXdr: tx.toXDR() });
      const submitTx = stellarSdk.TransactionBuilder.fromXDR(result, stellarSdk.Networks.PUBLIC);
      await server.submitTransaction(submitTx);

      const choiceLabel = voteType === 'yes_votes' ? 'YES' : 'NO';
      const { error: ledgerError } = await supabase
        .from('votes_ledger')
        .insert([{ proposal_id: proposalId, user_wallet: activeWallet, vote_choice: choiceLabel }]);

      if (ledgerError) throw ledgerError;

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

      await supabase
        .from('stewardship_ledger')
        .insert([{ 
          user_wallet: activeWallet, 
          points_awarded: 15, 
          action_description: `Participated in Consensus Protocol Voting on Proposal ID: ${proposalId}` 
        }]);

      const { error: updateError } = await supabase
        .from('proposals')
        .update({ [voteType]: currentVotes + 1 })
        .eq('id', proposalId);

      if (updateError) throw updateError;

      alert("🎉 Vote verified! Your micro-fee has cleared and +15 Stewardship Points have been added to your passport.");
      fetchProposals();

    } catch (err: any) {
      console.error("Governance pipeline operation dropped:", err);
      
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

  if (isLoading) return <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 text-center py-4">Auditing consensus tracks...</p>;

  return (
    <div className="space-y-4 text-slate-200">
      {proposals.map((p) => {
        const total = p.yes_votes + p.no_votes;
        const yesPercent = total > 0 ? Math.round((p.yes_votes / total) * 100) : 0;
        const noPercent = total > 0 ? Math.round((p.no_votes / total) * 100) : 0;

        return (
          <div key={p.id} className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-xl space-y-4 text-left backdrop-blur-md shadow-xl group relative">
            <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-emerald-500 to-purple-500 group-hover:h-full transition-all duration-200" />
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide font-sans">{p.title}</h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed font-sans">{p.description}</p>
            </div>

            {/* Voting Progression Metrics Slider */}
            <div className="space-y-2 pt-3 border-t border-slate-900">
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
                {total === 0 ? <div className="bg-slate-850 w-full h-full" /> : (
                  <>
                    <div style={{ width: `${yesPercent}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300" />
                    <div style={{ width: `${noPercent}%` }} className="bg-gradient-to-r from-red-500 to-rose-600 h-full transition-all duration-300" />
                  </>
                )}
              </div>
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-emerald-400">AGREE: {p.yes_votes} ({yesPercent}%)</span>
                <span className="text-red-400">DISAGREE: {p.no_votes} ({noPercent}%)</span>
              </div>
            </div>

            <div className="flex gap-2.5 text-[10px] font-mono font-bold pt-1">
              <button 
                disabled={votingStatus[p.id]} 
                onClick={() => castCryptographicVote(p.id, p.yes_votes, 'yes_votes')}
                className="flex-1 bg-emerald-500/5 hover:bg-emerald-500 border border-emerald-500/20 hover:text-slate-950 text-emerald-400 py-2 rounded-lg transition duration-150 uppercase tracking-wider font-black disabled:opacity-30 active:scale-[0.98] shadow-md h-9"
              >
                {votingStatus[p.id] ? 'Processing...' : 'Vote YES 👍'}
              </button>
              <button 
                disabled={votingStatus[p.id]} 
                onClick={() => castCryptographicVote(p.id, p.no_votes, 'no_votes')}
                className="flex-1 bg-red-500/5 hover:bg-red-500 border border-red-500/20 hover:text-white text-red-400 py-2 rounded-lg transition duration-150 uppercase tracking-wider font-black disabled:opacity-30 active:scale-[0.98] shadow-md h-9"
              >
                {votingStatus[p.id] ? 'Processing...' : 'Vote NO 👎'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}