import React, { useState } from 'react';
import axios from 'axios';

const ZomatoSync = () => {
  const [resId, setResId] = useState('21351606');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const syncResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/zomato/sync-menu`,
        { resId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(syncResponse.data);
    } catch (err) {
      console.error('Sync error:', err);
      setError(err.response?.data?.error || 'Failed to sync menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">🔄 Sync Menu from Zomato</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Zomato Restaurant ID
          </label>
          <input
            type="text"
            value={resId}
            onChange={(e) => setResId(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter Zomato Restaurant ID"
          />
        </div>

        <button
          onClick={handleSync}
          disabled={loading || !resId}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? '🔄 Syncing...' : '✓ Sync Menu'}
        </button>

        {error && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 bg-green-500/20 border border-green-500/50 text-white px-4 py-3 rounded-xl">
            <p className="font-medium mb-2">✓ Sync Successful!</p>
            <div className="text-sm space-y-1">
              <p>Categories: {result.stats.categories}</p>
              <p>Items: {result.stats.items}</p>
              <p>Variations: {result.stats.variations}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZomatoSync;
