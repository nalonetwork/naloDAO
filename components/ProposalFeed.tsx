'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Self-contained database connection layer to prevent path resolution breaks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Proposal {
  id: string;
  title: string;
  description: string;
  creator_wallet: string;
  yes_votes: number;
  no_votes: number;
  ends_at: string;
  created_at: string;
}

export default function ProposalFeed() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState<{ [key: string]: boolean }>({});

  // Fetch proposals directly from your Supabase SQL Table
  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error("Failed fetching active DAO proposals ledger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Upgraded Voting Executor: Updates the shared database parameters in real time
  const castVote = async (proposalId: string, currentVotes: number, voteType: 'yes_votes' | 'no_votes') => {
    if (votingStatus[proposalId]) return; // Stop accidental double-clicks instantly
    
    setVotingStatus(prev => ({ ...prev, [proposalId]: true }));
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ [voteType]: currentVotes + 1 })
        .eq('id', proposalId);

      if (error) throw error;
      
      // Refresh local display arrays smoothly
      await fetchProposals();
    } catch (err) {
      console.error("Consensus update execution failure:", err);
      alert("Database mutation rejected. Check your connection parameters.");
    } finally {
      setVotingStatus(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full text-center py-8">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-emerald-500 rounded-full" role="status" />
        <p className="text-xs text-slate-400 font-mono mt-2">Reading cloud consensus tracks...</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="w-full text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 p-6">
        <p className="text-sm text-slate-400 font-mono">No governance proposals currently active on the ledger.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 mt-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white tracking-tight">Active Consensus Proposals</h3>
        <button 
          onClick={fetchProposals}
          className="text-xs text-emerald-400 font-mono hover:underline bg-emerald-500/5 px-2 py-1 border border-emerald-500/10 rounded-md transition"
        >
          ⟳ Sync Ledger
        </button>
      </div>

      {proposals.map((proposal) => {
        // --- YOUR DYNAMIC METRICS MAPPING BLOCK ---
        const totalVotes = proposal.yes_votes + proposal.no_votes;
        const yesPercent = totalVotes > 0 ? Math.round((proposal.yes_votes / totalVotes) * 100) : 0;
        const noPercent = totalVotes > 0 ? Math.round((proposal.no_votes / totalVotes) * 100) : 0;
        const formattedDate = new Date(proposal.ends_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        return (
          <div 
            key={proposal.id} 
            className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-md backdrop-blur-sm hover:border-slate-700 transition duration-200 text-left"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="text-md font-semibold text-white tracking-wide">{proposal.title}</h4>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md shrink-0">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4 whitespace-pre-wrap">
              {proposal.description}
            </p>

            {/* Voting Progress Gauge Visualizer */}
            <div className="space-y-2 border-t border-slate-800/60 pt-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Metrics: {totalVotes} Consensus Parameters Cast</span>
                <span>Voting Concludes: {formattedDate}</span>
              </div>
              
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800/40">
                {totalVotes === 0 ? (
                  <div className="bg-slate-800 w-full h-full" /> // Neutral baseline state if zero votes are logged
                ) : (
                  <>
                    <div style={{ width: `${yesPercent}%` }} className="bg-emerald-500 h-full transition-all duration-300" />
                    <div style={{ width: `${noPercent}%` }} className="bg-red-500 h-full transition-all duration-300" />
                  </>
                )}
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1">
                <span className="text-emerald-400 font-bold">Yes: {proposal.yes_votes} ({yesPercent}%)</span>
                <span className="text-red-400 font-bold">No: {proposal.no_votes} ({noPercent}%)</span>
              </div>
            </div>

            {/* INTERACTIVE VOTING BUTTON ACTIONS */}
            <div className="flex gap-2 pt-4 mt-2 border-t border-slate-800/30">
              <button
                disabled={votingStatus[proposal.id]}
                onClick={() => castVote(proposal.id, proposal.yes_votes, 'yes_votes')}
                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:text-slate-950 text-emerald-400 text-xs font-mono font-bold py-2.5 rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {votingStatus[proposal.id] ? 'Logging...' : 'Vote YES 👍'}
              </button>
              <button
                disabled={votingStatus[proposal.id]}
                onClick={() => castVote(proposal.id, proposal.no_votes, 'no_votes')}
                className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:text-white text-red-400 text-xs font-mono font-bold py-2.5 rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {votingStatus[proposal.id] ? 'Logging...' : 'Vote NO 👎'}
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}