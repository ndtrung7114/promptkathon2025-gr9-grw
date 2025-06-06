import React from 'react';
import { GameTopic, DifficultyLevel, BestTimes } from './GameLayout';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

interface DifficultySelectionProps {
  topic: GameTopic;
  onDifficultySelect: (difficulty: DifficultyLevel) => void;
  onBack: () => void;
  bestTimes: BestTimes;
}

const DifficultySelection: React.FC<DifficultySelectionProps> = ({
  topic,
  onDifficultySelect,
  onBack,
  bestTimes
}) => {
  const { t } = useLanguage();
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBestTime = (difficulty: DifficultyLevel) => {
    const key = `${topic}-${difficulty}`;
    return bestTimes[key] ? formatTime(bestTimes[key]) : null;
  };

  const getDifficulties = () => {
    // All topics now support 2x2, 3x3, and 4x4 modes
    return [
      { level: 2 as DifficultyLevel, pieces: 4, label: t('difficulty.beginner'), description: t('difficulty.beginner.desc') },
      { level: 3 as DifficultyLevel, pieces: 9, label: t('difficulty.intermediate'), description: t('difficulty.intermediate.desc') },
      { level: 4 as DifficultyLevel, pieces: 16, label: t('difficulty.advanced'), description: t('difficulty.advanced.desc') }
    ];
  };
  
  const difficulties = getDifficulties();
  const topicInfo = {
    history: {
      title: t('home.history.title'),
      description: t('home.history.description'),
      icon: '📜',
      color: 'from-red-500 to-red-700'
    },
    culture: {
      title: t('home.culture.title'),
      description: t('home.culture.description'),
      icon: '🎨',
      color: 'from-yellow-500 to-orange-600'
    }
  };

  const currentTopic = topicInfo[topic];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Fixed Header Controls */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-between items-start px-4">
        {/* Language Toggle Button - Left side */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <LanguageToggle />
        </div>
        
        {/* Back Button - Right side for better balance */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </button>
        </div>
      </div>

      {/* Topic Header */}
      <div className="text-center mb-12 animate-gentle-float mt-20">
        <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${currentTopic.color} rounded-full flex items-center justify-center shadow-lg`}>
          <div className="text-white text-3xl">{currentTopic.icon}</div>
        </div>
        <h1 className="text-5xl font-bold vietnam-title mb-4">
          {currentTopic.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {currentTopic.description}
        </p>
      </div>

      {/* Difficulty Options */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        {difficulties.map((diff, index) => {
          const bestTime = getBestTime(diff.level);
          
          return (
            <div
              key={diff.level}
              onClick={() => onDifficultySelect(diff.level)}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                index === 1 ? 'transform md:scale-110' : ''
              }`}
            >
              <div className="text-center">
                {/* Difficulty Grid Visual */}
                <div className="mb-6 flex justify-center">
                  <div 
                    className="gap-1 w-16 h-16"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${diff.level}, 1fr)`,
                      gridTemplateRows: `repeat(${diff.level}, 1fr)`
                    }}
                  >
                    {Array.from({ length: diff.pieces }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-br ${currentTopic.color} rounded-sm animate-sparkle`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">{diff.label}</h2>
                <p className="text-4xl font-bold text-gray-900 mb-3">{diff.level}×{diff.level}</p>
                <p className="text-lg text-gray-600 mb-3">{diff.pieces} {t('difficulty.pieces')}</p>
                <p className="text-sm text-gray-500 mb-4">{diff.description}</p>

                {/* Best Time Display */}
                {bestTime && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-4 py-2 inline-block">
                    <span className="text-sm font-semibold text-green-700">
                      {t('puzzle.best')}: {bestTime}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentTopic.color.replace('to-', 'to-transparent opacity-0 group-hover:opacity-10')} rounded-3xl transition-opacity duration-300`}></div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8 text-gray-600">
        <p>{t('difficulty.choose')}</p>
      </div>
    </div>
  );
};

export default DifficultySelection;
