// Anime Battle Main Application - Mobile Optimized
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";
import {
  Swords,
  Trophy,
  Users,
  Computer,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award,
  AlertCircle,
  Cpu,
  Loader2,
  UserPlus,
  X,
  Globe,
  Plus,
  LogIn
} from "lucide-react";

import { Character, MatchHistory, RoleId, SlottedTeam } from "./types";
import { CHARACTERS } from "./data/characters";
import CharacterCard from "./components/CharacterCard";
import TeamSlots from "./components/TeamSlots";
import MyAnimeListPortal from "./components/MyAnimeListPortal";
import DeployModal from "./components/DeployModal";

type ViewState = "landing" | "draft" | "results";

type BattleReport = {
  p1BattleScore: number;
  p2BattleScore: number;
  p1DuelWins: number;
  p2DuelWins: number;
  drawDuels: number;
  rules: string[];
  duels: Array<{
    role: string;
    label: string;
    p1Name: string;
    p2Name: string;
    p1Score: number;
    p2Score: number;
    winner: "p1" | "p2" | "draw";
    detail: string;
  }>;
  bonuses: {
    p1: Record<string, number>;
    p2: Record<string, number>;
  };
};

const initialSlots: SlottedTeam = {
  captain: null,
  vice_captain: null,
  tank: null,
  healer: null,
  support_1: null,
  support_2: null,
};

import CharacterImage from "./components/CharacterImage";
import { API_BASE, SOCKET_URL } from "./config";

const MIN_CHARACTERS_FOR_FULL_DRAFT = 14;
type Rarity = Character["rarity"];

const getAnimeKey = (anime: string) => anime.trim().toLowerCase();

const buildAnimeCatalog = (characters: Character[]) => {
  const labelsByKey = new Map<string, string>();
  const countsByLabel: Record<string, number> = {};

  for (const character of characters) {
    if (!character.anime) continue;

    const key = getAnimeKey(character.anime);
    if (!labelsByKey.has(key)) {
      labelsByKey.set(key, character.anime);
    }

    const label = labelsByKey.get(key)!;
    countsByLabel[label] = (countsByLabel[label] || 0) + 1;
  }

  return {
    animeList: [...labelsByKey.values()].sort(),
    animeCounts: countsByLabel,
  };
};

const getRequiredRarityForTeam = (slots: SlottedTeam): Rarity | null => {
  const team = Object.values(slots).filter(Boolean) as Character[];
  const hasLegendary = team.some((character) => character.rarity === "Legendary");
  const hasEpic = team.some((character) => character.rarity === "Epic");

  // Introduce 40% chance of total randomness to prevent same characters from appearing every game
  if (Math.random() < 0.4) return null;

  if (!hasLegendary) return "Legendary";
  if (!hasEpic) return "Epic";
  return null;
};

export default function App() {
  // Game Setup States
  const [view, setView] = useState<ViewState>("landing");
  const [category, setCategory] = useState<"all" | "choose">("all");
  const [selectedAnimes, setSelectedAnimes] = useState<string[]>([]);
  const [animeSearchQuery, setAnimeSearchQuery] = useState("");
  const [isAnimeDropdownOpen, setIsAnimeDropdownOpen] = useState(false);
  const [importedCastAnimes, setImportedCastAnimes] = useState<Set<string>>(() => new Set());
  const [player1Name, setPlayer1Name] = useState("Hero Picker");
  const [player2Name, setPlayer2Name] = useState("AI Overlord");
  const [gameMode, setGameMode] = useState<"vs-ai" | "local-2p" | "online-2p">("vs-ai");

  // Online Multiplayer States
  const [onlineRoomId, setOnlineRoomId] = useState<string | null>(null);
  const [onlineSide, setOnlineSide] = useState<"p1" | "p2" | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [onlineAction, setOnlineAction] = useState<"create" | "join" | null>(null);

  // Active Draft Slotted States
  const [round, setRound] = useState(1);
  const [activeTurn, setActiveTurn] = useState<"p1" | "p2">("p1");
  const [p1Slots, setP1Slots] = useState<SlottedTeam>(initialSlots);
  const [p2Slots, setP2Slots] = useState<SlottedTeam>(initialSlots);
  const [p1SkipUsed, setP1SkipUsed] = useState(false);
  const [p2SkipUsed, setP2SkipUsed] = useState(false);

  // Computes flat teams for compatibility with other game engines
  const p1Team = Object.values(p1Slots).filter(Boolean) as Character[];
  const p2Team = Object.values(p2Slots).filter(Boolean) as Character[];

  // Drag-and-drop state to highlight slots during active player drags
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  // Character pool track
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [mustPick, setMustPick] = useState(false);
  const [aiIsProcessing, setAiIsProcessing] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    const lockDraftScroll = isMobile && view === "draft";
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyHeight = document.body.style.height;
    const previousHtmlHeight = document.documentElement.style.height;

    if (lockDraftScroll) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.height = "100dvh";
      document.documentElement.style.height = "100dvh";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.height = previousBodyHeight;
      document.documentElement.style.height = previousHtmlHeight;
    };
  }, [isMobile, view]);

  // Result States
  const [loadingResult, setLoadingResult] = useState(false);
  const [resultData, setResultData] = useState<{
    player1Power: number;
    player2Power: number;
    p1SubStats: any;
    p2SubStats: any;
    winner: string;
    winnerId: "p1" | "p2" | "draw";
    mvp: Character;
    commentary: string;
    battleReport?: BattleReport;
  } | null>(null);

  // Global States
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [hottestSpotlight, setHottestSpotlight] = useState<Character>(CHARACTERS[0]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [totalCharacters, setTotalCharacters] = useState(CHARACTERS.length);
  const [animeCounts, setAnimeCounts] = useState<Record<string, number>>(() => buildAnimeCatalog(CHARACTERS).animeCounts);
  const aboutCharacter = CHARACTERS.find((character) => character.name === "Lelouch Lamperouge") ?? CHARACTERS[0];

  // Extract unique anime names from the character pool
  const [animeList, setAnimeList] = useState<string[]>(() => {
    return buildAnimeCatalog(CHARACTERS).animeList;
  });
  const selectedAnimeCharacterCount = selectedAnimes.reduce(
    (total, anime) => total + (animeCounts[anime] || 0),
    0
  );
  const hasEnoughSelectedCharacters =
    category !== "choose" ||
    (selectedAnimes.length > 0 && selectedAnimeCharacterCount >= MIN_CHARACTERS_FOR_FULL_DRAFT);

  const importCastForAnime = async (anime: string) => {
    const key = getAnimeKey(anime);
    if (importedCastAnimes.has(key)) return;

    const res = await fetch(`${API_BASE}/api/anime/import-cast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeTitle: anime, limit: 40 }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Could not import ${anime}.`);
    }

    setImportedCastAnimes(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    await fetchTotalCharactersCount();
  };

  const importStarterAllAnimeCasts = async () => {
    const starterAnimes = [
      "Jujutsu Kaisen",
      "One Piece",
      "Attack on Titan",
      "Naruto",
      "Bleach",
      "Demon Slayer: Kimetsu no Yaiba",
    ];

    try {
      await Promise.all(starterAnimes.map(anime => importCastForAnime(anime)));
    } catch (error) {
      console.warn("Auto import failed", error);
    }
  };

  const fetchTotalCharactersCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/characters`);
      if (res.ok) {
        const data = await res.json();
        setTotalCharacters(data.length);
        // Build unique anime list
        const animeCatalog = buildAnimeCatalog(data);
        setAnimeList(animeCatalog.animeList);
        setAnimeCounts(animeCatalog.animeCounts);
        return data as Character[];
      }
    } catch (e) {
      console.error("Failed to fetch characters list size", e);
    }
    return null;
  };

  // Stable refs so async/socket callbacks always access latest values without stale closures
  const onlineRoomIdRef = useRef<string | null>(null);
  const onlineSideRef = useRef<"p1" | "p2" | null>(null);
  const gameModeRef = useRef<"vs-ai" | "local-2p" | "online-2p">("vs-ai");
  const socketRef = useRef<Socket | null>(null);
  const pullNewCharacterRef = useRef<
    (excludes: string[], animes: string[], slots: SlottedTeam) => Promise<void>
  >(async () => {});

  useEffect(() => { onlineRoomIdRef.current = onlineRoomId; }, [onlineRoomId]);
  useEffect(() => { onlineSideRef.current = onlineSide; }, [onlineSide]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

  const resetOnlineLobby = useCallback(() => {
    setOnlineRoomId(null);
    onlineRoomIdRef.current = null;
    setIsWaitingForOpponent(false);
    setOnlineSide(null);
    onlineSideRef.current = null;
    setView("landing");
    setIsDeployModalOpen(false);
  }, []);

  const ensureSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;

    if (!socketRef.current) {
      const newSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelay: 1000,
      });

      newSocket.on("room-created", ({ roomId, side }) => {
        setOnlineRoomId(roomId);
        setOnlineSide(side);
        onlineSideRef.current = side;
        setIsWaitingForOpponent(true);
        setOnlineAction(null);
      });

      newSocket.on("game-started", ({ roomId, p1Name, p2Name, side }) => {
        setOnlineRoomId(roomId);
        onlineRoomIdRef.current = roomId;
        setOnlineSide(side);
        onlineSideRef.current = side;
        setPlayer1Name(p1Name);
        setPlayer2Name(p2Name);
        setIsWaitingForOpponent(false);
        setOnlineAction(null);
        setRound(1);
        setActiveTurn("p1");
        setP1Slots(initialSlots);
        setP2Slots(initialSlots);
        setP1SkipUsed(false);
        setP2SkipUsed(false);
        setExcludedIds([]);
        setMustPick(false);
        setResultData(null);
        setView("draft");
        setIsDeployModalOpen(false);
        importStarterAllAnimeCasts().catch(() => {});
        // Only P1 pulls the first card; P2 receives it via game-state-updated
        if (side === "p1") {
          requestAnimationFrame(() => {
            pullNewCharacterRef.current([], [], initialSlots);
          });
        }
      });

      newSocket.on("game-state-updated", (state) => {
        if (state.round) setRound(state.round);
        if (state.activeTurn) setActiveTurn(state.activeTurn);
        if (state.p1Slots) setP1Slots(state.p1Slots);
        if (state.p2Slots) setP2Slots(state.p2Slots);
        if (state.p1SkipUsed !== undefined) setP1SkipUsed(state.p1SkipUsed);
        if (state.p2SkipUsed !== undefined) setP2SkipUsed(state.p2SkipUsed);
        if (state.excludedIds) setExcludedIds(state.excludedIds);
        if (state.activeCharacter !== undefined) setActiveCharacter(state.activeCharacter);
        if (state.isCardFlipped !== undefined) setIsCardFlipped(state.isCardFlipped);
        if (state.mustPick !== undefined) setMustPick(state.mustPick);
        if (state.view) setView(state.view);
        if (state.loadingResult !== undefined) setLoadingResult(state.loadingResult);
        if (statsMatch(state.resultData)) setResultData(state.resultData);
      });

      newSocket.on("player-disconnected", () => {
        alert("Opponent disconnected. Returning to lobby.");
        resetOnlineLobby();
      });

      newSocket.on("room-cancelled", () => {
        alert("Host cancelled the room.");
        resetOnlineLobby();
      });

      newSocket.on("error", (msg) => {
        alert(msg);
      });

      socketRef.current = newSocket;
    } else {
      socketRef.current.connect();
    }

    return socketRef.current;
  }, [resetOnlineLobby]);

  // Load history and characters on startup (socket connects lazily for online mode)
  useEffect(() => {
    fetchMatchHistory();
    fetchTotalCharactersCount();
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  // Auto-calculate winner in online mode when both teams are full (driven by P1)
  useEffect(() => {
    if (gameMode === "online-2p" && onlineSide === "p1") {
      const p1Full = Object.values(p1Slots).every(v => v !== null);
      const p2Full = Object.values(p2Slots).every(v => v !== null);
      if (p1Full && p2Full && view === "draft") {
        const team1 = Object.values(p1Slots).filter(Boolean) as Character[];
        const team2 = Object.values(p2Slots).filter(Boolean) as Character[];
        calculateWinner(team1, team2);
      }
    }
  }, [p1Slots, p2Slots, gameMode, onlineSide, view]);

  const statsMatch = (data: any) => {
    return data && data.winnerId;
  };

  const createOnlineRoom = () => {
    const activeSocket = ensureSocket();
    setGameMode("online-2p");
    activeSocket.emit("create-room", player1Name.trim() || "Player 1");
  };

  const joinOnlineRoom = () => {
    if (!joinRoomId.trim()) return;
    const activeSocket = ensureSocket();
    setGameMode("online-2p");
    activeSocket.emit("join-room", {
      roomId: joinRoomId.toUpperCase(),
      playerName: player1Name.trim() || "Player 2",
    });
  };

  const syncGameState = (updates: Record<string, unknown>) => {
    const activeSocket = socketRef.current;
    if (!activeSocket?.connected || !onlineRoomIdRef.current) return;
    activeSocket.emit("sync-game-state", { roomId: onlineRoomIdRef.current, state: updates });
  };

  // Spotlight rotation effect
  useEffect(() => {
    // Disable background rotation during active draft/results to save resources
    if (view !== "landing") return;

    const interval = setInterval(async () => {
      try {
        const unusedChars = CHARACTERS.filter(c => c.id !== hottestSpotlight.id);
        const randomChar = unusedChars[Math.floor(Math.random() * unusedChars.length)];
        setHottestSpotlight(randomChar);
      } catch (e) {
        console.warn("Spotlight rotation error", e);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [hottestSpotlight.id, view]);

  const fetchMatchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/draft/history`);
      if (res.ok) {
        const data = await res.json();
        setMatchHistory(data);
      }
    } catch (e) {
      console.error("Failed to load match history", e);
    }
  };

  // ---------------- GAMEPLAY MOTIONS ----------------

  const startNewGame = async (mode: "vs-ai" | "local-2p" | "online-2p") => {
    if (mode === "online-2p") {
      if (!onlineRoomIdRef.current) {
        alert("Please create or join a room first.");
        return;
      }
      if (onlineSideRef.current !== "p1") {
        alert("Only the host can start a Revenge Match.");
        return;
      }

      // Reset game states locally
      setRound(1);
      setActiveTurn("p1");
      setP1Slots(initialSlots);
      setP2Slots(initialSlots);
      setP1SkipUsed(false);
      setP2SkipUsed(false);
      setExcludedIds([]);
      setMustPick(false);
      setResultData(null);
      setView("draft");
      setIsDeployModalOpen(false);

      // Sync the initial states and view to P2
      syncGameState({
        round: 1,
        activeTurn: "p1",
        p1Slots: initialSlots,
        p2Slots: initialSlots,
        p1SkipUsed: false,
        p2SkipUsed: false,
        excludedIds: [],
        mustPick: false,
        resultData: null,
        view: "draft",
        activeCharacter: null,
        isCardFlipped: true,
      });

      // Pull first card for P1
      pullNewCharacter([], [], initialSlots);
      return;
    }

    if (category === "choose" && selectedAnimes.length === 0) {
      return;
    }

    setIsStartingGame(true);
    try {
      const targets = category === "choose"
        ? selectedAnimes
        : ["Jujutsu Kaisen", "One Piece", "Attack on Titan", "Naruto", "Bleach", "Demon Slayer: Kimetsu no Yaiba"];

      // Parallelize imports to save time
      await Promise.all(targets.map(anime => importCastForAnime(anime)));
    } catch (error) {
      console.warn("Auto import failed", error);
    }

    const latestPool = await fetchTotalCharactersCount();
    setIsStartingGame(false);

    const latestCounts = latestPool ? buildAnimeCatalog(latestPool).animeCounts : animeCounts;
    const latestSelectedCount = selectedAnimes.reduce(
      (total, anime) => total + (latestCounts[anime] || 0),
      0
    );

    if (category === "choose" && latestSelectedCount < MIN_CHARACTERS_FOR_FULL_DRAFT) {
      return;
    }

    setGameMode(mode);
    setPlayer1Name(player1Name.trim() || "Player 1");
    setPlayer2Name(mode === "vs-ai" ? "Smart AI" : player2Name.trim() || "Player 2");

    // Reset game states
    setRound(1);
    setActiveTurn("p1");
    setP1Slots(initialSlots);
    setP2Slots(initialSlots);
    setP1SkipUsed(false);
    setP2SkipUsed(false);
    setExcludedIds([]);
    setMustPick(false);
    setResultData(null);
    setIsDeployModalOpen(false);

    // Resolve the final active anime list ONCE here and pass it through
    // the entire game flow — never re-read from state inside async callbacks
    let activeAnimes: string[] = [];
    if (category === "choose") {
      activeAnimes = [...selectedAnimes];
      // Handle edge case: category is "choose" but user typed a query without selecting
      if (activeAnimes.length === 0 && animeSearchQuery.trim()) {
        const query = animeSearchQuery.trim();
        const match = animeList.find(a => a.toLowerCase().includes(query.toLowerCase()));
        const resolved = match || query;
        activeAnimes = [resolved];
        setSelectedAnimes(activeAnimes);
      }
    }

    // Pass activeAnimes explicitly — avoids stale state reads in async callbacks
    pullNewCharacter([], activeAnimes, initialSlots);
    setView("draft");
  };

  /**
   * Pull a random character from the API.
   *
   * @param currentExcludes - IDs already picked/skipped this game
   * @param activeAnimes    - The resolved anime filter for this game session.
   *                          Always pass explicitly — never rely on reading
   *                          `category`/`selectedAnimes` state inside this function,
   *                          because React state closures inside async code can be stale.
   */
  const pullNewCharacter = async (
    currentExcludes: string[],
    activeAnimes: string[],
    targetSlots: SlottedTeam
  ) => {
    setIsCardFlipped(true); // Flip card back to hide while loading
    setActiveCharacter(null); // Clear previous to prevent visual artifacts
    const requiredRarity = getRequiredRarityForTeam(targetSlots);

    try {
      let url = `${API_BASE}/api/characters/random?exclude=${currentExcludes.join(",")}`;
      if (activeAnimes.length > 0) {
        url += `&animes=${encodeURIComponent(activeAnimes.join(","))}`;
      }
      if (requiredRarity) {
        url += `&rarity=${encodeURIComponent(requiredRarity)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("API signal lost");

      const character = await res.json();
      const reveal = () => {
        setActiveCharacter(character);
        setIsCardFlipped(true);
        if (gameModeRef.current === "online-2p") {
          syncGameState({ activeCharacter: character, isCardFlipped: true });
        }
      };
      if (gameModeRef.current === "online-2p") {
        reveal();
      } else {
        setTimeout(reveal, 300);
      }
    } catch (er) {
      // Client-side fallback if network cuts out
      let available = CHARACTERS.filter((c) => !currentExcludes.includes(c.id));
      if (activeAnimes.length > 0) {
        const filtered = available.filter((c) =>
          c.anime && activeAnimes.some(anime => c.anime.toLowerCase().includes(anime.toLowerCase()))
        );
        available = filtered;
      }
      if (requiredRarity) {
        const rarityFiltered = available.filter((c) => c.rarity === requiredRarity);
        if (rarityFiltered.length > 0) {
          available = rarityFiltered;
        }
      }
      const backup = available[Math.floor(Math.random() * available.length)];
      if (!backup) {
        setActiveCharacter(null);
        return;
      }
      const revealBackup = () => {
        setActiveCharacter(backup);
        setIsCardFlipped(true);
        if (gameModeRef.current === "online-2p") {
          syncGameState({ activeCharacter: backup, isCardFlipped: true });
        }
      };
      if (gameModeRef.current === "online-2p") {
        revealBackup();
      } else {
        setTimeout(revealBackup, 300);
      }
    }
  };

  pullNewCharacterRef.current = pullNewCharacter;

  // Handle slot placement manually by drag or select
  const handleSlotSelect = (roleId: RoleId) => {
    if (!activeCharacter) return;
    if (isCardFlipped) return; // Prevent card slot insertion before reveal
    if (gameMode === "online-2p" && activeTurn !== onlineSide) return;

    const activeSlots = activeTurn === "p1" ? p1Slots : p2Slots;
    if (activeSlots[roleId]) return; // slot already occupied

    // Clean up character names to prevent duplicates matching different ID strings (e.g. mal-17 vs anilist-17 or different casing)
    const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const pickedCharacters = [...Object.values(p1Slots), ...Object.values(p2Slots)].filter(Boolean) as Character[];
    const pickedIds = new Set(pickedCharacters.map((c) => c.id));
    const pickedNames = new Set(pickedCharacters.map((c) => normalizeName(c.name)));

    // Resolve activeAnimes from current state
    const activeAnimes = category === "choose" ? [...selectedAnimes] : [];

    const updatedExcludes = [...excludedIds, activeCharacter.id];
    
    // Check if duplicate ID or if duplicate normalized name exists in the drafted rosters
    if (pickedIds.has(activeCharacter.id) || pickedNames.has(normalizeName(activeCharacter.name))) {
      setExcludedIds(updatedExcludes);
      pullNewCharacter(updatedExcludes, activeAnimes, activeSlots);
      if (gameMode === "online-2p") {
        syncGameState({ excludedIds: updatedExcludes });
      }
      return;
    }

    setExcludedIds(updatedExcludes);

    if (activeTurn === "p1") {
      const nextSlots = { ...p1Slots, [roleId]: activeCharacter };
      setP1Slots(nextSlots);
      setMustPick(false);

      const nextTeam = Object.values(nextSlots).filter(Boolean) as Character[];

      if (gameMode === "local-2p") {
        setActiveTurn("p2");
        pullNewCharacter(updatedExcludes, activeAnimes, p2Slots);
      } else if (gameMode === "online-2p") {
        setActiveTurn("p2");
        syncGameState({
          p1Slots: nextSlots,
          activeTurn: "p2",
          excludedIds: updatedExcludes,
          mustPick: false,
          activeCharacter: null, // Clear on other side
          isCardFlipped: true
        });
        pullNewCharacter(updatedExcludes, activeAnimes, p2Slots);
      } else {
        // AI Turn — pass activeAnimes so AI's async flow uses the same filter
        setActiveTurn("p2");
        triggerAiTurn(nextTeam, p2Slots, updatedExcludes, activeAnimes, round);
      }
    } else {
      // Local or Online P2 Turn
      const nextSlots = { ...p2Slots, [roleId]: activeCharacter };
      setP2Slots(nextSlots);
      setMustPick(false);

      const nextTeam = Object.values(nextSlots).filter(Boolean) as Character[];

      if (round < 6) {
        setRound(round + 1);
        setActiveTurn("p1");
        pullNewCharacter(updatedExcludes, activeAnimes, p1Slots);
        if (gameMode === "online-2p") {
          syncGameState({
            p2Slots: nextSlots,
            activeTurn: "p1",
            round: round + 1,
            excludedIds: updatedExcludes,
            mustPick: false,
            activeCharacter: null,
            isCardFlipped: true
          });
        }
      } else {
        const p1CurrentTeam = Object.values(p1Slots).filter(Boolean) as Character[];
        // In online mode, the useEffect hook triggers the winner calculation on P1's client to synchronize both sides
        if (gameModeRef.current !== "online-2p") {
          calculateWinner(p1CurrentTeam, nextTeam);
        }
        if (gameModeRef.current === "online-2p") {
          syncGameState({
            p2Slots: nextSlots,
            excludedIds: updatedExcludes,
            mustPick: false,
            activeCharacter: null
          });
        }
      }
    }
  };

  // Quick fallback if player hits "Pick Character" directly
  const handlePick = (character: Character) => {
    const activeSlots = activeTurn === "p1" ? p1Slots : p2Slots;
    const firstEmpty = (Object.keys(activeSlots) as RoleId[]).find((key) => !activeSlots[key]);
    if (firstEmpty) {
      handleSlotSelect(firstEmpty);
    }
  };

  const handleSkip = () => {
    if (gameMode === "online-2p" && activeTurn !== onlineSide) return;

    if (activeTurn === "p1") {
      if (p1SkipUsed) return;
      setP1SkipUsed(true);
    } else {
      if (p2SkipUsed) return;
      setP2SkipUsed(true);
    }

    if (!activeCharacter) return;

    const activeAnimes = category === "choose" ? [...selectedAnimes] : [];
    const nextExcludes = [...excludedIds, activeCharacter.id];
    setExcludedIds(nextExcludes);
    setMustPick(true); // Player must pick the next revealed fighter
    pullNewCharacter(nextExcludes, activeAnimes, activeTurn === "p1" ? p1Slots : p2Slots);

    if (gameMode === "online-2p") {
      syncGameState({
        p1SkipUsed: activeTurn === "p1" ? true : p1SkipUsed,
        p2SkipUsed: activeTurn === "p2" ? true : p2SkipUsed,
        excludedIds: nextExcludes,
        mustPick: true,
        activeCharacter: null,
        isCardFlipped: true
      });
    }
  };

  // ---------------- AI LOGIC SIMULATION ----------------

  const selectAiSlot = (character: Character, currentAiSlots: SlottedTeam): RoleId => {
    const emptyKeys = (Object.keys(currentAiSlots) as RoleId[]).filter((k) => !currentAiSlots[k]);
    if (emptyKeys.length === 0) return "captain"; // Safety fallback

    if (emptyKeys.includes("captain") && character.overallPower >= 400) return "captain";
    if (emptyKeys.includes("tank") && character.stats.defense >= 80) return "tank";
    if (emptyKeys.includes("healer") && (character.stats.magic >= 80 || character.stats.iq >= 75)) return "healer";
    if (emptyKeys.includes("vice_captain") && character.overallPower >= 350) return "vice_captain";
    if (emptyKeys.includes("support_1") && character.stats.speed >= 75) return "support_1";
    if (emptyKeys.includes("support_2") && character.stats.magic >= 75) return "support_2";

    return emptyKeys[0];
  };

  /**
   * Run the AI's turn.
   *
   * @param activeAnimes - Passed explicitly so all nested async callbacks
   *                       use the same filter value without reading stale state.
   */
  const triggerAiTurn = (
    p1CurrentTeam: Character[],
    currentAiSlots: SlottedTeam,
    currentExcludes: string[],
    activeAnimes: string[],
    currentRound: number
  ) => {
    setAiIsProcessing(true);

    // Helper: fetch a random character respecting the anime filter
    const fetchCandidate = async (excludes: string[], targetSlots: SlottedTeam): Promise<Character> => {
      const requiredRarity = getRequiredRarityForTeam(targetSlots);
      try {
        let url = `${API_BASE}/api/characters/random?exclude=${excludes.join(",")}`;
        if (activeAnimes.length > 0) {
          url += `&animes=${encodeURIComponent(activeAnimes.join(","))}`;
        }
        if (requiredRarity) {
          url += `&rarity=${encodeURIComponent(requiredRarity)}`;
        }
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (_) { }

      // Fallback to local pool
      let available = CHARACTERS.filter((c) => !excludes.includes(c.id));
      if (activeAnimes.length > 0) {
        const filtered = available.filter((c) =>
          c.anime && activeAnimes.some(anime => c.anime.toLowerCase().includes(anime.toLowerCase()))
        );
        available = filtered;
      }
      if (requiredRarity) {
        const rarityFiltered = available.filter((c) => c.rarity === requiredRarity);
        if (rarityFiltered.length > 0) {
          available = rarityFiltered;
        }
      }
      return available[Math.floor(Math.random() * available.length)] || CHARACTERS[0];
    };

    setTimeout(async () => {
      const candidate = await fetchCandidate(currentExcludes, currentAiSlots);

      setActiveCharacter(candidate);
      setIsCardFlipped(true);

      // AI "thinks" then reveals
      setTimeout(() => {
        setIsCardFlipped(false);

        setTimeout(async () => {
          const decisionCriteria = 430;
          const shouldSkip = candidate.overallPower < decisionCriteria && !p2SkipUsed;

          if (shouldSkip) {
            // AI decides to skip
            setP2SkipUsed(true);
            const nextExcludes = [...currentExcludes, candidate.id];
            setExcludedIds(nextExcludes);

            setTimeout(async () => {
              const forcedCandidate = await fetchCandidate(nextExcludes, currentAiSlots);

              setActiveCharacter(forcedCandidate);
              setIsCardFlipped(true);

              setTimeout(() => {
                setIsCardFlipped(false);

                setTimeout(() => {
                  const chosenSlot = selectAiSlot(forcedCandidate, currentAiSlots);
                  const nextSlots = { ...currentAiSlots, [chosenSlot]: forcedCandidate };
                  setP2Slots(nextSlots);

                  const finalTeam = Object.values(nextSlots).filter(Boolean) as Character[];
                  const finalExcludes = [...nextExcludes, forcedCandidate.id];
                  setExcludedIds(finalExcludes);

                  advanceRoundOrFinish(p1CurrentTeam, finalTeam, finalExcludes, activeAnimes, currentRound);
                }, 1200);
              }, 1000);
            }, 800);

          } else {
            // AI decides to pick
            const chosenSlot = selectAiSlot(candidate, currentAiSlots);
            const nextSlots = { ...currentAiSlots, [chosenSlot]: candidate };
            setP2Slots(nextSlots);

            const finalTeam = Object.values(nextSlots).filter(Boolean) as Character[];
            const finalExcludes = [...currentExcludes, candidate.id];
            setExcludedIds(finalExcludes);

            advanceRoundOrFinish(p1CurrentTeam, finalTeam, finalExcludes, activeAnimes, currentRound);
          }
        }, 1500);
      }, 1000);
    }, 1000);
  };

  /**
   * Advance to the next round or end the game.
   *
   * @param activeAnimes - Forwarded explicitly so pullNewCharacter uses
   *                       the correct filter without a stale state read.
   */
  const advanceRoundOrFinish = (
    team1: Character[],
    team2: Character[],
    excludes: string[],
    activeAnimes: string[],
    currentRound: number
  ) => {
    setAiIsProcessing(false);
    if (currentRound < 6) {
      const nextRound = currentRound + 1;
      setRound(nextRound);
      setActiveTurn("p1");
      pullNewCharacter(excludes, activeAnimes, p1Slots);
    } else {
      calculateWinner(team1, team2);
    }
  };

  // ---------------- WINNER CALCULATIONS ----------------

  const calculateWinner = async (team1: Character[], team2: Character[]) => {
    setView("results");
    setLoadingResult(true);
    if (gameMode === "online-2p") {
      syncGameState({ view: "results", loadingResult: true });
    }

    try {
      const res = await fetch(`${API_BASE}/api/draft/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player1Name,
          player2Name,
          player1Team: team1,
          player2Team: team2,
          player1Slots: p1Slots,
          player2Slots: p2Slots,
        }),
      });

      if (res.ok) {
        const stats = await res.json();
        setResultData(stats);
        if (gameMode === "online-2p") {
          syncGameState({ resultData: stats, view: "results", loadingResult: false });
        }

        await fetch(`${API_BASE}/api/draft/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player1Name,
            player2Name,
            player1Team: team1,
            player2Team: team2,
            player1Power: stats.player1Power,
            player2Power: stats.player2Power,
            winner: stats.winner,
            mvp: stats.mvp,
            commentary: stats.commentary,
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }),
        });

        fetchMatchHistory();
      }
    } catch (e) {
      console.error("Match winner calculation error", e);
      if (gameMode === "online-2p") {
        syncGameState({ loadingResult: false });
      }
    } finally {
      setLoadingResult(false);
    }
  };

  const renderDraftCardArea = () => {
    return (
      <>
        {activeCharacter ? (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full animate-fadeIn relative z-10">
            {aiIsProcessing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl border border-nexus-purple/20">
                <div className="space-y-4 sm:space-y-6 text-center p-4">
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-nexus-purple/20 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-4 rounded-full border-2 border-nexus-purple animate-ping" />
                    <Cpu className="w-6 h-6 sm:w-10 sm:h-10 text-nexus-purple" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-mono text-nexus-purple font-black uppercase tracking-[0.2em] animate-pulse">
                      Analyzing Stats Matrix...
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-slate-500 font-mono">Optimizing combat equilibrium</p>
                  </div>
                </div>
              </div>
            )}

            <CharacterCard
              character={activeCharacter}
              isFlipped={isCardFlipped}
              activePlayerName={activeTurn === "p1" ? player1Name : player2Name}
              activeTurn={activeTurn}
              onClickBackSide={() => {
                if (gameMode === "online-2p" && activeTurn !== onlineSide) return;
                setIsCardFlipped(false);
                if (gameMode === "online-2p") {
                  syncGameState({ isCardFlipped: false });
                }
              }}
              onDragStart={(e) => {
                if (gameMode === "online-2p" && activeTurn !== onlineSide) {
                  e.preventDefault();
                  return;
                }
                if (e.dataTransfer) {
                  e.dataTransfer.setData("text/plain", activeCharacter.id);
                  e.dataTransfer.effectAllowed = "move";
                }
                setIsDraggingActive(true);
              }}
              onDragEnd={() => setIsDraggingActive(false)}
              onTouchDrop={(roleId) => {
                if (gameMode === "online-2p" && activeTurn !== onlineSide) return;
                handleSlotSelect(roleId as RoleId);
              }}
            />

            <AnimatePresence>
              {isCardFlipped ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-2 py-2 select-none"
                >
                  <p className="text-xs sm:text-sm font-mono text-nexus-cyan font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center justify-center gap-2 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> CLICK TO DECRYPT <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </p>
                  <p className="text-[8px] sm:text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                    Identify your next tactical asset
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2.5 w-full max-w-[320px] sm:max-w-[360px] px-2"
                >
                  {!aiIsProcessing && (
                    <>
                      <button
                        id={`btn-pick-${activeCharacter.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (gameMode === "online-2p" && activeTurn !== onlineSide) return;
                          setIsDeployModalOpen(true);
                        }}
                        className="group relative w-full py-4 sm:py-4 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(30,144,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all active:scale-95 cursor-pointer touch-manipulation"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-nexus-blue via-nexus-cyan to-nexus-blue bg-[length:200%_100%] animate-pulse" />
                        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-white font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase">
                          <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> RECRUIT TO TEAM
                        </div>
                      </button>

                      <button
                        id={`btn-skip-${activeCharacter.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkip();
                        }}
                        disabled={activeTurn === "p1" ? p1SkipUsed : p2SkipUsed}
                        className={`w-full py-3 sm:py-3 rounded-xl border-2 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${(activeTurn === "p1" ? !p1SkipUsed : !p2SkipUsed)
                            ? "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 cursor-pointer shadow-lg"
                            : "border-white/5 bg-white/5 text-slate-600 cursor-not-allowed opacity-40"
                          }`}
                      >
                        <Zap className="w-3 h-3" /> TACTICAL SKIP {activeTurn === "p1" ? (p1SkipUsed ? "(OFFLINE)" : "(ACTIVE)") : (p2SkipUsed ? "(OFFLINE)" : "(ACTIVE)")}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-nexus-blue animate-spin" />
            {gameMode === "online-2p" && activeTurn !== onlineSide ? (
              <p className="text-fuchsia-400 font-mono text-[8.5px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] animate-pulse">
                Waiting for {activeTurn === "p1" ? player1Name : player2Name}...
              </p>
            ) : (
              <p className="text-nexus-cyan font-mono text-[8.5px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] animate-pulse">Scanning Multiverse...</p>
            )}
          </div>
        )}
      </>
    );
  };

  const isMobileDraft = isMobile && view === "draft";
  const isMobileOnlineDraft = isMobileDraft && gameMode === "online-2p";
  const ownOnlineSide = onlineSide ?? activeTurn;
  const ownOnlineSlots = ownOnlineSide === "p2" ? p2Slots : p1Slots;
  const opponentOnlineSlots = ownOnlineSide === "p2" ? p1Slots : p2Slots;
  const ownOnlineSkipUsed = ownOnlineSide === "p2" ? p2SkipUsed : p1SkipUsed;
  const opponentOnlineSkipUsed = ownOnlineSide === "p2" ? p1SkipUsed : p2SkipUsed;
  const ownOnlineName = ownOnlineSide === "p2" ? player2Name : player1Name;
  const opponentOnlineName = ownOnlineSide === "p2" ? player1Name : player2Name;

  return (
    <div className={`${isMobileDraft ? "h-[100dvh] overflow-hidden" : "min-h-screen overflow-x-hidden"} bg-[#050816] text-slate-100 flex flex-col justify-between font-sans relative selection:bg-nexus-cyan/30`}>
      {/* 🌌 Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#050816_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e90ff08_1px,transparent_1px),linear-gradient(to_bottom,#1e90ff08_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)] opacity-40 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-nexus-cyan rounded-full animate-pulse opacity-40 delay-700" />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-nexus-purple rounded-full animate-bounce opacity-20 delay-1000" />
      </div>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 nexus-glass border-b border-nexus-blue/20 py-2 px-2 sm:py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("landing")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center shadow-[0_0_20px_rgba(30,144,255,0.4)] group-hover:scale-110 transition-transform duration-300">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-[0.1em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-nexus-cyan to-nexus-purple nexus-glow-text">
                Anime Battle
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono tracking-widest text-nexus-cyan/70 uppercase">Battle System v2.0</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-leaderboard"
              onClick={() => {
                setShowLeaderboard(!showLeaderboard);
                setView("landing");
              }}
              className="py-1.5 px-3 rounded-lg nexus-glass border border-white/5 hover:border-nexus-cyan/40 text-[9px] sm:text-[10px] font-mono font-bold text-slate-300 transition-all flex items-center gap-1.5 group"
            >
              <Award className="w-3 h-3 text-nexus-cyan group-hover:scale-125 transition-transform" /> TOP
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-1 py-2 sm:p-6 flex flex-col justify-center relative z-10 ${isMobileDraft ? "min-h-0 overflow-hidden" : ""}`}>
        <AnimatePresence mode="wait">
          {/* 1. LANDING PAGE VIEW */}
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 relative"
            >
              {/* Startup Loading Overlay */}
              <AnimatePresence>
                {isStartingGame && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl border border-nexus-blue/20"
                  >
                    <div className="space-y-6 text-center p-8 bg-neutral-950/80 rounded-2xl border border-white/5 shadow-2xl">
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-nexus-cyan/20 animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="absolute inset-4 rounded-full border-2 border-nexus-cyan animate-ping" />
                        <RefreshCw className="w-10 h-10 text-nexus-cyan animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest nexus-glow-text">Syncing Multiverse</h3>
                        <p className="text-xs font-mono text-nexus-cyan/70 font-black uppercase tracking-[0.2em] animate-pulse">
                          Recruiting Tactical Assets...
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono max-w-[200px] mx-auto">Connecting to AniList database to fetch the latest character stats</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showLeaderboard ? (
                <div className="w-full max-w-3xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        🏆 Legendary Hall of Fame
                      </h2>
                      <p className="text-xs text-neutral-500 font-mono">RECORDS OF ALL DIMENSIONAL CROSSOVER COMBATS</p>
                    </div>
                    <button
                      onClick={() => setShowLeaderboard(false)}
                      className="text-xs font-mono font-bold text-violet-400 hover:text-white"
                    >
                      Back to Home
                    </button>
                  </div>

                  {matchHistory.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <ShieldAlert className="w-8 h-8 text-neutral-700 mx-auto" />
                      <p className="text-neutral-500 text-xs font-mono">NO RECORDS LOGGED YET. DEPLOY A MATCH FIRST!</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2">
                      {matchHistory.map((match, idx) => (
                        <div
                          key={match.id}
                          className="p-4 rounded-xl border border-neutral-900 bg-neutral-900/30 flex justify-between items-center hover:border-violet-500/10 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-violet-300 font-mono">#{matchHistory.length - idx}</span>
                              <span className="text-neutral-400">{match.createdAt}</span>
                            </div>
                            <p className="text-sm font-black uppercase text-white tracking-wide">
                              {match.player1Name}{" "}
                              <span className="text-violet-500 font-normal font-mono text-xs italic">vs</span>{" "}
                              {match.player2Name}
                            </p>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right font-mono">
                              <p className="text-[9px] text-neutral-500 uppercase tracking-widest">RESULT</p>
                              <p className="text-xs font-bold text-emerald-400">{match.winner} WON</p>
                              <p className="text-[10px] text-neutral-400">
                                {match.player1Power} - {match.player2Power} PWR
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Hero Head Banner */}
                  <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-neutral-900/50 border border-violet-500/20 px-3.5 py-1.5 rounded-full text-[10px] text-violet-300 tracking-[0.2em] uppercase font-mono font-black drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]">
                      EPIC REAL-TIME ANIME BATTLE SIMULATOR
                    </div>

                    <div className="space-y-3">
                      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-none font-sans">
                        BUILD THE ULTIMATE <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 filter drop-shadow-[0_0_30px_rgba(168,85,247,0.35)]">
                          ANIME TEAM
                        </span>
                      </h1>
                      <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto pr-1 leading-relaxed">
                        A tactical drafting dual simulator. Build a faction from your favorite anime series. Outsmart opponents using tactical skips, secure the high Power Overall fighters, and let the AI Commenters analyze the battle!
                      </p>
                    </div>
                  </div>

                  {/* GAME SETUP MATRIX */}
                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
                    {/* Setup Controls */}
                    <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/70 p-6 sm:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
                      <div className="space-y-5">
                        <div className="flex border-b border-white/5 pb-4 items-center gap-2.5">
                          <Flame className="w-5 h-5 text-violet-400" />
                          <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider">
                            STADIUM MATCH REGISTRATION
                          </h2>
                        </div>

                        {/* Mode selectors */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                            SELECT BATTLE DESIGN
                          </label>
                          <div className="grid grid-cols-3 gap-3.5">
                            <button
                              onClick={() => {
                                setGameMode("vs-ai");
                                setPlayer2Name("Smart AI");
                                setOnlineAction(null);
                              }}
                              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${gameMode === "vs-ai"
                                  ? "border-violet-500 bg-violet-950/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                  : "border-neutral-900 bg-neutral-900/20 text-neutral-400 hover:border-neutral-800"
                                }`}
                            >
                              <Computer className="w-5 h-5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide">P1 VS AI</p>
                                <p className="text-[9px] font-mono text-neutral-500 mt-0.5">Solo Bot</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setGameMode("local-2p");
                                setPlayer2Name("Hype Guest");
                                setOnlineAction(null);
                              }}
                              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${gameMode === "local-2p"
                                  ? "border-violet-500 bg-violet-950/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                  : "border-neutral-900 bg-neutral-900/20 text-neutral-400 hover:border-neutral-800"
                                }`}
                            >
                              <Users className="w-5 h-5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide">LOCAL 2P</p>
                                <p className="text-[9px] font-mono text-neutral-500 mt-0.5">Pass & Play</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setGameMode("online-2p");
                                setOnlineAction(null);
                              }}
                              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${gameMode === "online-2p"
                                  ? "border-violet-500 bg-violet-950/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                  : "border-neutral-900 bg-neutral-900/20 text-neutral-400 hover:border-neutral-800"
                                }`}
                            >
                              <Globe className="w-5 h-5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide">ONLINE 2P</p>
                                <p className="text-[9px] font-mono text-neutral-500 mt-0.5">Play Online</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {gameMode === "online-2p" && !onlineRoomId && (
                          <div className="space-y-4 p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 animate-fadeIn">
                            {!onlineAction ? (
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setOnlineAction("create")}
                                  className="py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                  <Plus className="w-4 h-4" /> Create Room
                                </button>
                                <button
                                  onClick={() => setOnlineAction("join")}
                                  className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                  <LogIn className="w-4 h-4" /> Join Room
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-mono text-violet-300 uppercase tracking-widest">
                                    {onlineAction === "create" ? "Configure your room" : "Enter room details"}
                                  </p>
                                  <button
                                    onClick={() => setOnlineAction(null)}
                                    className="text-[9px] font-mono text-neutral-500 hover:text-white uppercase transition-colors"
                                  >
                                    ← Back
                                  </button>
                                </div>

                                {onlineAction === "join" && (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={joinRoomId}
                                      onChange={(e) => setJoinRoomId(e.target.value)}
                                      placeholder="ROOM CODE"
                                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-3 text-[10px] text-white font-mono font-bold focus:border-violet-500 focus:outline-none uppercase"
                                    />
                                    <button
                                      onClick={joinOnlineRoom}
                                      className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-black uppercase"
                                    >
                                      Join
                                    </button>
                                  </div>
                                )}

                                {onlineAction === "create" && (
                                  <button
                                    onClick={createOnlineRoom}
                                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                                  >
                                    <Plus className="w-4 h-4" /> Initialize & Generate Room
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {onlineRoomId && isWaitingForOpponent && (
                          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
                            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Room Created! Share code with friend</p>
                            <div className="flex items-center justify-center gap-3">
                              <h3 className="text-3xl font-black text-white tracking-widest">{onlineRoomId}</h3>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(onlineRoomId).catch(() => {});
                                }}
                                className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 rounded-lg px-2 py-1 hover:bg-emerald-500/10 transition-all"
                                title="Copy room code"
                              >
                                Copy
                              </button>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-[9px] text-neutral-500 uppercase font-mono animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" /> Waiting for opponent...
                            </div>
                            <button 
                              onClick={() => {
                                if (socketRef.current && onlineRoomId) {
                                  socketRef.current.emit("cancel-room", { roomId: onlineRoomId });
                                }
                                resetOnlineLobby();
                                setGameMode("vs-ai");
                              }}
                              className="text-[9px] text-red-400 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Anime Filter */}
                        {(gameMode !== "online-2p" || onlineAction === "create" || (onlineRoomId && onlineSide === "p1")) && (
                          <div className="space-y-2 pt-1 animate-fadeIn">
                            <label className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                              CHARACTER POOL FILTER
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => {
                                  setCategory("all");
                                  setSelectedAnimes([]);
                                  setAnimeSearchQuery("");
                                  importStarterAllAnimeCasts();
                                }}
                                className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer ${category === "all"
                                    ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                                    : "border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700"
                                  }`}
                              >
                                🌐 All Anime
                              </button>
                              <button
                                onClick={() => setCategory("choose")}
                                className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer ${category === "choose"
                                    ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                                    : "border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700"
                                  }`}
                              >
                                🎯 Choose Anime
                              </button>
                            </div>

                            {category === "choose" && (
                              <div className="space-y-1.5 pt-1 relative">
                                <input
                                  id="inp-anime-search"
                                  type="text"
                                  value={animeSearchQuery}
                                  onFocus={() => setIsAnimeDropdownOpen(true)}
                                  onBlur={() => {
                                    setTimeout(() => setIsAnimeDropdownOpen(false), 200);
                                  }}
                                  onChange={(e) => {
                                    setAnimeSearchQuery(e.target.value);
                                  }}
                                  placeholder="Select or search anime… e.g. Naruto, Bleach"
                                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-2.5 px-3.5 text-xs text-white font-mono font-bold focus:border-purple-500 focus:outline-none cursor-pointer"
                                />
                                {isAnimeDropdownOpen && (
                                  <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl max-h-40 overflow-y-auto shadow-2xl">
                                    {animeList
                                      .filter((a) => !animeSearchQuery.trim() || a.toLowerCase().includes(animeSearchQuery.toLowerCase()))
                                      .map((anime) => (
                                        <button
                                          key={anime}
                                          onMouseDown={() => {
                                            if (!selectedAnimes.includes(anime)) {
                                              setSelectedAnimes((prev) => [...prev, anime]);
                                              importCastForAnime(anime)
                                                .catch((error) => {
                                                  console.warn("Auto import failed", error);
                                                });
                                            }
                                            setAnimeSearchQuery("");
                                            setIsAnimeDropdownOpen(false);
                                          }}
                                          className={`w-full text-left px-3.5 py-2 text-xs font-mono hover:bg-purple-500/15 transition-colors cursor-pointer ${selectedAnimes.includes(anime) ? "text-purple-400 bg-purple-500/10" : "text-slate-200"
                                            }`}
                                        >
                                          {anime}
                                        </button>
                                      ))}
                                    {animeList.filter((a) => !animeSearchQuery.trim() || a.toLowerCase().includes(animeSearchQuery.toLowerCase())).length === 0 && (
                                      <p className="px-3.5 py-2 text-[10px] text-neutral-500 font-mono">No anime found matching "{animeSearchQuery}"</p>
                                    )}
                                  </div>
                                )}
                                {selectedAnimes.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {selectedAnimes.map((anime) => (
                                      <span
                                        key={anime}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg"
                                      >
                                        🎯 {anime}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedAnimes((prev) => prev.filter((a) => a !== anime));
                                          }}
                                          className="hover:text-red-400 font-bold font-sans cursor-pointer transition-colors"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAnimes([]);
                                        setAnimeSearchQuery("");
                                      }}
                                      className="text-[9px] font-mono text-slate-400 hover:text-red-400 transition-colors cursor-pointer self-center ml-1"
                                    >
                                      ✕ clear all
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Player Names */}
                        {(gameMode !== "online-2p" || onlineAction !== null) && (
                          <div className="space-y-3 pt-2 animate-fadeIn">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                                PLAYER 1 SIGNATURE CALL
                              </label>
                              <input
                                id="inp-p1-name"
                                type="text"
                                value={player1Name}
                                onChange={(e) => setPlayer1Name(e.target.value)}
                                placeholder="Fighter 1 Name"
                                maxLength={16}
                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-2.5 px-3.5 text-xs text-white font-mono font-bold focus:border-violet-500 focus:outline-none"
                              />
                            </div>

                            {gameMode === "local-2p" && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
                                  PLAYER 2 SIGNATURE CALL
                                </label>
                                <input
                                  id="inp-p2-name"
                                  type="text"
                                  value={player2Name}
                                  onChange={(e) => setPlayer2Name(e.target.value)}
                                  placeholder="Fighter 2 Name"
                                  maxLength={16}
                                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-2.5 px-3.5 text-xs text-white font-mono font-bold focus:border-violet-500 focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {category === "choose" && selectedAnimes.length === 0 && (
                        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl font-mono text-[10px] font-bold leading-normal mt-4 shadow-sm animate-pulse">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Please select at least one anime before starting the game.</span>
                        </div>
                      )}

                      {category === "choose" && selectedAnimes.length > 0 && selectedAnimeCharacterCount < MIN_CHARACTERS_FOR_FULL_DRAFT && (
                        <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl font-mono text-[10px] font-bold leading-normal mt-4 shadow-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            Selected pool has {selectedAnimeCharacterCount}/{MIN_CHARACTERS_FOR_FULL_DRAFT} unique fighters. Add more anime or recruit more characters to avoid repeats.
                          </span>
                        </div>
                      )}

                      {(gameMode !== "online-2p" || (onlineRoomId && onlineSide === "p1")) && (
                        <button
                          id="btn-start-battle"
                          onClick={() => startNewGame(gameMode)}
                          disabled={!hasEnoughSelectedCharacters}
                          className={`w-full py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-black transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${!hasEnoughSelectedCharacters
                              ? "bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed opacity-50 shadow-none scale-100"
                              : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.45)] active:scale-95"
                            }`}
                        >
                          <Play className="w-4 h-4 fill-white" /> ENTER DRAFTING ARENA <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Spotlight Roster Card */}
                    <div className="rounded-3xl border border-neutral-800/85 bg-neutral-950/70 p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
                      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 filter blur-xl scale-75" style={{ background: hottestSpotlight.themeColor }} />

                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <p className="text-[10px] font-mono text-violet-400 tracking-widest uppercase font-black">
                            FEATURED SPOTLIGHT CARDS
                          </p>
                          <span className="text-[9px] font-mono bg-neutral-900 border border-white/5 px-2 py-0.5 rounded text-neutral-400 flex items-center gap-1">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "10s" }} /> Rotating roster
                          </span>
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden border shrink-0 shadow-lg" style={{ borderColor: `${hottestSpotlight.themeColor}44` }}>
                            <CharacterImage
                              url={hottestSpotlight.image}
                              name={hottestSpotlight.name}
                              fallbackUrl={hottestSpotlight.malFallbackUrl}
                              themeColor={hottestSpotlight.themeColor}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute bottom-1.5 left-2">
                              <p className="text-[10px] font-black truncate max-w-[80px] text-white">{hottestSpotlight.name}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[8px] font-mono font-bold border border-amber-500/30 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                              {hottestSpotlight.rarity}
                            </span>
                            <h3 className="text-xl font-extrabold text-white leading-tight">{hottestSpotlight.name}</h3>
                            <p className="text-[10px] text-neutral-400 font-mono uppercase">{hottestSpotlight.anime}</p>
                            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm line-clamp-2">
                              {hottestSpotlight.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 bg-neutral-900/30 border border-white/5 p-3 rounded-xl font-mono text-[10px]">
                          <div>
                            <span className="text-neutral-500">MAX POWER SCORE</span>
                            <p className="text-lg font-black text-white">{hottestSpotlight.overallPower}</p>
                          </div>
                          <div>
                            <span className="text-neutral-500">SIGNATURE MANIFESTO</span>
                            <p className="text-xs font-bold text-violet-400 mt-1">{hottestSpotlight.quote ? `"${hottestSpotlight.quote}"` : "Absolute Dominance"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4 mt-6 text-center">
                        <p className="text-[9px] font-mono uppercase text-neutral-500 tracking-widest">
                          DATABASE STATUS: {totalCharacters} HEROES SYNCED SUCCESSFULLY
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MyAnimeList Live Portal Recruiter */}
                  <div className="max-w-5xl mx-auto">
                      <MyAnimeListPortal
                        onPoolUpdated={fetchTotalCharactersCount}
                      />
                  </div>

                  {/* HOW TO PLAY */}
                  <div className="max-w-5xl mx-auto space-y-4">
                    <h3 className="text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase text-center font-bold">
                      COVENANT BATTLE RULES
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4.5">
                      <div className="p-4 rounded-2xl border border-neutral-900 bg-neutral-950/20 text-center space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-violet-400 mx-auto font-mono text-xs font-bold">
                          1
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase">DRAFT SELECTION</h4>
                        <p className="text-[10.5px] text-neutral-400 leading-relaxed font-sans">
                          Draft random characters one by one. Check overall stats before picking!
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border border-neutral-900 bg-neutral-950/20 text-center space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400 mx-auto font-mono text-xs font-bold">
                          2
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase">THE STRATEGIC CANCEL</h4>
                        <p className="text-[10.5px] text-neutral-400 leading-relaxed font-sans">
                          Only 1 SKIP is allowed. Skip low power candidates, but beware: your next option is mandatory!
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border border-neutral-900 bg-neutral-950/20 text-center space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mx-auto font-mono text-xs font-bold">
                          3
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase">TACTICAL SHOWDOWN</h4>
                        <p className="text-[10.5px] text-neutral-400 leading-relaxed font-sans">
                          After 6 picks, every role duels its opposite. Role fit, stats, rarity, and synergy decide the winner.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAbout(true)}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest text-slate-300 transition-all hover:border-nexus-cyan/40 hover:bg-nexus-cyan/10 hover:text-white"
                      >
                        About
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* 2. DRAFTING ROOM VIEW */}
          {view === "draft" && (
            <motion.div
              key="draft"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className={`${isMobileOnlineDraft ? "gap-1" : "space-y-2 sm:space-y-6"} flex flex-col h-full`}
            >
              {/* STAGE HEADER METRICS */}
              <div className={`flex ${isMobileOnlineDraft ? "flex-row" : "flex-col sm:flex-row"} justify-between items-center nexus-glass border-nexus-blue/20 ${isMobileOnlineDraft ? "rounded-xl p-1.5 gap-1" : "rounded-2xl p-2 sm:p-5 gap-2 sm:gap-4"} relative overflow-hidden flex-shrink-0`}>
                <div className="absolute inset-0 bg-nexus-blue/5 pointer-events-none" />
                <div className={`flex items-center ${isMobileOnlineDraft ? "gap-2 min-w-0" : "gap-4"} relative z-10`}>
                  <div className={`${isMobileOnlineDraft ? "px-2 py-1 text-[9px]" : "px-4 py-1.5 text-xs"} rounded-lg bg-nexus-blue text-white font-mono font-black shadow-[0_0_15px_rgba(30,144,255,0.4)] whitespace-nowrap`}>
                    ROUND {round} / 6
                  </div>
                  <div className="min-w-0">
                    <h3 className={`${isMobileOnlineDraft ? "text-[10px] tracking-wide truncate" : "text-base tracking-widest"} font-black uppercase text-white flex items-center gap-2`}>
                      {activeTurn === "p1" ? (
                        <><Swords className="w-4 h-4 text-nexus-cyan" /> {player1Name}'S DECISION</>
                      ) : gameMode === "vs-ai" ? (
                        <><Cpu className="w-4 h-4 text-nexus-purple animate-pulse" /> AI THINKING</>
                      ) : (
                        <><Swords className="w-4 h-4 text-fuchsia-400" /> {player2Name}'S DECISION</>
                      )}
                    </h3>
                    <p className={`${isMobileOnlineDraft ? "hidden" : ""} text-[10px] font-mono text-nexus-cyan/60 font-bold uppercase tracking-widest`}>
                      Battle frequency stable
                    </p>
                  </div>
                </div>

                {mustPick && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] px-4 py-1.5 font-mono font-black rounded-lg animate-pulse flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> MANDATORY LOCK-IN: NO SKIPS REMAINING
                  </div>
                )}

                <button
                  onClick={() => setView("landing")}
                  className={`${isMobileOnlineDraft ? "px-2 py-1 text-[8px] tracking-wide" : "px-4 py-2 text-[10px] tracking-widest"} font-mono font-black text-slate-500 hover:text-red-400 transition-colors uppercase rounded-lg border border-white/5 hover:border-red-400/20 whitespace-nowrap`}
                >
                  Terminate Mission
                </button>
              </div>

              {/* THREE COLUMN DRAFT COVENANT */}
              {isMobile ? (
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

              {/* Deploy Modal for scroll-free selection */}
              <AnimatePresence>
                {isDeployModalOpen && activeCharacter && (
                  <DeployModal
                    character={activeCharacter}
                    slots={activeTurn === "p1" ? p1Slots : p2Slots}
                    onSelect={(roleId) => {
                      handleSlotSelect(roleId);
                      setIsDeployModalOpen(false);
                    }}
                    onClose={() => setIsDeployModalOpen(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 3. SHOWDOWN RESULTS VIEW */}
          {view === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {loadingResult || !resultData ? (
                <div className="min-h-[500px] flex flex-col items-center justify-center space-y-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-violet-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-fuchsia-400 animate-ping" />
                    <Swords className="w-8 h-8 text-white" />
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="text-base font-black uppercase tracking-[0.2em] text-white">
                      EVALUATING TEAM COLLISION...
                    </h3>
                    <p className="text-xs text-violet-400 font-mono uppercase tracking-widest animate-pulse">
                      RESOLVING ROLE DUELS AND TEAM BONUSES
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Querying dimensional caster...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* WINNER BLOCK */}
                  <div className="text-center space-y-4 bg-gradient-to-b from-neutral-900/60 to-neutral-950/40 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-fuchsia-500 to-amber-500" />

                    <div className="space-y-2">
                      <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
                        FINAL SHOWDOWN RESULT
                      </p>
                      {resultData.winnerId === "draw" ? (
                        <h1 className="text-5xl font-black uppercase tracking-tight text-white">
                          Double-KO Draw!
                        </h1>
                      ) : (
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse">
                            {resultData.winner === player1Name ? player1Name : resultData.winner}
                          </span>{" "}
                          VICTORIOUS!
                        </h1>
                      )}
                    </div>

                    <div className="grid grid-cols-3 max-w-md mx-auto items-center py-4 bg-neutral-900/40 rounded-2xl border border-white/5 font-mono">
                      <div className="text-center">
                        <p className="text-[9px] text-neutral-400 leading-none truncate">{player1Name}</p>
                        <p className="text-3xl font-black text-white mt-1">{resultData.player1Power}</p>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-widest">Battle Score</p>
                      </div>
                      <div className="text-center text-sm font-black text-neutral-600 border-x border-white/5">
                        VS
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-neutral-400 leading-none truncate">{player2Name}</p>
                        <p className="text-3xl font-black text-white mt-1">{resultData.player2Power}</p>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-widest">Battle Score</p>
                      </div>
                    </div>

                    {resultData.battleReport && (
                      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-4 text-left">
                        <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-nexus-cyan">
                              Role Duel Results
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">
                              {resultData.battleReport.p1DuelWins}-{resultData.battleReport.p2DuelWins}
                              {resultData.battleReport.drawDuels > 0 ? `-${resultData.battleReport.drawDuels}` : ""}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {resultData.battleReport.duels.map((duel) => (
                              <div key={duel.role} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
                                <div className={`min-w-0 ${duel.winner === "p1" ? "text-emerald-300" : "text-slate-400"}`}>
                                  <p className="truncate text-[10px] font-bold">{duel.p1Name}</p>
                                  <p className="text-sm font-black">{duel.p1Score}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-500">{duel.label}</p>
                                  <p className="text-[9px] text-slate-600">VS</p>
                                </div>
                                <div className={`min-w-0 text-right ${duel.winner === "p2" ? "text-emerald-300" : "text-slate-400"}`}>
                                  <p className="truncate text-[10px] font-bold">{duel.p2Name}</p>
                                  <p className="text-sm font-black">{duel.p2Score}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/25 p-4 space-y-4">
                          <div>
                            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-amber-300">
                              Battle Rules
                            </h3>
                            <div className="mt-3 space-y-2">
                              {resultData.battleReport.rules.map((rule, index) => (
                                <p key={rule} className="text-[10px] text-slate-400 leading-relaxed">
                                  <span className="mr-2 font-mono font-black text-slate-600">{index + 1}</span>
                                  {rule}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                            {(["p1", "p2"] as const).map((side) => (
                              <div key={side} className="space-y-1.5">
                                <p className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-500">
                                  {side === "p1" ? player1Name : player2Name}
                                </p>
                                {Object.entries(resultData.battleReport!.bonuses[side]).map(([label, value]) => (
                                  <div key={label} className="flex items-center justify-between gap-2 text-[10px]">
                                    <span className="capitalize text-slate-500">{label.replace(/([A-Z])/g, " $1")}</span>
                                    <span className="font-mono font-black text-white">+{value}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-3 mt-4">
                      {gameMode === "online-2p" && onlineSide !== "p1" ? (
                        <button
                          id="btn-restart"
                          disabled
                          className="py-3 px-6 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-500 text-xs font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed opacity-50 font-bold"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin text-neutral-600" /> Waiting for Host
                        </button>
                      ) : (
                        <button
                          id="btn-restart"
                          onClick={() => startNewGame(gameMode)}
                          className="py-3 px-6 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-white font-bold"
                        >
                          <RefreshCw className="w-4 h-4 text-violet-400" /> Revenge Match
                        </button>
                      )}
                      <button
                        id="btn-return-landing"
                        onClick={() => {
                          if (gameMode === "online-2p") {
                            if (socketRef.current && onlineRoomId) {
                              socketRef.current.emit("cancel-room", { roomId: onlineRoomId });
                            }
                            resetOnlineLobby();
                          } else {
                            setView("landing");
                          }
                        }}
                        className="py-3 px-6 rounded-xl text-neutral-100 bg-violet-600 hover:bg-violet-500 text-xs font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] font-bold"
                      >
                        <RotateCcw className="w-4 h-4" /> Return to Lobby
                      </button>
                    </div>
                  </div>

                  {/* TEAM COMPARISON */}
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/60">
                      <h4 className="text-xs font-black font-mono uppercase tracking-widest text-violet-400 mb-3">
                        📋 {player1Name}'s Draft Team
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {p1Team.map((c) => (
                          <div
                            key={c.id}
                            className="aspect-[3/4] border rounded-lg overflow-hidden relative group"
                            style={{ borderColor: `${c.themeColor}33` }}
                          >
                            <CharacterImage
                              url={c.image}
                              name={c.name}
                              themeColor={c.themeColor}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                            <div className="absolute bottom-1 left-1.5 text-left max-w-[50px] truncate leading-none">
                              <span className="text-[8px] font-black font-sans text-white truncate drop-shadow-md">
                                {c.name.split(" ")[0]}
                              </span>
                            </div>
                            <div className="absolute top-1 right-1 bg-neutral-950/70 rounded px-1 text-[8px] font-mono text-white">
                              {c.overallPower}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/60">
                      <h4 className="text-xs font-black font-mono uppercase tracking-widest text-violet-400 mb-3">
                        📋 {player2Name}'s Draft Team
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {p2Team.map((c) => (
                          <div
                            key={c.id}
                            className="aspect-[3/4] border rounded-lg overflow-hidden relative group"
                            style={{ borderColor: `${c.themeColor}33` }}
                          >
                            <CharacterImage
                              url={c.image}
                              name={c.name}
                              themeColor={c.themeColor}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                            <div className="absolute bottom-1 left-1.5 text-left max-w-[50px] truncate leading-none">
                              <span className="text-[8px] font-black font-sans text-white truncate drop-shadow-md">
                                {c.name.split(" ")[0]}
                              </span>
                            </div>
                            <div className="absolute top-1 right-1 bg-neutral-950/70 rounded px-1 text-[8px] font-mono text-white">
                              {c.overallPower}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MATCH HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-black text-white uppercase flex items-center gap-1.5">
                    Match History
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-400">
                    HISTORIC DRAFT HISTORIES AND CAS COMMENTS
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 rounded-lg border border-neutral-800 hover:border-white text-neutral-400 hover:text-white transition-all text-xs cursor-pointer font-mono font-bold px-2 py-1"
                >
                  Close
                </button>
              </div>

              {matchHistory.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-neutral-500 font-mono text-xs">NO CHRONICLES RECORDED IN THE LOGS.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-neutral-800 bg-neutral-900/25 rounded-xl hover:border-violet-500/25 transition-all text-left space-y-3"
                    >
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400 border-b border-white/5 pb-1.5">
                        <span>TIMESTAMPS: {item.createdAt}</span>
                        <span className="text-amber-400">Winner: {item.winner}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-neutral-400 font-mono leading-none">PLAYER 1 TEAM</p>
                          <p className="text-sm font-black text-white">{item.player1Name}</p>
                          <p className="text-xs font-mono text-violet-400">∑ {item.player1Power} Power</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400 font-mono leading-none">PLAYER 2 TEAM</p>
                          <p className="text-sm font-black text-white">{item.player2Name}</p>
                          <p className="text-xs font-mono text-violet-400">∑ {item.player2Power} Power</p>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-900/50 rounded-lg text-[11px] text-neutral-300 font-sans border border-white/5 max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                        {item.commentary}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABOUT MODAL */}
      <AnimatePresence>
        {showAbout && view === "landing" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-nexus-cyan/30 bg-slate-950 shadow-[0_0_40px_rgba(0,229,255,0.18)]"
              initial={{ y: 24, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="absolute right-3 top-3 z-10 rounded-lg border border-white/10 bg-black/50 p-2 text-white/70 transition-colors hover:text-white"
                aria-label="Close about"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-[3/4] w-full overflow-hidden bg-slate-900">
                <CharacterImage
                  url={aboutCharacter.image}
                  name={aboutCharacter.name}
                  fallbackUrl={aboutCharacter.malFallbackUrl}
                  themeColor={aboutCharacter.themeColor}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="p-5 text-center">
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-nexus-cyan/70">
                  Anime Battle
                </p>
                <h2 className="mt-2 text-xl font-black uppercase tracking-wide text-white">
                  ANUSHARAN BHATTARAI
                </h2>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      {!(isMobile && view === "draft") && (
        <footer className="border-t border-neutral-900 bg-neutral-950/60 backdrop-blur-md py-4 px-6 text-center text-[10px] font-mono text-neutral-500 relative z-10 flex flex-col sm:flex-row justify-between items-center max-w-7xl w-full mx-auto gap-2">
          <span>(c) 2026 ANIME BATTLE. ALL RIGHTS RESERVED.</span>
          <span className="text-violet-400">MADE FOR ANIME ENTHUSIASTS WORLDWIDE</span>
        </footer>
      )}
    </div>
  );
}
