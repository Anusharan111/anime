import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";
import { Character } from "../types";
import { SOCKET_URL } from "../config";
import { sfx } from "../utils/audio";

import GWLobby from "../components/guesswho/GWLobby";
import GWCharacterGrid from "../components/guesswho/GWCharacterGrid";
import GWQuestionPanel from "../components/guesswho/GWQuestionPanel";
import GWSecretCard from "../components/guesswho/GWSecretCard";
import GWGuessModal from "../components/guesswho/GWGuessModal";
import GWGameOver from "../components/guesswho/GWGameOver";
import { Search, Target, LogOut, MessageCircleQuestion } from "lucide-react";

interface QuestionEntry {
  question: string;
  answer: "yes" | "no" | null;
  askedBy: "p1" | "p2";
}

interface AnimeGuessWhoGameProps {
  onExit: () => void;
}

export default function AnimeGuessWhoGame({ onExit }: AnimeGuessWhoGameProps) {
  // Phase: lobby → playing → gameover
  const [phase, setPhase] = useState<"lobby" | "playing" | "gameover">("lobby");

  // Lobby state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [mySide, setMySide] = useState<"p1" | "p2" | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const [myName, setMyName] = useState("Player");
  const [opponentName, setOpponentName] = useState("Opponent");

  // Game state
  const [grid, setGrid] = useState<Character[]>([]);
  const [mySecret, setMySecret] = useState<Character | null>(null);
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
  const [currentTurn, setCurrentTurn] = useState<"p1" | "p2">("p1");
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [showGuessModal, setShowGuessModal] = useState(false);

  // Game over state
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    mySecret: Character;
    opponentSecret: Character;
  } | null>(null);

  // Socket ref
  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const mySideRef = useRef<"p1" | "p2" | null>(null);

  // Keep refs in sync
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { mySideRef.current = mySide; }, [mySide]);

  // Lazy socket initialization
  const ensureSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
    });

    // --- Lobby events ---
    socket.on("gw-room-created", ({ roomId: rid, side }) => {
      setRoomId(rid);
      roomIdRef.current = rid;
      setMySide(side);
      mySideRef.current = side;
      setIsWaiting(true);
    });

    socket.on("gw-game-started", ({ roomId: rid, side, p1Name, p2Name, grid: g, mySecret: secret, currentTurn: turn }) => {
      setRoomId(rid);
      roomIdRef.current = rid;
      setMySide(side);
      mySideRef.current = side;
      setMyName(side === "p1" ? p1Name : p2Name);
      setOpponentName(side === "p1" ? p2Name : p1Name);
      setGrid(g);
      setMySecret(secret);
      setCurrentTurn(turn);
      setIsWaiting(false);
      setPhase("playing");
      sfx.playCorrect();
    });

    // --- Gameplay events ---
    socket.on("gw-question-asked", ({ question, fromSide }) => {
      // I received a question from opponent — I need to answer it
      setPendingQuestion(question);
      setQuestions((prev) => [...prev, { question, answer: null, askedBy: fromSide }]);
    });

    socket.on("gw-question-answered", ({ answer, fromSide }) => {
      // Opponent answered my question
      setWaitingForAnswer(false);
      if (answer === "yes") {
        sfx.playCorrect();
      } else {
        sfx.playWrong();
      }
      setQuestions((prev) => {
        const updated = [...prev];
        // Find the last unanswered question
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].answer === null) {
            updated[i] = { ...updated[i], answer };
            break;
          }
        }
        return updated;
      });
      // Turn switches after answer — server already switched, but we track locally
      setCurrentTurn((prev) => prev === "p1" ? "p2" : "p1");
    });

    socket.on("gw-guess-result", ({ correct, guesserSide, actualSecret, p1Secret, p2Secret }) => {
      const iAmGuesser = guesserSide === mySideRef.current;
      const won = iAmGuesser ? correct : !correct;

      if (won) {
        sfx.playVictory();
      } else {
        sfx.playWrong();
      }

      const mySecretChar = mySideRef.current === "p1" ? p1Secret : p2Secret;
      const opponentSecretChar = mySideRef.current === "p1" ? p2Secret : p1Secret;

      setGameResult({
        won,
        mySecret: mySecretChar,
        opponentSecret: opponentSecretChar,
      });
      setPhase("gameover");
    });

    // --- Error/disconnect events ---
    socket.on("error", (msg: string) => {
      setLobbyError(msg);
      setTimeout(() => setLobbyError(null), 4000);
    });

    socket.on("gw-player-disconnected", () => {
      alert("Opponent disconnected!");
      handleExit();
    });

    socket.on("gw-room-cancelled", () => {
      alert("Room was cancelled.");
      handleExit();
    });

    socketRef.current = socket;
    return socket;
  }, []);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        if (roomIdRef.current) {
          socketRef.current.emit("gw-cancel-room", { roomId: roomIdRef.current });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // --- Lobby actions ---
  const handleCreateRoom = (playerName: string) => {
    setMyName(playerName);
    const socket = ensureSocket();
    socket.emit("gw-create-room", playerName.trim() || "Player 1");
  };

  const handleJoinRoom = (rid: string, playerName: string) => {
    setMyName(playerName);
    const socket = ensureSocket();
    socket.emit("gw-join-room", {
      roomId: rid.toUpperCase(),
      playerName: playerName.trim() || "Player 2",
    });
  };

  // --- Gameplay actions ---
  const handleAskQuestion = (question: string) => {
    if (!socketRef.current || !roomIdRef.current) return;
    socketRef.current.emit("gw-ask-question", { roomId: roomIdRef.current, question });
    setQuestions((prev) => [...prev, { question, answer: null, askedBy: mySide! }]);
    setWaitingForAnswer(true);
  };

  const handleAnswer = (answer: "yes" | "no") => {
    if (!socketRef.current || !roomIdRef.current) return;
    socketRef.current.emit("gw-answer-question", { roomId: roomIdRef.current, answer });
    setPendingQuestion(null);
    // Update the last unanswered question with the answer
    setQuestions((prev) => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].answer === null) {
          updated[i] = { ...updated[i], answer };
          break;
        }
      }
      return updated;
    });
    // Turn switches after answer
    setCurrentTurn((prev) => prev === "p1" ? "p2" : "p1");
  };

  const handleEliminate = (id: string) => {
    sfx.playSkip();
    setEliminatedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleRestore = (id: string) => {
    sfx.playSelect();
    setEliminatedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleGuess = (characterId: string) => {
    if (!socketRef.current || !roomIdRef.current) return;
    sfx.playShowdown();
    socketRef.current.emit("gw-guess", { roomId: roomIdRef.current, characterId });
    setShowGuessModal(false);
  };

  const handlePlayAgain = () => {
    // Reset all game state and go back to lobby
    setPhase("lobby");
    setGrid([]);
    setMySecret(null);
    setEliminatedIds(new Set());
    setCurrentTurn("p1");
    setQuestions([]);
    setWaitingForAnswer(false);
    setPendingQuestion(null);
    setShowGuessModal(false);
    setGameResult(null);
    setRoomId(null);
    setMySide(null);
    setIsWaiting(false);
  };

  const handleExit = () => {
    if (socketRef.current) {
      if (roomIdRef.current) {
        socketRef.current.emit("gw-cancel-room", { roomId: roomIdRef.current });
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    onExit();
  };

  const isMyTurn = currentTurn === mySide;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-6 px-3 bg-[#050816] text-white">
      <AnimatePresence mode="wait">
        {/* LOBBY PHASE */}
        {phase === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-lg"
          >
            <GWLobby
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onBack={handleExit}
              isWaiting={isWaiting}
              roomId={roomId}
              error={lobbyError}
            />
          </motion.div>
        )}

        {/* PLAYING PHASE */}
        {phase === "playing" && mySecret && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl space-y-4"
          >
            {/* Top bar */}
            <div className="flex justify-between items-center bg-slate-950/50 px-4 py-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs text-slate-400">
                  <strong className="text-white">{myName}</strong>
                  <span className="text-slate-500 mx-1.5">vs</span>
                  <strong className="text-white">{opponentName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isMyTurn
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 animate-pulse"
                    : "bg-slate-900 border-white/5 text-slate-500"
                }`}>
                  {isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
                </span>
                <button
                  onClick={handleExit}
                  className="text-xs text-slate-500 hover:text-white transition flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Quit
                </button>
              </div>
            </div>

            {/* Main layout: grid + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Character Grid */}
              <div className="lg:col-span-8">
                <GWCharacterGrid
                  characters={grid}
                  eliminatedIds={eliminatedIds}
                  onEliminate={handleEliminate}
                  onRestore={handleRestore}
                  disabled={false}
                />
              </div>

              {/* Right: Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Secret Card */}
                <GWSecretCard character={mySecret} />

                {/* Guess Button */}
                {isMyTurn && !waitingForAnswer && !pendingQuestion && (
                  <button
                    onClick={() => setShowGuessModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/30 transition duration-300 transform hover:scale-[1.02] border border-red-500/30"
                  >
                    <Target className="w-4 h-4" />
                    MAKE A GUESS
                  </button>
                )}

                {/* Question Panel */}
                <GWQuestionPanel
                  questions={questions}
                  onAskQuestion={handleAskQuestion}
                  onAnswer={handleAnswer}
                  isMyTurn={isMyTurn}
                  waitingForAnswer={waitingForAnswer}
                  pendingQuestion={pendingQuestion}
                  myName={myName}
                  opponentName={opponentName}
                  mySide={mySide || "p1"}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* GAME OVER PHASE */}
        {phase === "gameover" && gameResult && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl"
          >
            <GWGameOver
              won={gameResult.won}
              mySecret={gameResult.mySecret}
              opponentSecret={gameResult.opponentSecret}
              myName={myName}
              opponentName={opponentName}
              questionsAsked={questions.length}
              onPlayAgain={handlePlayAgain}
              onExit={handleExit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guess Modal Overlay */}
      <AnimatePresence>
        {showGuessModal && (
          <GWGuessModal
            characters={grid}
            eliminatedIds={eliminatedIds}
            onGuess={handleGuess}
            onCancel={() => setShowGuessModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
