import React from "react";
import TeamSlots from "./TeamSlots";
import CharacterCard from "./CharacterCard";
import { SlottedTeam, RoleId } from "../types";

interface MobileOnline2PProps {
  playerName: string;
  opponentName: string;
  playerSlots: SlottedTeam;
  opponentSlots: SlottedTeam;
  activeTurn: boolean;
  isAI?: boolean;
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  onSlotSelect?: (roleId: RoleId) => void;
  onDeploy?: () => void;
  onSkip?: () => void;
}

export default function MobileOnline2P({
  playerName,
  opponentName,
  playerSlots,
  opponentSlots,
  activeTurn,
  isAI = false,
  selectedCardId,
  setSelectedCardId,
  onSlotSelect,
  onDeploy,
  onSkip,
}: MobileOnline2PProps) {
  // Placeholder character for the draft card; in real implementation this would come from game state
  const draftCharacter = {
    id: selectedCardId ?? "placeholder",
    name: "Draft Card",
    image: "https://placehold.co/300x400?text=Draft",
    rarity: "Rare",
    overallPower: 0,
    themeColor: "#ffffff",
    malFallbackUrl: "",
    stats: { strength: 0, speed: 0, defense: 0, iq: 0, magic: 0 },
    skills: [],
    anime: "",
    quote: "",
  };

  return (
    <div className="flex flex-col h-full p-2 bg-black/30 backdrop-blur-lg rounded-xl">
      {/* Opponent slots (compact) */}
      <div className="h-[70px] mb-2">
        <TeamSlots
          playerName={opponentName}
          slots={opponentSlots}
          skipUsed={false}
          activeTurn={false}
          isAI={false}
          layout="compact-vertical"
          isMobile={true}
        />
      </div>

      {/* Central draft card area */}
      <div className="flex-1 flex items-center justify-center mb-2">
        <div className="w-full max-w-[260px]">
          <CharacterCard
            character={draftCharacter as any}
            isFlipped={false}
            activePlayerName={playerName}
            onClickBackSide={() => {
              // No back side for draft card
            }}
            onDragStart={() => {}}
            onDragEnd={() => {}}
          />
        </div>
      </div>

      {/* Player slots (bottom) */}
      <div className="h-[70px] mb-2">
        <TeamSlots
          playerName={playerName}
          slots={playerSlots}
          skipUsed={false}
          activeTurn={activeTurn}
          isAI={isAI}
          layout="compact-vertical"
          isMobile={true}
          onSlotSelect={onSlotSelect}
        />
      </div>

      {/* Action bar */}
      <div className="flex justify-center gap-4 mt-2">
        <button
          className="px-4 py-2 bg-nexus-cyan text-white rounded-lg shadow-md hover:bg-nexus-cyan/80 transition"
          onClick={onDeploy}
        >
          Deploy
        </button>
        <button
          className="px-4 py-2 bg-nexus-purple text-white rounded-lg shadow-md hover:bg-nexus-purple/80 transition"
          onClick={onSkip}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
