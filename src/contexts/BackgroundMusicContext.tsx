import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';

// Background music URL provided by the user
const BACKGROUND_MUSIC_URL = 'https://res.cloudinary.com/dha1iskae/video/upload/v1749229100/funny-kids_59sec-190857_ujgpea.mp3';

interface BackgroundMusicContextType {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  isMuted: boolean;
  isEnabled: boolean;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  enable: () => void;
  disable: () => void;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextType | undefined>(undefined);

interface BackgroundMusicProviderProps {
  children: React.ReactNode;
}

export const BackgroundMusicProvider: React.FC<BackgroundMusicProviderProps> = ({ children }) => {
  // Load user preference from localStorage
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('vietnam-puzzle-background-music-enabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled
  });

  const [savedVolume, setSavedVolume] = useState(() => {
    const saved = localStorage.getItem('vietnam-puzzle-background-music-volume');
    return saved !== null ? parseFloat(saved) : 0.3; // Default to 30% volume
  });

  const backgroundMusic = useBackgroundMusic(BACKGROUND_MUSIC_URL, {
    autoPlay: false, // Don't auto-play due to browser policies
    loop: true,
    volume: savedVolume,
    fadeInDuration: 2000, // 2 second fade in
    fadeOutDuration: 1000, // 1 second fade out
  });

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('vietnam-puzzle-background-music-enabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem('vietnam-puzzle-background-music-volume', savedVolume.toString());
  }, [savedVolume]);

  // Update saved volume when volume changes
  useEffect(() => {
    setSavedVolume(backgroundMusic.volume);
  }, [backgroundMusic.volume]);

  // Auto-start music when enabled (with user gesture requirement)
  useEffect(() => {
    if (isEnabled && !backgroundMusic.isPlaying && !backgroundMusic.isLoading) {
      // We can't auto-play due to browser policies, but we can try
      // This will only work if the user has already interacted with the page
      const tryAutoPlay = async () => {
        try {
          await backgroundMusic.play();
        } catch (error) {
          // Silently fail - browser doesn't allow auto-play
          console.log('Auto-play prevented by browser policy');
        }
      };
      
      // Add a small delay to ensure audio is loaded
      const timeoutId = setTimeout(tryAutoPlay, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isEnabled, backgroundMusic.isPlaying, backgroundMusic.isLoading, backgroundMusic.play]);

  const enable = () => {
    setIsEnabled(true);
  };

  const disable = () => {
    setIsEnabled(false);
    if (backgroundMusic.isPlaying) {
      backgroundMusic.pause();
    }
  };

  const contextValue: BackgroundMusicContextType = {
    ...backgroundMusic,
    isEnabled,
    enable,
    disable,
  };

  return (
    <BackgroundMusicContext.Provider value={contextValue}>
      {children}
    </BackgroundMusicContext.Provider>
  );
};

export const useBackgroundMusicContext = (): BackgroundMusicContextType => {
  const context = useContext(BackgroundMusicContext);
  if (context === undefined) {
    throw new Error('useBackgroundMusicContext must be used within a BackgroundMusicProvider');
  }
  return context;
};

export default BackgroundMusicContext;
