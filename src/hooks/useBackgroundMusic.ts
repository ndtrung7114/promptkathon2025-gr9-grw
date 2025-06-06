import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseBackgroundMusicResult {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  isMuted: boolean;
}

export const useBackgroundMusic = (
  audioUrl: string,
  options: {
    autoPlay?: boolean;
    loop?: boolean;
    volume?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
  } = {}
): UseBackgroundMusicResult => {
  const {
    autoPlay = false,
    loop = true,
    volume: initialVolume = 0.3,
    fadeInDuration = 1000,
    fadeOutDuration = 1000,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalVolumeRef = useRef(initialVolume);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';
    
    setIsLoading(true);
    setError(null);

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      if (autoPlay) {
        play();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (!loop) {
        setIsPlaying(false);
      }
    };

    const handleError = (e: Event) => {
      console.error('Background music error:', e);
      setError('Failed to load background music');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    // Cleanup function
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, autoPlay, loop]);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume;
      originalVolumeRef.current = volume;
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const fadeIn = useCallback((targetVolume: number, duration: number) => {
    if (!audioRef.current || fadeIntervalRef.current) return;

    const audio = audioRef.current;
    const startVolume = 0;
    const volumeStep = (targetVolume - startVolume) / (duration / 50);
    let currentVolume = startVolume;

    audio.volume = startVolume;

    fadeIntervalRef.current = setInterval(() => {
      currentVolume += volumeStep;
      
      if (currentVolume >= targetVolume) {
        audio.volume = targetVolume;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      } else {
        audio.volume = currentVolume;
      }
    }, 50);
  }, []);

  const fadeOut = useCallback((duration: number, callback?: () => void) => {
    if (!audioRef.current || fadeIntervalRef.current) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const volumeStep = startVolume / (duration / 50);
    let currentVolume = startVolume;

    fadeIntervalRef.current = setInterval(() => {
      currentVolume -= volumeStep;
      
      if (currentVolume <= 0) {
        audio.volume = 0;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        callback?.();
      } else {
        audio.volume = currentVolume;
      }
    }, 50);
  }, []);

  const play = useCallback(async (): Promise<void> => {
    if (!audioRef.current) return;
    
    try {
      setError(null);
      await audioRef.current.play();
      
      // Fade in the audio
      if (fadeInDuration > 0) {
        fadeIn(isMuted ? 0 : volume, fadeInDuration);
      }
    } catch (err) {
      console.error('Failed to play background music:', err);
      setError('Failed to play background music');
    }
  }, [fadeIn, fadeInDuration, volume, isMuted]);

  const pause = useCallback((): void => {
    if (!audioRef.current) return;
    
    if (fadeOutDuration > 0 && isPlaying) {
      fadeOut(fadeOutDuration, () => {
        audioRef.current?.pause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [fadeOut, fadeOutDuration, isPlaying]);

  const toggle = useCallback(async (): Promise<void> => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((newVolume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  const mute = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, []);

  const unmute = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.volume = originalVolumeRef.current;
      setIsMuted(false);
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    volume,
    play,
    pause,
    toggle,
    setVolume,
    mute,
    unmute,
    isMuted,
  };
};

export default useBackgroundMusic;
