import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Clock,
  HelpCircle,
} from "lucide-react";

interface QuestionEntry {
  question: string;
  answer: "yes" | "no" | null;
  askedBy: "p1" | "p2";
}

interface GWQuestionPanelProps {
  questions: QuestionEntry[];
  onAskQuestion: (question: string) => void;
  onAnswer: (answer: "yes" | "no") => void;
  isMyTurn: boolean;
  waitingForAnswer: boolean;
  pendingQuestion: string | null;
  myName: string;
  opponentName: string;
  mySide: "p1" | "p2";
}

export default function GWQuestionPanel({
  questions,
  onAskQuestion,
  onAnswer,
  isMyTurn,
  waitingForAnswer,
  pendingQuestion,
  myName,
  opponentName,
  mySide,
}: GWQuestionPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questions, pendingQuestion, waitingForAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !isMyTurn || waitingForAnswer) return;
    onAskQuestion(trimmed);
    setInput("");
  };

  const isMyQuestion = (q: QuestionEntry) => q.askedBy === mySide;

  return (
    <div className="flex flex-col h-full nexus-glass rounded-xl border border-violet-500/15 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 bg-slate-950/40">
        <MessageCircle className="w-4 h-4 text-violet-400" />
        <span className="text-xs font-semibold text-slate-300 tracking-wide">
          Question Log
        </span>
        <span className="ml-auto text-[10px] text-slate-500">
          {questions.length} asked
        </span>
      </div>

      {/* Chat History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[200px] max-h-[400px] scrollbar-thin"
      >
        {questions.length === 0 && !pendingQuestion && !waitingForAnswer && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2 py-8">
            <HelpCircle className="w-8 h-8" />
            <p className="text-xs text-center">
              No questions yet.
              {isMyTurn
                ? " Ask a yes/no question!"
                : ` Waiting for ${opponentName}...`}
            </p>
          </div>
        )}

        {questions.map((q, i) => {
          const mine = isMyQuestion(q);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  mine
                    ? "bg-violet-600/25 border border-violet-500/30 rounded-br-sm"
                    : "bg-slate-800/60 border border-white/10 rounded-bl-sm"
                }`}
              >
                <p className="text-[10px] text-slate-500 mb-0.5">
                  {mine ? myName : opponentName}
                </p>
                <p className="text-sm text-slate-200">{q.question}</p>
                {q.answer && (
                  <div className="mt-1.5 flex justify-end">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.answer === "yes"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {q.answer === "yes" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {q.answer.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Waiting for answer indicator */}
        {waitingForAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/10 border border-violet-500/20 text-slate-400 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              Waiting for {opponentName}'s answer...
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className="border-t border-white/10 bg-slate-950/60">
        <AnimatePresence mode="wait">
          {/* I need to answer a pending question */}
          {pendingQuestion ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 space-y-3"
            >
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30">
                <HelpCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-fuchsia-400 font-semibold">
                    {opponentName} asks:
                  </p>
                  <p className="text-sm text-slate-200 mt-0.5">
                    {pendingQuestion}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAnswer("yes")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-400 font-bold text-sm transition duration-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  YES
                </button>
                <button
                  onClick={() => onAnswer("no")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-400 font-bold text-sm transition duration-200"
                >
                  <XCircle className="w-4 h-4" />
                  NO
                </button>
              </div>
            </motion.div>
          ) : isMyTurn && !waitingForAnswer ? (
            /* My turn to ask */
            <motion.form
              key="ask"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="p-3 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a yes/no question..."
                maxLength={200}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 transition placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Ask
              </button>
            </motion.form>
          ) : (
            /* Not my turn */
            <motion.div
              key="waiting-turn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 flex items-center justify-center gap-2 text-slate-500 text-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              {waitingForAnswer
                ? `Waiting for ${opponentName}'s answer...`
                : `Waiting for ${opponentName}'s question...`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
