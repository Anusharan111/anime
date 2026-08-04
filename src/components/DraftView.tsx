import React from "react";
import { motion } from "motion/react";
import TeamSlots from "./TeamSlots";
import { RoleId, SlottedTeam } from "../types";

type DraftViewProps = {
  isMobile: boolean;
  isMobileDraft: boolean;
  isMobileOnlineDraft: boolean;
  ownOnlineSide: string | null; // "p1" | "p2" | null
  ownOnlineName: string;
  opponentOnlineName: string;
  ownOnlineSlots: SlottedTeam;
  opponentOnlineSlots: SlottedTeam;
  ownOnlineSkipUsed: boolean;
  opponentOnlineSkipUsed: boolean;
  isDraggingActive: boolean;
  activeTurn: "p1" | "p2";
  p1SkipUsed: boolean;
  p2SkipUsed: boolean;
  p1Slots: SlottedTeam;
  p2Slots: SlottedTeam;
  player1Name: string;
  player2Name: string;
  gameMode: string;
  onlineSide: string | null;
  aiIsProcessing: boolean;
  handleSlotSelect: (roleId: RoleId) => void;
  renderDraftCardArea: () => React.ReactElement;
};

const DraftView: React.FC<DraftViewProps> = ({
  isMobile,
  isMobileDraft,
  isMobileOnlineDraft,
  ownOnlineSide,
  ownOnlineName,
  opponentOnlineName,
  ownOnlineSlots,
  opponentOnlineSlots,
  ownOnlineSkipUsed,
  opponentOnlineSkipUsed,
  isDraggingActive,
  activeTurn,
  p1SkipUsed,
  p2SkipUsed,
  p1Slots,
  p2Slots,
  player1Name,
  player2Name,
  gameMode,
  onlineSide,
  aiIsProcessing,
  handleSlotSelect,
  renderDraftCardArea,
}) => {
  return (
    <motion.div key="draft" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      {isMobileDraft ? (
        isMobileOnlineDraft ? (
          <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden touch-none">
            <div className="h-[54px] w-full flex-shrink-0 px-1">
              <TeamSlots
                playerName={opponentOnlineName}
                slots={opponentOnlineSlots}
                skipUsed={opponentOnlineSkipUsed}
                activeTurn={activeTurn !== ownOnlineSide}
                layout="compact-horizontal-top"
                isMobile={true}
              />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_38vw] gap-2 overflow-hidden">
              <div className="relative min-w-0 overflow-hidden rounded-2xl border border-nexus-blue/10 bg-black/20 p-1.5">
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="h-px w-full bg-nexus-cyan absolute top-1/4 animate-pulse" />
                  <div className="h-px w-full bg-nexus-blue absolute top-3/4 animate-pulse delay-500" />
                </div>
                <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden">
                  {renderDraftCardArea()}
                  <div className="mt-1 flex flex-shrink-0 gap-3 rounded-full border border-white/5 bg-black/30 px-2 py-1 text-[7px] font-mono font-black uppercase tracking-wider text-slate-500">
                    <span>P1 {p1SkipUsed ? "USED" : "SKIP"}</span>
                    <span>P2 {p2SkipUsed ? "USED" : "SKIP"}</span>
                  </div>
                </div>
              </div>

              <div className="min-h-0 min-w-[136px] overflow-hidden">
                <TeamSlots
                  playerName={ownOnlineName}
                  slots={ownOnlineSlots}
                  skipUsed={ownOnlineSkipUsed}
                  activeTurn={activeTurn === ownOnlineSide}
                  onSlotSelect={activeTurn === ownOnlineSide ? handleSlotSelect : undefined}
                  isDraggingActive={isDraggingActive && activeTurn === ownOnlineSide}
                  layout="compact-vertical"
                  isMobile={true}
                  isLarge={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:gap-2 w-full flex-1">
            {/* Top Area: Opponent in Online/AI mode */}
            {(gameMode === "online-2p" || gameMode === "vs-ai") && (
              <div className="w-full flex justify-center px-4 animate-fadeInDown">
                <div className="w-full max-w-md">
                  <TeamSlots
                    playerName={gameMode === "vs-ai" ? "Smart AI" : (onlineSide === "p2" ? player1Name : player2Name)}
                    isAI={gameMode === "vs-ai"}
                    slots={onlineSide === "p2" ? p1Slots : p2Slots}
                    skipUsed={onlineSide === "p2" ? p1SkipUsed : p2SkipUsed}
                    activeTurn={activeTurn === (onlineSide === "p2" ? "p1" : "p2")}
                    layout="compact-horizontal-top"
                    isMobile={true}
                  />
                </div>
              </div>
            )}

            <div className="flex items-stretch justify-between gap-1.5 sm:gap-3 w-full flex-1">
              {/* Left Column: P1 in Local 2P mode */}
              {gameMode === "local-2p" && (
                <div className="w-20 sm:w-24 flex-shrink-0 flex flex-col justify-self-stretch animate-fadeInLeft">
                  <TeamSlots
                    playerName={player1Name}
                    slots={p1Slots}
                    skipUsed={p1SkipUsed}
                    activeTurn={activeTurn === "p1"}
                    onSlotSelect={handleSlotSelect}
                    layout="compact-vertical"
                    isMobile={true}
                  />
                </div>
              )}

              {/* Center Column: Active Card */}
              <div className={`flex-1 flex flex-col items-center ${gameMode === "local-2p" ? "justify-center" : "justify-start"} p-1 sm:p-4 relative`}>
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="h-px w-full bg-nexus-cyan absolute top-1/4 animate-pulse" />
                  <div className="h-px w-full bg-nexus-blue absolute top-3/4 animate-pulse delay-500" />
                </div>
                
                {renderDraftCardArea()}

                {/* Mobile Skip status display */}
                <div className="flex gap-4 items-center justify-center mt-4 text-[8px] font-mono font-black uppercase tracking-widest text-slate-500 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${p1SkipUsed ? 'bg-red-500' : 'bg-nexus-purple animate-pulse'}`} />
                    <span>P1: {p1SkipUsed ? "USED" : "SKIP"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${p2SkipUsed ? 'bg-red-500' : 'bg-nexus-purple animate-pulse'}`} />
                    <span>P2: {p2SkipUsed ? "USED" : "SKIP"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Player or P2 Slots */}
              <div className="w-20 sm:w-24 flex-shrink-0 flex flex-col justify-self-stretch animate-fadeInRight">
                <TeamSlots
                  playerName={gameMode === "local-2p" ? player2Name : (onlineSide === "p2" ? player2Name : player1Name)}
                  slots={gameMode === "local-2p" ? p2Slots : (onlineSide === "p2" ? p2Slots : p1Slots)}
                  skipUsed={gameMode === "local-2p" ? p2SkipUsed : (onlineSide === "p2" ? p2SkipUsed : p1SkipUsed)}
                  activeTurn={gameMode === "local-2p" ? activeTurn === "p2" : (gameMode === "online-2p" ? activeTurn === onlineSide : activeTurn === "p1")}
                  onSlotSelect={gameMode === "local-2p"
                    ? handleSlotSelect
                    : ((gameMode !== "online-2p" || activeTurn === onlineSide) ? handleSlotSelect : undefined)
                  }
                  layout="compact-vertical"
                  isMobile={true}
                />
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: P1 Roster */}
          <div className="lg:col-span-3 flex flex-col justify-self-stretch">
            <TeamSlots
              playerName={player1Name}
              slots={p1Slots}
              skipUsed={p1SkipUsed}
              activeTurn={activeTurn === "p1" && !aiIsProcessing}
              onSlotSelect={(gameMode !== "online-2p" || onlineSide === "p1") ? handleSlotSelect : undefined}
              isDraggingActive={isDraggingActive && (gameMode !== "online-2p" || onlineSide === "p1")}
            />
          </div>

          {/* Center: Active Draft Card */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[550px] sm:min-h-[700px] p-4 sm:p-6 relative nexus-glass rounded-3xl border-nexus-blue/10">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="h-px w-full bg-nexus-cyan absolute top-1/4 animate-pulse" />
              <div className="h-px w-full bg-nexus-blue absolute top-3/4 animate-pulse delay-500" />
            </div>
            {renderDraftCardArea()}
          </div>

          {/* Right: P2 Roster */}
          <div className="lg:col-span-3 flex flex-col justify-self-stretch">
            <TeamSlots
              playerName={player2Name}
              isAI={gameMode === "vs-ai"}
              slots={p2Slots}
              skipUsed={p2SkipUsed}
              activeTurn={activeTurn === "p2"}
              onSlotSelect={(gameMode === "local-2p" || (gameMode === "online-2p" && onlineSide === "p2")) ? handleSlotSelect : undefined}
              isDraggingActive={isDraggingActive && (gameMode === "local-2p" || (gameMode === "online-2p" && onlineSide === "p2"))}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DraftView;
