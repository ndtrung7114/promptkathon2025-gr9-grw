// Test component for database integration
// Add this to your App.tsx temporarily to test database connectivity

import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useGameState } from '../hooks/useGameState';
import { gameImageService } from '../lib/supabase/database-existing';

export const DatabaseTestComponent: React.FC = () => {
  const { user } = useUser();
  const { userProfile, gameImages, isLoading } = useGameState();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const runTests = async () => {
      const results: string[] = [];
      
      try {
        // Test 1: Check if user is authenticated
        if (user) {
          results.push('✅ User authentication working');
          results.push(`   User ID: ${user.id}`);
        } else {
          results.push('❌ User not authenticated');
        }

        // Test 2: Check user profile loading
        if (userProfile) {
          results.push('✅ User profile loaded');
          results.push(`   Profile: ${userProfile.name || 'No name'}`);
        } else if (user) {
          results.push('⚠️ User authenticated but profile not loaded');
        }

        // Test 3: Check game images loading
        const images = await gameImageService.getAllImages();
        if (images.length > 0) {
          results.push(`✅ Game images loaded (${images.length} images)`);
        } else {
          results.push('⚠️ No game images found - upload some via admin panel');
        }

        // Test 4: Check database connectivity
        results.push('✅ Database connection successful');

      } catch (error) {
        results.push(`❌ Database error: ${error}`);
      }

      setTestResults(results);
    };

    if (!isLoading) {
      runTests();
    }
  }, [user, userProfile, gameImages, isLoading]);

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Database Integration Test</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-4">
      <h3 className="font-bold text-lg mb-2">🧪 Database Integration Test</h3>
      <div className="space-y-1 font-mono text-sm">
        {testResults.map((result, index) => (
          <div key={index} className={
            result.startsWith('✅') ? 'text-green-600' :
            result.startsWith('❌') ? 'text-red-600' :
            result.startsWith('⚠️') ? 'text-yellow-600' :
            'text-gray-600 ml-4'
          }>
            {result}
          </div>
        ))}
      </div>
      
      {user && (
        <div className="mt-4 p-2 bg-white rounded border">
          <p className="text-sm text-gray-600">
            <strong>Next steps:</strong>
          </p>
          <ul className="text-sm text-gray-600 ml-4 list-disc">
            <li>Run migration-script.sql in Supabase</li>
            <li>Upload test images via /admin route</li>
            <li>Play a game to test session tracking</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// To use this component:
// 1. Import it in your App.tsx: import { DatabaseTestComponent } from './components/DatabaseTestComponent';
// 2. Add it to your JSX: <DatabaseTestComponent />
// 3. Remove it after testing is complete
