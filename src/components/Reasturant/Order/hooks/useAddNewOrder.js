import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAddNewOrder = (orderId) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/menus/get/all-menu-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data.menuItems || []);
    } catch (err) {
      console.error('Fetch menu items error:', err);
      setError('Failed to fetch menu items');
    }
  };

  const openItemModal = (menuItem) => {
    setSelectedItem(menuItem);
    setSelectedVariation(menuItem.variation?.[0] || null);
    setSelectedAddons([]);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setSelectedVariation(null);
    setSelectedAddons([]);
  };

  const addItemToOrder = () => {
    if (!selectedItem || !selectedVariation) return;
    
    const itemPrice = selectedVariation.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const itemKey = `${selectedItem._id}-${selectedVariation._id}-${selectedAddons.map(a => a._id).join(',')}`;
    
    const existingItem = orderItems.find(item => item.key === itemKey);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.key === itemKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems(prev => [...prev, {
        key: itemKey,
        menuId: selectedItem._id,
        name: selectedItem.itemName,
        variation: selectedVariation,
        addons: selectedAddons,
        price: itemPrice,
        quantity: 1
      }]);
    }
    
    closeItemModal();
  };

  const updateItemQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.key !== itemKey));
    } else {
      setOrderItems(prev => prev.map(item =>
        item.key === itemKey
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeItem = (itemKey) => {
    setOrderItems(prev => prev.filter(item => item.key !== itemKey));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleAddItemsToOrder = async () => {
    if (!orderId) {
      setError('Order ID is required');
      return;
    }
    
    if (orderItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const itemsData = {
        items: orderItems.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
          variation: {
            variationId: item.variation._id
          },
          addons: item.addons.map(addon => ({
            addonId: addon._id
          }))
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/api/orders/add-items/${orderId}`, itemsData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setOrderItems([]);
        setError('');
        onClose(); // Close modal and redirect
        return { success: true, order: response.data.order };
      }
    } catch (err) {
      console.error('Add items to order error:', err);
      console.log('Response data:', err.response?.data);
      if (err.response?.data?.message) {
        // Success case - backend returns success message
        setOrderItems([]);
        setError('');
        onClose();
        return { success: true };
      }
      setError(err.response?.data?.error || 'Failed to add items to order');
      return { success: false, error: err.response?.data?.error || 'Failed to add items to order' };
    } finally {
      setLoading(false);
    }
  };

  return {
    menuItems,
    orderItems,
    loading,
    error,
    selectedItem,
    selectedVariation,
    setSelectedVariation,
    selectedAddons,
    setSelectedAddons,
    searchTerm,
    setSearchTerm,
    openItemModal,
    closeItemModal,
    addItemToOrder,
    updateItemQuantity,
    removeItem,
    calculateTotal,
    handleAddItemsToOrder
  };
};