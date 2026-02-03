import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSave } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RecipeDeduction = ({ onAlert }) => {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    menuItemId: '',
    ingredients: [{ inventoryItemId: '', quantity: 0, unit: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [recipesRes, menuRes, inventoryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/recipes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/menus/get/all-menu-items`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/inventory/all/inventory/items`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setRecipes(recipesRes.data.recipes || []);
      setMenuItems(menuRes.data.menuItems || []);
      setInventory(inventoryRes.data.inventory || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { inventoryItemId: '', quantity: 0, unit: '' }]
    }));
  };

  const updateIngredient = (index, field, value) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const saveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/inventory/recipes`, newRecipe, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewRecipe({
        menuItemId: '',
        ingredients: [{ inventoryItemId: '', quantity: 0, unit: '' }]
      });
      setShowAddRecipe(false);
      fetchData();
      onAlert(['Recipe saved successfully']);
    } catch (error) {
      console.error('Error saving recipe:', error);
      onAlert(['Failed to save recipe']);
    }
  };

  const processOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/inventory/process-order`, { orderId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAlert(['Inventory automatically updated based on order']);
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Recipe Auto-Deduction</h2>
          <p className="text-gray-600">Automatically deduct inventory when menu items are sold</p>
        </div>
        <button
          onClick={() => setShowAddRecipe(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Recipe</span>
        </button>
      </div>

      {showAddRecipe && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create New Recipe</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Menu Item</label>
            <select
              value={newRecipe.menuItemId}
              onChange={(e) => setNewRecipe(prev => ({ ...prev, menuItemId: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Menu Item</option>
              {menuItems.map(item => (
                <option key={item._id} value={item._id}>{item.itemName}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ingredients</label>
            {newRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <select
                  value={ingredient.inventoryItemId}
                  onChange={(e) => updateIngredient(index, 'inventoryItemId', e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="">Select Ingredient</option>
                  {inventory.map(item => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                  className="w-24 p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-20 p-2 border rounded-lg"
                />
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
            >
              + Add Ingredient
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveRecipe}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
            >
              <FiSave />
              <span>Save Recipe</span>
            </button>
            <button
              onClick={() => setShowAddRecipe(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Existing Recipes</h3>
        </div>
        <div className="divide-y">
          {recipes.map(recipe => {
            const menuItem = menuItems.find(item => item._id === recipe.menuItemId);
            return (
              <div key={recipe._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{menuItem?.itemName || 'Unknown Item'}</h4>
                    <div className="mt-2 space-y-1">
                      {recipe.ingredients.map((ing, index) => {
                        const inventoryItem = inventory.find(item => item._id === ing.inventoryItemId);
                        return (
                          <div key={index} className="text-sm text-gray-600">
                            {inventoryItem?.name || 'Unknown'}: {ing.quantity} {ing.unit}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <FiEdit />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Create recipes linking menu items to inventory ingredients</li>
          <li>• When an order is placed, inventory is automatically deducted</li>
          <li>• Real-time stock updates prevent overselling</li>
          <li>• Accurate cost tracking for each menu item</li>
        </ul>
      </div>
    </div>
  );
};

export default RecipeDeduction;