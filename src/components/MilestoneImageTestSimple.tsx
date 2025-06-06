import React, { useState, useEffect } from 'react';
import { milestoneImageService } from '../lib/supabase/milestoneImageService';

const MilestoneImageTestSimple: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMilestoneId, setTestMilestoneId] = useState('trung-sisters-1');

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching images for milestone:', testMilestoneId);
      const fetchedImages = await milestoneImageService.getImagesByMilestoneId(testMilestoneId);
      console.log('Fetched images:', fetchedImages);
      setImages(fetchedImages);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomImage = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching random image for milestone:', testMilestoneId);
      const randomImage = await milestoneImageService.getRandomImageByMilestoneId(testMilestoneId);
      console.log('Fetched random image:', randomImage);
      setImages(randomImage ? [randomImage] : []);
    } catch (err) {
      console.error('Error fetching random image:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMilestoneImages = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching all images with milestone_id');
      const milestoneImages = await milestoneImageService.getImagesWithMilestones();
      console.log('Fetched milestone images:', milestoneImages);
      setImages(milestoneImages);
    } catch (err) {
      console.error('Error fetching milestone images:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Milestone Image Service Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Milestone ID:</label>
        <input
          type="text"
          value={testMilestoneId}
          onChange={(e) => setTestMilestoneId(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Enter milestone ID (e.g., trung-sisters-1)"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={fetchImages}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch All Images'}
        </button>        <button
          onClick={fetchRandomImage}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Random Image'}
        </button>
        <button
          onClick={fetchAllMilestoneImages}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'All Milestone Images'}
        </button>
        <button
          onClick={fetchAllMilestoneImages}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch All Milestone Images'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Results ({images.length} images):</h3>
        {images.length === 0 && !loading && (
          <p className="text-gray-500">No images found. Click a button to test.</p>
        )}
        {images.map((image, index) => (
          <div key={image.id || index} className="border rounded p-4 mb-4">
            <h4 className="font-semibold">{image.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{image.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>ID:</strong> {image.id}</div>
              <div><strong>Topic:</strong> {image.topic}</div>
              <div><strong>Milestone ID:</strong> {image.milestone_id || 'Not set'}</div>
              <div><strong>Created:</strong> {new Date(image.created_at).toLocaleDateString()}</div>
            </div>
            {image.image_url && (
              <div className="mt-2">
                <img 
                  src={image.image_url} 
                  alt={image.title}
                  className="w-32 h-32 object-cover rounded border"
                  onError={(e) => {
                    console.error('Failed to load image:', image.image_url);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneImageTestSimple;
