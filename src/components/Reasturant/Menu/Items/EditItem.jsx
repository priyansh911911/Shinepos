import React, { useState, useEffect } from 'react';
import { useCategory } from '../Category/hooks/useCategory';

const EditItem = ({ item, onSuccess, onBack }) => {
  const { categories } = useCategory();
  const [formData, setFormData] = useState({
    itemName: '',
    categoryID: '',
    status: 'active',
    imageUrl: '',
    videoUrl: '',
    timeToPrepare: '',
    foodType: 'veg'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName || '',
        categoryID: item.categoryID || '',
        status: item.status || 'active',
        imageUrl: item.imageUrl || '',
        videoUrl: item.videoUrl || '',
        timeToPrepare: item.timeToPrepare || '',
        foodType: item.foodType || 'veg'
      });
    }
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/update/menu-item/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName: formData.itemName,
          categoryID: formData.categoryID,
          status: formData.status,
          imageUrl: formData.imageUrl,
          videoUrl: formData.videoUrl,
          timeToPrepare: Number(formData.timeToPrepare),
          foodType: formData.foodType
        })
      });

      if (response.ok) {
        alert('Item updated successfully!');
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update item');
      }
    } catch (error) {
      alert('Error updating item');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Item</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Item Name</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="categoryID"
            value={formData.categoryID}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Video URL</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="https://example.com/video.mp4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time to Prepare (minutes)</label>
          <input
            type="number"
            name="timeToPrepare"
            value={formData.timeToPrepare}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Food Type</label>
          <select
            name="foodType"
            value={formData.foodType}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-Vegetarian</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Item'}
        </button>
      </form>
    </div>
  );
};

export default EditItem;