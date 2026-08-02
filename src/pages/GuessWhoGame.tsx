// Guess Who game page component
import { ViewState } from '../navigation/types';
import StandardLayout from '../components/StandardLayout';

interface GuessWhoGameProps {
  onNavigate: (view: ViewState) => void;
}

export const GuessWhoGame = ({ onNavigate }: GuessWhoGameProps) => {
  return (
    <StandardLayout title="Guess Who?" onExit={() => onNavigate('landing')}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">🕵️ Guess Who? 🕵️</h1>
          <p className="text-xl text-purple-200">Figure out which anime character!</p>
        </div>

        <div className="nexus-card p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-3xl font-bold text-white mb-4">"I'm the Hokage now!"</h2>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors">
                Naruto
              </button>
              <button className="px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors">
                Sasuke
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </StandardLayout>
  );
};

export default GuessWhoGame;