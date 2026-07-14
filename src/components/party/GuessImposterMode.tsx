import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../../types";
import { RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import CharacterCard from "../CharacterCard";
import { sfx } from "../../utils/audio";

interface PlayerInfo {
  id: string;
  name: string;
}

interface GuessImposterModeProps {
  myCharacter: Character;
  players: PlayerInfo[];
  mySocketId: string;
  isHost: boolean;
  votes: Record<string, string>; // socketId -> accusedName
  revealedImposter: { name: string; character: Character } | null;
  civiliansCharacter: Character | null;
  onVote: (accusedName: string) => void;
  onReveal: (imposterSocketId: string) => void;
  onEndGame: () => void;
}

export default function GuessImposterMode({
  myCharacter,
  players,
  mySocketId,
  isHost,
  votes,
  revealedImposter,
  civiliansCharacter,
  onVote,
  onReveal,
  onEndGame,
}: GuessImposterModeProps) {
  const [myVote, setMyVote] = useState<string | null>(null);

  const handleVote = (playerName: string) => {
    if (myVote) return; // already voted
    sfx.playSelect();
    setMyVote(playerName);
    onVote(playerName);
  };

  const voteCount = Object.keys(votes).length;
  const totalPlayers = players.length;

  // Count votes per name
  const voteTally: Record<string, number> = {};
  Object.values(votes).forEach(name => {
    voteTally[name] = (voteTally[name] || 0) + 1;
  });

  // Find most voted
  const topVoted = Object.entries(voteTally).sort((a, b) => b[1] - a[1])[0];

  const handleRevealClick = () => {
    if (!topVoted) return;
    const topPlayer = players.find(p => p.name === topVoted[0]);
    if (!topPlayer) return;
    onReveal(topPlayer.id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-950/50 px-6 py-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black italic tracking-wider text-white">🕵️ GUESS IMPOSTER</h2>
          <p className="text-slate-400 text-sm">Discuss, then vote on who you think is the Imposter!</p>
        </div>
        <button
          onClick={onEndGame}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Reveal section */}
      <AnimatePresence>
        {revealedImposter && civiliansCharacter ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4"
          >
            <h3 className="text-2xl font-black text-rose-400 uppercase tracking-wider">
              🎉 The Imposter was {revealedImposter.name}!
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-slate-400 text-xs font-bold uppercase">Everyone had</span>
                <div className="scale-90 opacity-80">
                  <CharacterCard character={civiliansCharacter} isFlipped={true} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-rose-400 text-xs font-bold uppercase">Imposter had</span>
                <div className="shadow-[0_0_40px_rgba(244,63,94,0.4)] rounded-2xl">
                  <CharacterCard character={revealedImposter.character} isFlipped={true} />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* My character */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-5">
              <div className="shrink-0 w-36">
                <CharacterCard character={myCharacter} isFlipped={true} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Your Character</p>
                <h3 className="text-xl font-black text-white">{myCharacter.name}</h3>
                <p className="text-slate-500 text-sm">{myCharacter.anime}</p>
                <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                  Discuss with the group. Give subtle hints about your character — but don't say the name! Figure out who has a different character.
                </p>
              </div>
            </div>

            {/* Voting section */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Vote for the Imposter
                </h3>
                <span className="text-xs text-slate-500 font-bold">{voteCount}/{totalPlayers} voted</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {players.map(p => {
                  const isMe = p.id === mySocketId;
                  const hasVotedForThis = myVote === p.name;
                  const tally = voteTally[p.name] || 0;

                  return (
                    <button
                      key={p.id}
                      onClick={() => !isMe && handleVote(p.name)}
                      disabled={!!myVote || isMe}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isMe
                          ? "border-white/5 bg-slate-900/30 opacity-40 cursor-not-allowed"
                          : hasVotedForThis
                          ? "border-rose-500 bg-rose-950/40"
                          : myVote
                          ? "border-white/5 bg-slate-900 opacity-60"
                          : "border-white/10 bg-slate-900 hover:border-rose-500/50 hover:bg-rose-950/20 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{p.name}</span>
                        {tally > 0 && (
                          <span className="text-xs font-black text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-500/30">
                            {tally} vote{tally > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isMe && <span className="text-xs text-slate-500">(You)</span>}
                      {hasVotedForThis && (
                        <div className="flex items-center gap-1 mt-1 text-rose-400 text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Your vote
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Host reveals */}
              {isHost && voteCount > 0 && !revealedImposter && topVoted && (
                <button
                  onClick={handleRevealClick}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  REVEAL IMPOSTER ({topVoted[0]} — {topVoted[1]} votes)
                </button>
              )}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
