
import React, { useState } from 'react';
import GameLayout from '../components/GameLayout';
import MilestoneImageTestSimple from '../components/MilestoneImageTestSimple';

const Index = () => {
  const [showTest, setShowTest] = useState(false);

  if (showTest) {
    return (
      <div className="min-h-screen p-4">
        <button 
          onClick={() => setShowTest(false)}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to Game
        </button>
        <MilestoneImageTestSimple />
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={() => setShowTest(true)}
        className="fixed top-4 right-4 z-50 bg-purple-500 text-white px-4 py-2 rounded text-xs"
      >
        Test Images
      </button>
      <GameLayout />
    </div>
  );
};

export default Index;
