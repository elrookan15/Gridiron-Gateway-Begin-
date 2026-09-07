import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Coins, 
  ArrowRightLeft, 
  Key, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  RefreshCw,
  Loader2,
  ExternalLink
} from 'lucide-react';
import type { ExplodingTradeEscrow, TokenizedAssetAssetPointer } from '../types';

const MOCK_ESCROW_PROPOSALS: ExplodingTradeEscrow[] = [
  {
    tradeAddress: 'TrdEsc11111111111111111111111111111111111111',
    senderPublicKey: '8xZp...4k9Q (Elijah Woods Owner)',
    recipientPublicKey: '3mYt...9n2P (Marcus Johnson Owner)',
    leaguePublicKey: 'LgQ8...7v1A (Gridiron Dynasty League #1)',
    senderOfferedAssets: [
      {
        mintAddress: 'NFT-QB-2026-001',
        assetName: 'Elijah Woods (5-Star QB Card NFT)',
        assetType: 'PLAYER_CARD_NFT',
        starRating: 5,
        position: 'QB'
      },
      {
        mintAddress: 'PICK-2028-1ST',
        assetName: '2028 1st Round Draft Pick',
        assetType: 'FUTURE_DRAFT_PICK',
        draftYear: 2028
      }
    ],
    recipientRequestedAssets: [
      {
        mintAddress: 'NFT-WR-2026-004',
        assetName: 'Marcus Johnson (4-Star WR Card NFT)',
        assetType: 'PLAYER_CARD_NFT',
        starRating: 4,
        position: 'WR'
      }
    ],
    createdAtUnix: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    expiresAtUnix: Math.floor(Date.now() / 1000) + 82800, // 23 hours remaining
    durationSeconds: 86400, // 24 Hours
    status: 'PENDING',
    collateralUsdcCents: 5000, // $50.00 USDC
    requiresDynastyCollateral: true
  },
  {
    tradeAddress: 'TrdEsc22222222222222222222222222222222222222',
    senderPublicKey: '9aKq...1m7L (Tariq Lawson Owner)',
    recipientPublicKey: '8xZp...4k9Q (Elijah Woods Owner)',
    leaguePublicKey: 'LgQ8...7v1A (Gridiron Dynasty League #1)',
    senderOfferedAssets: [
      {
        mintAddress: 'NFT-CB-2026-009',
        assetName: 'Tariq Lawson (5-Star CB Card NFT)',
        assetType: 'PLAYER_CARD_NFT',
        starRating: 5,
        position: 'CB'
      }
    ],
    recipientRequestedAssets: [
      {
        mintAddress: 'PICK-2027-1ST',
        assetName: '2027 1st Round Draft Pick',
        assetType: 'FUTURE_DRAFT_PICK',
        draftYear: 2027
      }
    ],
    createdAtUnix: Math.floor(Date.now() / 1000) - 90000, // 25 hours ago
    expiresAtUnix: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    durationSeconds: 86400,
    status: 'EXPIRED',
    collateralUsdcCents: 5000,
    requiresDynastyCollateral: true
  }
];

export const RoundBlockTradeEscrowModule: React.FC = () => {
  const [proposals, setProposals] = useState<ExplodingTradeEscrow[]>(MOCK_ESCROW_PROPOSALS);
  const [selectedDuration, setSelectedDuration] = useState<number>(86400); // Default 24 Hours
  const [nowUnix, setNowUnix] = useState<number>(Math.floor(Date.now() / 1000));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Live 1-second interval to update temporal lock countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNowUnix(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (expiresAtUnix: number) => {
    const diff = expiresAtUnix - nowUnix;
    if (diff <= 0) return '00:00:00 (EXPIRED)';
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProposeTrade = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newTrade: ExplodingTradeEscrow = {
        tradeAddress: `TrdEsc${Math.random().toString(36).substring(2, 11)}1111111111`,
        senderPublicKey: '8xZp...4k9Q (Your Connected Solana Wallet)',
        recipientPublicKey: '5tRn...8w3K (Target Manager)',
        leaguePublicKey: 'LgQ8...7v1A (Gridiron Dynasty League #1)',
        senderOfferedAssets: [
          {
            mintAddress: 'NFT-RB-2026-012',
            assetName: 'DeAndre Jackson (5-Star RB Card NFT)',
            assetType: 'PLAYER_CARD_NFT',
            starRating: 5,
            position: 'RB'
          },
          {
            mintAddress: 'PICK-2028-1ST',
            assetName: '2028 1st Round Draft Pick',
            assetType: 'FUTURE_DRAFT_PICK',
            draftYear: 2028
          }
        ],
        recipientRequestedAssets: [
          {
            mintAddress: 'NFT-WR-2026-002',
            assetName: 'Marcus Webb (5-Star WR Card NFT)',
            assetType: 'PLAYER_CARD_NFT',
            starRating: 5,
            position: 'WR'
          }
        ],
        createdAtUnix: Math.floor(Date.now() / 1000),
        expiresAtUnix: Math.floor(Date.now() / 1000) + selectedDuration,
        durationSeconds: selectedDuration,
        status: 'PENDING',
        collateralUsdcCents: 5000,
        requiresDynastyCollateral: true
      };

      setProposals(prev => [newTrade, ...prev]);
      setIsSubmitting(false);
      setNotification(`Trade Escrow PDA Derived: ${newTrade.tradeAddress}. Locked $50.00 USDC Dynasty Collateral via CPI.`);
      setTimeout(() => setNotification(null), 5000);
    }, 1000);
  };

  const handleAcceptTrade = (tradeAddress: string) => {
    setProposals(prev => prev.map(p => {
      if (p.tradeAddress === tradeAddress) {
        if (p.expiresAtUnix <= nowUnix) {
          alert('Error: On-chain Clock::get() evaluates current_time >= expires_at. Trade has EXPIRED.');
          return p;
        }
        return { ...p, status: 'ACCEPTED' };
      }
      return p;
    }));
    setNotification('Instruction Executed: accept_trade signed on-chain before temporal lock expiration.');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleReclaimTrade = (tradeAddress: string) => {
    setProposals(prev => prev.map(p => {
      if (p.tradeAddress === tradeAddress) {
        return { ...p, status: 'RECLAIMED' };
      }
      return p;
    }));
    setNotification('Instruction Executed: reclaim_trade closed PDA and refunded locked assets + collateral.');
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 p-6 md:p-8 border border-emerald-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Coins className="w-64 h-64 text-emerald-400 shrink-0" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            RoundBlock Protocol • Solana Anchor Program (Clock::get() Temporal Lock)
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Escrowed Exploding Trades & Dynasty Pick Collateral
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Trustless multi-asset trade proposals locked inside Solana Program Derived Addresses (PDAs). Enforces 24h temporal lock timers on-chain and transfers 100% USDC league entry fee collateral for future draft picks.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Key className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Program ID: RoundBlock111...111</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Max Swap Constraint: 2:2 Assets</span>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Trade Proposal Creator Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400 shrink-0" />
              Propose New Exploding Trade
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Select temporal lock duration and execute atomic CPI transfer to TradeEscrow PDA
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Temporal Lock Duration:</span>
            {[
              { seconds: 43200, label: '12 Hours' },
              { seconds: 86400, label: '24 Hours (Default)' },
              { seconds: 172800, label: '48 Hours' }
            ].map(d => (
              <button
                key={d.seconds}
                onClick={() => setSelectedDuration(d.seconds)}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedDuration === d.seconds
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offered Assets 2:2 Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase">
              <span>Your Offered Assets (2:2 Limit)</span>
              <span className="text-[10px] font-mono text-slate-500">2 Assets Selected</span>
            </div>
            <div className="space-y-1.5">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono flex justify-between">
                <span>🏈 DeAndre Jackson (5-Star RB Card NFT)</span>
                <span className="text-emerald-400 font-bold">NFT</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono flex justify-between">
                <span>🎟️ 2028 1st Round Draft Pick</span>
                <span className="text-amber-400 font-bold">Future Pick</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cyan-400 uppercase">
              <span>Requested Assets</span>
              <span className="text-[10px] font-mono text-slate-500">1 Asset Selected</span>
            </div>
            <div className="space-y-1.5">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono flex justify-between">
                <span>⚡ Marcus Webb (5-Star WR Card NFT)</span>
                <span className="text-emerald-400 font-bold">NFT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynasty Collateral Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Trading <strong>2028 Future Draft Pick</strong> requires <strong>$50.00 USDC</strong> Dynasty Collateral lock in <code>PickCollateralVault</code> PDA.</span>
          </div>
          <span className="font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 bg-amber-500/20 rounded">CPI Escrow Lock</span>
        </div>

        <button
          onClick={handleProposeTrade}
          disabled={isSubmitting}
          className="w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> Deriving PDA & Executing CPI Transfer...</>
          ) : (
            <><Coins className="w-4 h-4 shrink-0" /> Sign & Propose Exploding Trade ({selectedDuration / 3600}h Expiration)</>
          )}
        </button>
      </div>

      {/* Active Trade Escrow PDAs Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
          Active Trade Escrow PDAs & Expiration Timers
        </h2>

        <div className="grid grid-cols-1 gap-4 min-h-[320px]">
          {proposals.map(proposal => {
            const isExpired = proposal.expiresAtUnix <= nowUnix;
            const isPending = proposal.status === 'PENDING';

            return (
              <div 
                key={proposal.tradeAddress}
                className={`bg-slate-950 border rounded-2xl p-6 space-y-4 shadow-xl transition-colors ${
                  proposal.status === 'ACCEPTED'
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : isExpired
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                {/* Proposal Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-900 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">PDA: {proposal.tradeAddress}</span>
                      <a 
                        href={`https://explorer.solana.com/address/${proposal.tradeAddress}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Sender: {proposal.senderPublicKey} • Recipient: {proposal.recipientPublicKey}
                    </p>
                  </div>

                  {/* Temporal Timer Badge */}
                  <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-black flex items-center gap-2 ${
                    isExpired || proposal.status === 'EXPIRED'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                      : proposal.status === 'ACCEPTED'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>
                      {proposal.status === 'ACCEPTED' 
                        ? 'ACCEPTED (Trade Closed)' 
                        : proposal.status === 'RECLAIMED'
                        ? 'RECLAIMED & REFUNDED'
                        : formatCountdown(proposal.expiresAtUnix)}
                    </span>
                  </div>
                </div>

                {/* Asset Exchange Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Locked Offered Assets (Escrow Vault ATA)</span>
                    <div className="space-y-1">
                      {proposal.senderOfferedAssets.map(asset => (
                        <div key={asset.mintAddress} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 flex justify-between items-center">
                          <span>{asset.assetName}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {asset.assetType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requested Target Assets</span>
                    <div className="space-y-1">
                      {proposal.recipientRequestedAssets.map(asset => (
                        <div key={asset.mintAddress} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 flex justify-between items-center">
                          <span>{asset.assetName}</span>
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {asset.assetType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynasty Collateral Badge */}
                {proposal.requiresDynastyCollateral && (
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Locked Dynasty Collateral:</span>
                    <span className="text-amber-400 font-bold">
                      ${(proposal.collateralUsdcCents / 100).toFixed(2)} USDC (PickCollateralVault PDA)
                    </span>
                  </div>
                )}

                {/* Resolution Action Controls */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-900 flex flex-col sm:flex-row gap-3 justify-end">
                    {!isExpired ? (
                      <button
                        onClick={() => handleAcceptTrade(proposal.tradeAddress)}
                        className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Accept Trade (Before Temporal Lock)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReclaimTrade(proposal.tradeAddress)}
                        className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 shrink-0" /> Reclaim Locked Assets & PDA Refund
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
