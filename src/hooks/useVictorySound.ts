import { useRef, useCallback } from 'react';

const VICTORY_SOUND_URL = 'https://res.cloudinary.com/dha1iskae/video/upload/v1749227310/you-found-bojuka_2_tsftum.mp3';

export interface UseVictorySoundResult {
  playVictorySound: () => Promise<void>;
  isLoading: boolean;
}

export const useVictorySound = (): UseVictorySoundResult => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const playVictorySound = useCallback(async (): Promise<void> => {
    try {
      // Check if sound effects are enabled (from localStorage)
      const musicEnabled = localStorage.getItem('vietnam-puzzle-background-music-enabled');
      if (musicEnabled === 'false') {
        console.log('Victory sound skipped - background music disabled by user');
        return;
      }

      // Get background music volume setting
      const musicVolume = localStorage.getItem('vietnam-puzzle-background-music-volume');
      const volume = musicVolume ? parseFloat(musicVolume) : 0.3;

      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio(VICTORY_SOUND_URL);
        audioRef.current.preload = 'auto';
      }

      const audio = audioRef.current;
      
      // Set volume to match user's music volume preference (slightly lower for victory sound)
      audio.volume = Math.min(volume * 0.8, 0.6); // Max 60%, but scale with music volume
      
      // Reset to beginning if already played
      audio.currentTime = 0;
      
      // Set loading state
      isLoadingRef.current = true;
      
      // Play the sound
      await audio.play();
      
      console.log('Victory sound played successfully at volume:', audio.volume);
    } catch (error) {
      console.log('Victory sound could not play (browser policy or network):', error);
      // Don't throw error - victory sound is optional
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  return {
    playVictorySound,
    isLoading: isLoadingRef.current
  };
};

export default useVictorySound;
