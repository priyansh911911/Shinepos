import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaSms, FaPaperPlane, FaUsers, FaFilter } from 'react-icons/fa';
import axios from 'axios';

const MarketingCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    subject: '',
    message: '',
    targetAudience: 'all',
    minSpent: 0,
    minOrders: 0
  });

  useEffect(() => {
    fetchCampaigns();
    fetchCustomers();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const getTargetCount = () => {
    if (formData.targetAudience === 'all') return customers.length;
    if (formData.targetAudience === 'vip') return customers.filter(c => (c.totalSpent || 0) >= formData.minSpent).length;
    if (formData.targetAudience === 'frequent') return customers.filter(c => (c.totalOrders || 0) >= formData.minOrders).length;
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
      setShowModal(false);
      setFormData({ name: '', type: 'email', subject: '', message: '', targetAudience: 'all', minSpent: 0, minOrders: 0 });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const sendCampaign = async (id) => {
    if (window.confirm('Send this campaign now?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns/${id}/send`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCampaigns();
      } catch (error) {
        console.error('Error sending campaign:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Marketing Campaigns</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaPaperPlane /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-3xl text-white" />
            <div>
              <p className="text-blue-200 text-sm">Email Campaigns</p>
              <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.type === 'email').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FaSms className="text-3xl text-white" />
            <div>
              <p className="text-green-200 text-sm">SMS Campaigns</p>
              <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.type === 'sms').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FaUsers className="text-3xl text-white" />
            <div>
              <p className="text-purple-200 text-sm">Total Reach</p>
              <p className="text-2xl font-bold text-white">{campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign._id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {campaign.type === 'email' ? <FaEnvelope className="text-blue-400" /> : <FaSms className="text-green-400" />}
                  <h3 className="text-white font-semibold">{campaign.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${campaign.status === 'sent' ? 'bg-green-600' : campaign.status === 'scheduled' ? 'bg-yellow-600' : 'bg-gray-600'} text-white`}>
                    {campaign.status || 'draft'}
                  </span>
                </div>
                {campaign.subject && <p className="text-gray-400 text-sm mb-1">Subject: {campaign.subject}</p>}
                <p className="text-gray-300 text-sm mb-2">{campaign.message}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Target: {campaign.targetAudience}</span>
                  <span>Sent: {campaign.sentCount || 0}</span>
                  <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                {campaign.status !== 'sent' && (
                  <button onClick={() => sendCampaign(campaign._id)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <FaPaperPlane /> Send
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 p-6 rounded-lg w-[500px] my-8">
            <h3 className="text-xl font-bold text-white mb-4">Create Campaign</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Campaign Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mb-3 px-4 py-2 bg-gray-700 text-white rounded" required />
              
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full mb-3 px-4 py-2 bg-gray-700 text-white rounded">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>

              {formData.type === 'email' && (
                <input type="text" placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full mb-3 px-4 py-2 bg-gray-700 text-white rounded" required />
              )}

              <textarea placeholder="Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full mb-3 px-4 py-2 bg-gray-700 text-white rounded" rows="4" required />

              <div className="mb-3">
                <label className="text-white block mb-2 flex items-center gap-2">
                  <FaFilter /> Target Audience
                </label>
                <select value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded">
                  <option value="all">All Customers</option>
                  <option value="vip">VIP Customers (by spending)</option>
                  <option value="frequent">Frequent Customers (by orders)</option>
                </select>
              </div>

              {formData.targetAudience === 'vip' && (
                <input type="number" placeholder="Minimum Spent (₹)" value={formData.minSpent} onChange={(e) => setFormData({ ...formData, minSpent: Number(e.target.value) })}
                  className="w-full mb-3 px-4 py-2 bg-gray-700 text-white rounded" />
              )}

              {formData.targetAudience === 'frequent' && (
                <input type="number" placeholder="Minimum Orders" value={formData.minOrders} onChange={(e) => setFormData({ ...formData, minOrders: Number(e.target.value) })}
                  className="w-full mb-3 px-4 py-2 bg-gray-700 text-white rounded" />
              )}

              <div className="bg-blue-900 p-3 rounded mb-3">
                <p className="text-blue-200 text-sm">Target Reach: <span className="font-bold text-white">{getTargetCount()} customers</span></p>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-600 text-white py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCampaigns;
