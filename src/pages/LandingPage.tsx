// Landing page component
import { useState } from 'react';
import { ViewState, GameHubMode } from '../navigation/types';

interface LandingPageProps {
  onNavigate: (view: ViewState, mode: GameHubMode) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [selectedGameHubMode, setSelectedGameHubMode] = useState<GameHubMode>("hub");

  const handleModeSelect = (mode: GameHubMode) => {
    setSelectedGameHubMode(mode);
    onNavigate("landing", mode);
  };

  const handleStartGame = () => {
    if (selectedGameHubMode === "battle") {
      onNavigate("draft", "battle");
    } else {
      // Game hub mode - show game selection
      onNavigate("landing", "hub");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
            🎮 Anime Battle Arena 🎮
          </h1>
          <p className="text-xl text-purple-200">
            Choose your game mode and start playing!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => handleModeSelect("battle")}
            className={`p-8 rounded-xl transition-all transform hover:scale-105 ${
              selectedGameHubMode === "battle"
                ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-2xl"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <div className="text-4xl mb-4">⚔️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Battle Mode</h2>
            <p className="text-gray-200">
              Draft teams and compete in character battles
            </p>
          </button>

          <button
            onClick={() => handleModeSelect("hub")}
            className={`p-8 rounded-xl transition-all transform hover:scale-105 ${
              selectedGameHubMode === "hub"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">Game Hub</h2>
            <p className="text-gray-200">
              Play various anime-themed party games
            </p>
          </button>
        </div>

        {selectedGameHubMode === "hub" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => onNavigate("feud", "hub")}
              className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🎭</div>
              <h3 className="text-xl font-bold text-white">Anime Feud</h3>
            </button>

            <button
              onClick={() => onNavigate("guesswho", "hub")}
              className="p-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-xl font-bold text-white">Guess Who</h3>
            </button>

            <button
              onClick={() => onNavigate("party", "hub")}
              className="p-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-white">Party Mode</h3>
            </button>
          </div>
        )}

        {selectedGameHubMode === "battle" && (
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="px-12 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Start Battle Draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
};