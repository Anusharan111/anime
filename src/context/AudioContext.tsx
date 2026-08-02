// Context for managing audio settings across the application
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { playSound, stopMusic, toggleMute as audioToggleMute } from '../utils/audio';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playClickSound: () => void;
  playSuccessSound: () => void;
  playErrorSound: () => void;
  stopBackgroundMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('audioMuted');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('audioMuted', String(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newValue = !prev;
      audioToggleMute(newValue);
      return newValue;
    });
  };

  const playClickSound = () => {
    if (!isMuted) playSound('click');
  };

  const playSuccessSound = () => {
    if (!isMuted) playSound('success');
  };

  const playErrorSound = () => {
    if (!isMuted) playSound('error');
  };

  const stopBackgroundMusic = () => {
    stopMusic();
  };

  return (
    <AudioContext.Provider value={{
      isMuted,
      toggleMute,
      playClickSound,
      playSuccessSound,
      playErrorSound,
      stopBackgroundMusic
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};