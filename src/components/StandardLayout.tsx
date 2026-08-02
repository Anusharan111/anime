import React from "react";
import { ArrowLeft } from "lucide-react";

interface StandardLayoutProps {
  children: React.ReactNode;
  title?: string;
  onExit?: () => void;
}

const StandardLayout: React.FC<StandardLayoutProps> = ({ children, title, onExit }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {onExit && (
        <header className="max-w-7xl mx-auto p-6 flex justify-between items-center">
          <div className="flex-1">
            {title && <h1 className="text-3xl font-bold text-white">{title}</h1>}
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-nexus-purple/20 text-white rounded-lg hover:bg-nexus-purple/30 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </button>
        </header>
      )}

      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>

      <footer className="mt-12 text-center text-slate-400 text-sm pb-6">
        &copy; 2026 Anime Battle. All rights reserved.
      </footer>
    </div>
  );
};

export default StandardLayout;