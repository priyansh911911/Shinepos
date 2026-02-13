import React, { useState, useEffect } from 'react';
import { FaStar, FaComment, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import axios from 'axios';

const FeedbackReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ avgRating: 0, total: 0, positive: 0, negative: 0 });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const avgRating = total > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const positive = data.filter(r => r.rating >= 4).length;
    const negative = data.filter(r => r.rating <= 2).length;
    setStats({ avgRating: avgRating.toFixed(1), total, positive, negative });
  };

  const updateReviewStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'positive') return r.rating >= 4;
    if (filter === 'negative') return r.rating <= 2;
    return true;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'} />
    ));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Customer Feedback & Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg">
          <p className="text-blue-200 text-sm">Average Rating</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-white">{stats.avgRating}</p>
            <FaStar className="text-yellow-400 text-2xl" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-lg">
          <p className="text-purple-200 text-sm">Total Reviews</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg">
          <p className="text-green-200 text-sm">Positive</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-white">{stats.positive}</p>
            <FaThumbsUp className="text-white text-xl" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 rounded-lg">
          <p className="text-red-200 text-sm">Negative</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-white">{stats.negative}</p>
            <FaThumbsDown className="text-white text-xl" />
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>
          All
        </button>
        <button onClick={() => setFilter('positive')} className={`px-4 py-2 rounded ${filter === 'positive' ? 'bg-green-600' : 'bg-gray-700'} text-white`}>
          Positive
        </button>
        <button onClick={() => setFilter('negative')} className={`px-4 py-2 rounded ${filter === 'negative' ? 'bg-red-600' : 'bg-gray-700'} text-white`}>
          Negative
        </button>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-semibold">{review.customerName}</h3>
                <div className="flex gap-1 mt-1">{renderStars(review.rating)}</div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${review.status === 'resolved' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                  {review.status || 'pending'}
                </span>
              </div>
            </div>
            <p className="text-gray-300 mb-3">{review.comment}</p>
            {review.orderNumber && (
              <p className="text-gray-500 text-sm mb-3">Order #{review.orderNumber}</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => updateReviewStatus(review._id, 'resolved')} className="px-3 py-1 bg-green-600 text-white text-sm rounded">
                Mark Resolved
              </button>
              <button onClick={() => updateReviewStatus(review._id, 'pending')} className="px-3 py-1 bg-yellow-600 text-white text-sm rounded">
                Mark Pending
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackReviews;
