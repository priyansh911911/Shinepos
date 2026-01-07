import { useState, useEffect } from 'react';

export const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setLoading(false);
  };

  const deleteCategory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const toggleCategoryStatus = async (id, currentStatus) => {
    // Optimistic update
    setCategories(prev => 
      prev.map(cat => 
        cat._id === id ? { ...cat, isActive: !currentStatus } : cat
      )
    );
    
    const result = await updateCategory(id, { isActive: !currentStatus });
    
    // Revert on failure
    if (!result.success) {
      setCategories(prev => 
        prev.map(cat => 
          cat._id === id ? { ...cat, isActive: currentStatus } : cat
        )
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    deleteCategory,
    updateCategory,
    toggleCategoryStatus
  };
};
