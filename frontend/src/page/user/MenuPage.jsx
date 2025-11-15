import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, RefreshCw, ShoppingCart } from 'lucide-react';
import MenuCategory from '@/components/menu/MenuCategory';
import menuService from '@/services/menuService';
import { useBilingual } from '@/hook/useBilingual';

/**
 * MenuPage - Display menu items by category with cart functionality
 */
function MenuPage() {
  const navigate = useNavigate();
  const { t, isThai } = useBilingual();
  
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({}); // {itemId: quantity}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Load menu data
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.getAllMenuItems();
      setMenuItems(response.data || response);
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group items by category
  const groupedItems = {
    'Starter Buffet': menuItems.filter(item => item.category === 'Starter Buffet'),
    'Premium Buffet': menuItems.filter(item => item.category === 'Premium Buffet'),
    'Special Menu': menuItems.filter(item => item.category === 'Special Menu'),
  };

  // Add to cart
  const handleAddToCart = (item) => {
    const newCart = {
      ...cart,
      [item._id]: (cart[item._id] || 0) + 1,
    };
    setCart(newCart);
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Remove from cart
  const handleRemoveFromCart = (itemId) => {
    const newCart = { ...cart };
    if (newCart[itemId] > 1) {
      newCart[itemId]--;
    } else {
      delete newCart[itemId];
    }
    setCart(newCart);
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Calculate total items in cart
  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('common.error')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadMenu}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isThai ? 'ลองใหม่' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('nav.menu')}</h1>
          <p className="text-gray-600">{t('app.tagline')}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white shadow-sm border-b sticky top-20 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            {[
              { id: 'all', label: isThai ? 'ทั้งหมด' : 'All' },
              { id: 'Starter Buffet', label: isThai ? 'บุฟเฟ่ต์ปกติ' : 'Starter Buffet' },
              { id: 'Premium Buffet', label: isThai ? 'บุฟเฟ่ต์พรีเมียม' : 'Premium Buffet' },
              { id: 'Special Menu', label: isThai ? 'เมนูพิเศษ' : 'Special Menu' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'all' ? (
          // Show all categories
          <>
            <MenuCategory
              category="Starter Buffet"
              items={groupedItems['Starter Buffet']}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
            />
            <MenuCategory
              category="Premium Buffet"
              items={groupedItems['Premium Buffet']}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
            />
            <MenuCategory
              category="Special Menu"
              items={groupedItems['Special Menu']}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
            />
          </>
        ) : (
          // Show selected category
          <MenuCategory
            category={activeTab}
            items={groupedItems[activeTab]}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {isThai ? 'ยังไม่มีรายการอาหาร' : 'No menu items available'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 right-4 z-20">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full shadow-lg transition-all transform hover:scale-105"
          >
            <ShoppingCart size={24} />
            <span className="font-bold text-lg">{getTotalItems()}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
