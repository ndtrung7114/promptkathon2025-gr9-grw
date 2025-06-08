import React, { useState, useEffect, useRef } from 'react';
import { GameTopic, DifficultyLevel } from './GameLayout';
import { ArrowLeft, Home, Eye, Crown, X } from 'lucide-react';
import VictoryModal from './VictoryModal';
import { Milestone } from '../data/campaigns';
import cuteCatImage from '../assets/images/anh-meo-cute-nhat-15.jpg';
import { milestoneImageService, type GameImage } from '../lib/supabase/milestoneImageService';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface PuzzlePiece {
  id: number;
  imageUrl: string;
  correctPosition: number;
  currentPosition: number;
  x: number; // Percentage for backgroundPosition x
  y: number; // Percentage for backgroundPosition y
  isPlaced: boolean; // Whether the piece is correctly placed
}

interface PuzzleGameProps {
  topic: GameTopic;
  difficulty: DifficultyLevel;
  milestoneId?: string | null;
  milestoneData?: Milestone | null;
  onBack: () => void;
  onComplete: (timeInSeconds: number, moves?: number, hints?: number) => void;
  onHome: () => void;
  currentBestTime: number | null;
  gameState?: {
    updateMoves: (moves: number) => void;
    updateHints: (hints: number) => void;
  };
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({  topic,
  difficulty,
  milestoneId,
  milestoneData,
  onBack,
  onComplete,
  onHome,
  currentBestTime,
  gameState,
}) => {
  const { user } = useUser();
  const { t } = useLanguage();const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [hints, setHints] = useState(0);
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [touchStartPos, setTouchStartPos] = useState<{x: number, y: number} | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const previewTimeoutRef = useRef<NodeJS.Timeout>();
  // Detect touch device on component mount
  useEffect(() => {
    const detectTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    setIsTouchDevice(detectTouchDevice());
  }, []);

  // Fallback images for when database is unavailable
  const fallbackImages = {
    history: [
      {
        url: 'https://picsum.photos/800/600?random=1',
        title: 'Hai Bà Trưng khởi nghĩa tại Hát Môn',
        description: 'Trưng Trắc and Trưng Nhị rally the Vietnamese people against Chinese oppression.',
        audioUrl: '/public/assets/audio/trung-sisters-1-call-to-arms.mp3',
      },
      {
        url: 'https://picsum.photos/800/600?random=2',
        title: 'Cờ hiệu khởi nghĩa của Hai Bà Trưng',
        description: 'Symbol of Vietnamese resistance against foreign occupation.',
        audioUrl: '/public/assets/audio/trung-sisters-1-call-to-arms.mp3',
      },
      {
        url: 'https://picsum.photos/800/600?random=3',
        title: 'Dân chúng tập hợp theo Hai Bà Trưng',
        description: 'People rally to support the Trung Sisters uprising.',
        audioUrl: '/public/assets/audio/trung-sisters-1-call-to-arms.mp3',
      }
    ],
    culture: [
      {
        url: 'https://picsum.photos/800/600?random=10',
        title: 'Tết Nguyên Đán',
        description: 'Tết Nguyên Đán là lễ hội truyền thống lớn nhất trong năm của người Việt.',
        audioUrl: '/public/assets/audio/Tet_Nguyen_Dan.mp3',
      },
    ],
  };
  // Temporary milestone-specific images for testing (using known milestone ID)
  const milestoneSpecificImages: Record<string, Array<{url: string, title: string, description: string, audioUrl: string}>> = {
    '082b7dac-2f81-4d6b-8a84-05c75be42f4e': [
      {
        url: 'https://picsum.photos/800/600?random=1',
        title: 'Hai Bà Trưng khởi nghĩa tại Hát Môn',
        description: 'Trưng Trắc và Trưng Nhị tập hợp nhân dân Việt chống lại sự áp bức của quân Hán.',
        audioUrl: '/public/assets/audio/trung-sisters-1-call-to-arms.mp3',
      },
      {
        url: 'https://picsum.photos/800/600?random=2',
        title: 'Cờ hiệu khởi nghĩa của Hai Bà Trưng',
        description: 'Lá cờ được giương cao như biểu tượng của cuộc khởi nghĩa chống Hán.',
        audioUrl: '/public/assets/audio/trung-sisters-1-call-to-arms.mp3',
      },
      {
        url: 'https://picsum.photos/800/600?random=3',
        title: 'Dân chúng tập hợp theo Hai Bà Trưng',
        description: 'Nhân dân từ khắp nơi đến ủng hộ cuộc khởi nghĩa của Hai Bà Trưng.',
        audioUrl: '/public/assets/audio/trung-sisters-1-call-to-arms.mp3',
      }
    ]
  };// Initialize puzzle with database images
  useEffect(() => {
    const initializePuzzle = async () => {
      let selectedImage;
        // DEBUG: Log milestone_id when component loads
      if (milestoneId) {
        console.log(`DEBUG: Milestone ID received in PuzzleGame: "${milestoneId}"`);
      } else {
        console.log(`DEBUG: No milestone ID received! milestoneId is: ${milestoneId}`);
      }
      
      // If this is a milestone-based game, fetch images from database
      if (milestoneId) {
        try {
          console.log('Fetching images for milestone:', milestoneId);
          const dbImage = await milestoneImageService.getRandomImageByMilestoneId(milestoneId);
            if (dbImage) {
            selectedImage = {
              url: dbImage.image_url,
              title: dbImage.title,
              description: dbImage.description || (milestoneData?.description || ''),
              audioUrl: dbImage.audio_url || (milestoneData?.audioUrl || null),
            };
            console.log('SUCCESS: Using database image for milestone:', selectedImage);
          } else {
            console.warn(`No images found in database for milestone: ${milestoneId}`);
            
            // Try milestone-specific fallback images first
            if (milestoneSpecificImages[milestoneId]) {
              const milestoneImages = milestoneSpecificImages[milestoneId];
              selectedImage = milestoneImages[Math.floor(Math.random() * milestoneImages.length)];
              console.log('Using milestone-specific fallback image:', selectedImage);
            } else if (milestoneData) {
              // If milestone data is available, use it as fallback
              selectedImage = {
                url: milestoneData.imageUrl || cuteCatImage,
                title: milestoneData.title,
                description: milestoneData.description,
                audioUrl: milestoneData.audioUrl,
              };
            } else {
              // Ultimate fallback
              selectedImage = {
                url: cuteCatImage,
                title: 'Default Image',
                description: 'No images available for this milestone',
                audioUrl: null,
              };
            }
          }
        } catch (error) {
          console.error('Error fetching milestone images:', error);
          // Fallback to milestone data on error
          if (milestoneData) {
            selectedImage = {
              url: milestoneData.imageUrl || cuteCatImage,
              title: milestoneData.title,
              description: milestoneData.description,
              audioUrl: milestoneData.audioUrl,
            };
          } else {
            selectedImage = {
              url: cuteCatImage,
              title: 'Default Image',
              description: 'Error loading milestone images',
              audioUrl: null,
            };
          }
        }      } else if (topic === 'history') {
        // For general history games, get images from database by topic (only those with milestone_id)
        try {
          console.log('Fetching history images from database (milestone-linked only)');
          const historyImages = await milestoneImageService.getImagesByTopic('history');
          
          if (historyImages.length > 0) {
            const randomImage = historyImages[Math.floor(Math.random() * historyImages.length)];
            selectedImage = {
              url: randomImage.image_url,
              title: randomImage.title,
              description: randomImage.description || '',
              audioUrl: randomImage.audio_url,
            };
            console.log('SUCCESS: Using random history image from database (milestone-linked):', selectedImage);
          } else {
            // Fallback to hardcoded images if no milestone-linked database images
            console.warn('No milestone-linked history images in database, using fallback');
            const imageSet = fallbackImages.history;
            selectedImage = imageSet[Math.floor(Math.random() * imageSet.length)];
          }
        } catch (error) {
          console.error('Error fetching history images:', error);
          // Fallback to hardcoded images on error
          const imageSet = fallbackImages.history;
          selectedImage = imageSet[Math.floor(Math.random() * imageSet.length)];
        }      } else if (topic === 'culture') {
        // For culture topic, get all images from database by topic (no milestone_id requirement)
        try {
          console.log('Fetching culture images from database (all images with topic=culture)');
          const cultureImages = await milestoneImageService.getImagesByTopicAll('culture');
          
          if (cultureImages.length > 0) {
            const randomImage = cultureImages[Math.floor(Math.random() * cultureImages.length)];
            selectedImage = {
              url: randomImage.image_url,
              title: randomImage.title,
              description: randomImage.description || '',
              audioUrl: randomImage.audio_url,
            };
            console.log('SUCCESS: Using random culture image from database (all culture images):', selectedImage);          } else {
            // Fallback to hardcoded images if no culture images in database
            console.warn('No culture images in database, using fallback');
            const imageSet = fallbackImages.culture;
            selectedImage = imageSet[Math.floor(Math.random() * imageSet.length)];
          }
        } catch (error) {
          console.error('Error fetching culture images:', error);
          // Fallback to hardcoded images on error
          const imageSet = fallbackImages.culture;
          selectedImage = imageSet[Math.floor(Math.random() * imageSet.length)];
        }      } else {
        // For other topics, use database images with milestone_id or fallback
        try {
          console.log(`Fetching ${topic} images from database (milestone-linked only)`);
          const topicImages = await milestoneImageService.getImagesByTopic(topic as 'history' | 'culture');
          
          if (topicImages.length > 0) {
            const randomImage = topicImages[Math.floor(Math.random() * topicImages.length)];
            selectedImage = {
              url: randomImage.image_url,
              title: randomImage.title,
              description: randomImage.description || '',
              audioUrl: randomImage.audio_url,
            };
            console.log(`Using random ${topic} image from database (milestone-linked):`, selectedImage);
          } else {
            // Fallback to hardcoded images if no milestone-linked database images
            console.log(`No milestone-linked ${topic} images in database, using fallback`);
            const imageSet = topic === 'history' ? fallbackImages.history : fallbackImages.culture;
            selectedImage = imageSet[Math.floor(Math.random() * imageSet.length)];
          }        } catch (error) {
          console.error(`Error fetching ${topic} images:`, error);
          // Fallback to hardcoded images on error
          const imageSet = topic === 'history' ? fallbackImages.history : fallbackImages.culture;
          selectedImage = imageSet[Math.floor(Math.random() * imageSet.length)];
        }
      }
      
      setCurrentImage(selectedImage);

      const totalPieces = difficulty * difficulty;
      const newPieces: PuzzlePiece[] = [];

      // Create all pieces (no empty space)
      for (let i = 0; i < totalPieces; i++) {
        const row = Math.floor(i / difficulty);
        const col = i % difficulty;
        
        newPieces.push({
          id: i,
          imageUrl: selectedImage.url,
          correctPosition: i,
          currentPosition: i, // Will be shuffled later
          x: (col / (difficulty - 1)) * 100, // Background position x
          y: (row / (difficulty - 1)) * 100, // Background position y
          isPlaced: false
        });
      }

      // Create shuffled positions array
      const shuffledPositions = Array.from({ length: totalPieces }, (_, i) => i);
      for (let i = shuffledPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
      }

      // Assign shuffled positions to pieces
      newPieces.forEach((piece, index) => {
        piece.currentPosition = shuffledPositions[index];
      });

      setPieces(newPieces);
      setStartTime(Date.now());
      setIsComplete(false);
      setMoves(0);
      setHints(0);
    };

    initializePuzzle();
  }, [topic, difficulty, milestoneData, milestoneId]);

  // Timer effect
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);  // Check for completion
  useEffect(() => {
    if (pieces.length === 0) return;

    const isCompleted = pieces.every(piece => piece.correctPosition === piece.currentPosition);
    if (isCompleted && !isComplete) {
      setIsComplete(true);
      
      // Use setTimeout to avoid state updates during render
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      setTimeout(() => {
        onComplete(completionTime, moves, hints);
      }, 0);
    }
  }, [pieces, isComplete, startTime, moves, hints]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };  const handlePieceClick = (pieceId: number) => {
    // For touch devices, we'll use a more responsive touch-based interaction
    if (isComplete) return;
    
    // Store the first clicked piece
    if (draggedPiece === null) {
      setDraggedPiece(pieceId);
      return;
    }

    // If clicking the same piece, deselect it
    if (draggedPiece === pieceId) {
      setDraggedPiece(null);
      return;
    }

    // Swap the two pieces
    swapPieces(draggedPiece, pieceId);
    setDraggedPiece(null);
  };
  // Touch event handlers for better mobile experience
  const handleTouchStart = (e: React.TouchEvent, pieceId: number) => {
    if (isComplete) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedPiece(pieceId);
    
    // Add haptic feedback if available
    if (navigator.vibrate && isTouchDevice) {
      navigator.vibrate(50);
    }
    
    // Prevent default to avoid scrolling
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isComplete || !touchStartPos || draggedPiece === null) return;
    
    // Prevent scrolling during piece movement
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent, targetPieceId?: number) => {
    if (isComplete || draggedPiece === null) return;
    
    // If we have a specific target (dropped on a piece), swap with it
    if (targetPieceId !== undefined && targetPieceId !== draggedPiece) {
      swapPieces(draggedPiece, targetPieceId);
      
      // Add success haptic feedback
      if (navigator.vibrate && isTouchDevice) {
        navigator.vibrate(100);
      }
    }
    
    // Reset touch state
    setDraggedPiece(null);
    setTouchStartPos(null);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const swapPieces = (piece1Id: number, piece2Id: number) => {
    const piece1 = pieces.find(p => p.id === piece1Id);
    const piece2 = pieces.find(p => p.id === piece2Id);
    
    if (!piece1 || !piece2) return;

    const newPieces = pieces.map(p => {
      if (p.id === piece1Id) {
        return { ...p, currentPosition: piece2.currentPosition };
      }
      if (p.id === piece2Id) {
        return { ...p, currentPosition: piece1.currentPosition };
      }
      return p;
    });

    setPieces(newPieces);
    setMoves(prev => {
      const newMoves = prev + 1;
      gameState?.updateMoves(newMoves);
      return newMoves;
    });
  };
  const handleDragStart = (e: React.DragEvent, pieceId: number) => {
    setDraggedPiece(pieceId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPieceId: number) => {
    e.preventDefault();
    if (draggedPiece === null || draggedPiece === targetPieceId) {
      setDraggedPiece(null);
      return;
    }

    swapPieces(draggedPiece, targetPieceId);
    setDraggedPiece(null);
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
  };  const showPreviewImage = () => {
    // Remove premium restrictions - allow all users to use preview in all modes
    setShowPreview(true);
    setHints(prev => {
      const newHints = prev + 1;
      gameState?.updateHints(newHints);
      return newHints;
    });
    // Remove automatic timeout - user will close manually
  };

  const closePreview = () => {
    setShowPreview(false);
  };const resetPuzzle = () => {
    const totalPieces = difficulty * difficulty;
    
    // Create shuffled positions array
    const shuffledPositions = Array.from({ length: totalPieces }, (_, i) => i);
    for (let i = shuffledPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
    }

    // Apply shuffled positions to pieces
    const newPieces = pieces.map((piece, index) => ({
      ...piece,
      currentPosition: shuffledPositions[index],
      isPlaced: false
    }));    setPieces(newPieces);
    setStartTime(Date.now());
    setIsComplete(false);
    setMoves(0);
    setHints(0);
    setDraggedPiece(null);
  };

  if (!currentImage) return null;  return (
    <div 
      className="min-h-screen flex flex-col p-6 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dfhodnqig/image/upload/v1749190692/backgroundPuzzle_q6q6ub.jpg')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      
      {/* Fixed Header Controls */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-between items-start px-4">
        {/* Language Toggle Button - Left side */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <LanguageToggle />
        </div>
        
        {/* Navigation Buttons - Right side */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">          <button
            onClick={onBack}
            className="flex items-center justify-center px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={onHome}
            className="flex items-center justify-center px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10 flex flex-col min-h-full mt-20">
        {/* Game Stats Bar */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formatTime(currentTime)}</div>
              <div className="text-xs text-gray-500">{t('game.time')}</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{moves}</div>
              <div className="text-xs text-gray-500">{t('game.moves')}</div>
            </div>
            {currentBestTime && (
              <>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{formatTime(currentBestTime)}</div>
                  <div className="text-xs text-gray-500">{t('game.best')}</div>
                </div>
              </>
            )}
          </div>
        </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">        {/* Puzzle Grid */}          <div
            className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl"
            style={{ 
              width: isTouchDevice ? 'min(90vw, 400px)' : '500px', 
              height: isTouchDevice ? 'min(90vw, 400px)' : '500px',
              maxWidth: '500px',
              maxHeight: '500px'
            }}
          >            <div
              className="relative w-full h-full rounded-2xl overflow-hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
                gridTemplateRows: `repeat(${difficulty}, 1fr)`,
                gap: isTouchDevice ? '1px' : '2px',
              }}
            >              {Array.from({ length: difficulty * difficulty }).map((_, position) => {
                const piece = pieces.find(p => p.currentPosition === position);
                if (!piece) return null;

                const isCorrectPosition = piece.correctPosition === piece.currentPosition;
                const isSelected = draggedPiece === piece.id;

                return (                  <div
                    key={position}                    className={`relative bg-gray-200 cursor-pointer transition-all duration-200 select-none ${
                      isSelected ? 'scale-105 z-20 ring-4 ring-yellow-400 ring-opacity-60' : ''
                    } ${isCorrectPosition ? 'ring-2 ring-green-400' : ''} ${
                      isTouchDevice 
                        ? `puzzle-piece-mobile touch-manipulation active:scale-95 ${isSelected ? 'selected' : ''}` 
                        : 'tile-hover'
                    }`}
                    onClick={() => !isTouchDevice && handlePieceClick(piece.id)}
                    onTouchStart={(e) => isTouchDevice && handleTouchStart(e, piece.id)}
                    onTouchMove={(e) => isTouchDevice && handleTouchMove(e)}
                    onTouchEnd={(e) => isTouchDevice && handleTouchEnd(e, piece.id)}
                    onDragOver={!isTouchDevice ? handleDragOver : undefined}
                    onDrop={!isTouchDevice ? (e) => handleDrop(e, piece.id) : undefined}
                    style={{
                      backgroundImage: `url(${piece.imageUrl})`,
                      backgroundSize: `${difficulty * 100}% ${difficulty * 100}%`,
                      backgroundPosition: `${piece.x}% ${piece.y}%`,
                      borderRadius: isTouchDevice ? '6px' : '8px',
                      minHeight: isTouchDevice ? '80px' : 'auto',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                    }}
                  >
                    <div
                      draggable={!isTouchDevice}
                      onDragStart={!isTouchDevice ? (e) => handleDragStart(e, piece.id) : undefined}
                      onDragEnd={!isTouchDevice ? handleDragEnd : undefined}
                      className={`w-full h-full rounded-lg border-2 transition-colors duration-200 ${
                        isSelected ? 'border-yellow-400' : 'border-white/50 hover:border-yellow-400'
                      }`}
                      style={{
                        pointerEvents: isTouchDevice ? 'none' : 'auto',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>          {/* Preview Overlay */}
          {showPreview && (
            <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
              {/* Close button */}
              <button
                onClick={closePreview}
                className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              <img
                src={currentImage.url}
                alt={t('game.preview')}
                className="max-w-full max-h-full rounded-2xl opacity-75"
                onError={() => console.error('Failed to load preview image')}
              />
            </div>
          )}
        </div>
      </div>      {/* Bottom Controls - Better organized layout */}
      <div className="flex flex-col items-center gap-4 mt-6">        {/* Primary Action Buttons Row */}
        <div className="flex items-center justify-center gap-4">
          {/* Preview button - now available for all users in all modes */}
          <button
            onClick={showPreviewImage}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-gray-700"
          >
            <Eye className="w-5 h-5" />
            <span>{t('game.preview')}</span>
          </button>
          
          <button
            onClick={resetPuzzle}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-gray-700"
          >
            <span>{t('game.shuffle')}</span>
          </button>
        </div>
      </div>{/* Victory Modal */}
      {isComplete && currentImage && (
        <VictoryModal
          image={currentImage}
          time={currentTime}
          moves={moves}
          isNewBest={!currentBestTime || currentTime < currentBestTime}
          onReplay={resetPuzzle}
          onHome={onHome}
          onBack={onBack}
        />      )}
      </div> {/* Close content wrapper */}
        {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          setShowPremiumModal(false);
          console.log('Navigate to premium upgrade');
        }}
      />
    </div>
  );
};

export default PuzzleGame;