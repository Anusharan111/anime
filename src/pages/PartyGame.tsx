// Party Game page component - placeholder with basic UI
import { ViewState } from '../navigation/types';
import StandardLayout from '../components/StandardLayout';

interface PartyGameProps {
  onNavigate: (view: ViewState) => void;
}

export const PartyGame = ({ onNavigate }: PartyGameProps) => {
  return (
    <StandardLayout title="Party Games" onExit={() => onNavigate('landing')}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">🎉 Party Game 🎉</h1>
          <p className="text-xl text-purple-200">Anime-themed party fun!</p>
        </div>

        <div className="nexus-card p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-3xl font-bold text-white mb-4">Take turns guessing!</h2>
            <div className="flex justify-center gap-4 mt-4">
              <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                Start Round
              </button>
              <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                Rules
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xl font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </StandardLayout>
  );
};

export default PartyGame;