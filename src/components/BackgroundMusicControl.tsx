import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Pause, Play, Settings, X } from 'lucide-react';
import { useBackgroundMusicContext } from '../contexts/BackgroundMusicContext';
import { useLanguage } from '../contexts/LanguageContext';

const BackgroundMusicControl: React.FC = () => {
  const { 
    isPlaying, 
    isLoading, 
    volume, 
    isMuted, 
    isEnabled,
    toggle, 
    setVolume, 
    mute, 
    unmute,
    enable,
    disable
  } = useBackgroundMusicContext();
  
  const { t } = useLanguage();
  const [showControls, setShowControls] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      unmute();
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  };

  const handleToggleMusic = async () => {
    if (!isEnabled) {
      enable();
      // Small delay to allow context to update before playing
      setTimeout(async () => {
        try {
          await toggle();
        } catch (error) {
          console.log('Music play prevented by browser policy');
        }
      }, 100);
    } else {
      await toggle();
    }
  };

  const handleDisableMusic = () => {
    disable();
    setShowControls(false);
  };

  if (!isEnabled && !showControls) {
    // Show a small music icon to enable music
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowControls(true)}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          title="Enable background music"
        >
          <Music className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!showControls ? (
        // Compact music control button
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMusic}
            disabled={isLoading}
            className={`bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              isPlaying ? 'bg-gradient-to-r from-red-100 to-yellow-100' : ''
            }`}
            title={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isLoading ? (
              <div className="w-5 h-5 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-red-500" />
            ) : (
              <Play className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          <button
            onClick={() => setShowControls(true)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            title="Music settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        // Expanded music controls
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-gray-800">Background Music</span>
            </div>
            <button
              onClick={() => setShowControls(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Play/Pause Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleToggleMusic}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin border-2 border-gray-300 border-t-white rounded-full" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
              </span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-700" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #f59e0b ${(isMuted ? 0 : volume) * 100}%, #e5e5e5 ${(isMuted ? 0 : volume) * 100}%, #e5e5e5 100%)`
                }}
              />
              
              <span className="text-xs text-gray-500 w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Disable Music Option */}
          <div className="border-t pt-3">
            <button
              onClick={handleDisableMusic}
              className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              Turn off background music
            </button>
          </div>
        </div>      )}
      
      {/* Custom slider styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default BackgroundMusicControl;
