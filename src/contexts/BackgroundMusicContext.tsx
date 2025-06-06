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

  // Track if user has manually paused to prevent auto-play
  const [userPaused, setUserPaused] = useState(false);

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
    if (isEnabled && !backgroundMusic.isPlaying && !backgroundMusic.isLoading && !userPaused) {
      // Only auto-play if user hasn't manually paused
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
  }, [isEnabled, backgroundMusic.isPlaying, backgroundMusic.isLoading, backgroundMusic.play, userPaused]);
  const enable = () => {
    setIsEnabled(true);
    setUserPaused(false); // Reset pause state when enabling
  };

  const disable = () => {
    setIsEnabled(false);
    setUserPaused(false); // Reset pause state when disabling
    if (backgroundMusic.isPlaying) {
      backgroundMusic.pause();
    }
  };

  // Custom play function that resets user pause state
  const customPlay = async () => {
    setUserPaused(false);
    await backgroundMusic.play();
  };

  // Custom pause function that sets user pause state
  const customPause = () => {
    setUserPaused(true);
    backgroundMusic.pause();
  };

  // Custom toggle function
  const customToggle = async () => {
    if (backgroundMusic.isPlaying) {
      customPause();
    } else {
      await customPlay();
    }
  };
  const contextValue: BackgroundMusicContextType = {
    isPlaying: backgroundMusic.isPlaying,
    isLoading: backgroundMusic.isLoading,
    error: backgroundMusic.error,
    volume: backgroundMusic.volume,
    isMuted: backgroundMusic.isMuted,
    isEnabled,
    play: customPlay,
    pause: customPause,
    toggle: customToggle,
    setVolume: backgroundMusic.setVolume,
    mute: backgroundMusic.mute,
    unmute: backgroundMusic.unmute,
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
