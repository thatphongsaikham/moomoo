import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, LogOut, Loader2, ChefHat } from 'lucide-react';
import { useBilingual } from '@/hook/useBilingual';
import { decryptTableId } from '@/utils/encryption';
import menuService from '@/services/menuService';
import tableService from '@/services/tableService';

/**
 * MenuPage - Customer menu with encrypted table ID and cart functionality
 */
function MenuPage() {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  const { isThai } = useBilingual();
  
  // Decrypt table number from URL
  const [tableNumber, setTableNumber] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  // Decrypt table ID on mount
  useEffect(() => {
    const decrypted = decryptTableId(encryptedId);
    if (!decrypted) {
      // Invalid encrypted ID, redirect to home
      navigate('/');
      return;
    }
    setTableNumber(decrypted);
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem(`cart_table_${decrypted}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Fetch table data to get buffet tier
    const fetchTableData = async () => {
      try {
        const response = await tableService.getTableByNumber(decrypted);
        const table = response.data;
        
        // Check if table is still open
        if (table.status !== 'Open') {
          alert(isThai 
            ? 'โต๊ะนี้ถูกปิดแล้ว กรุณาเปิดโต๊ะใหม่' 
            : 'This table has been closed. Please open a new session.');
          navigate('/');
          return;
        }
        
        // Check if table has a valid PIN/session (encryptedId should exist)
        if (!table.encryptedId || !table.pin) {
          alert(isThai 
            ? 'ไม่พบข้อมูลการเปิดโต๊ะ กรุณาขอรหัสใหม่จากพนักงาน' 
            : 'Table session not found. Please request a new PIN from staff.');
          navigate('/');
          return;
        }
        
        setTableData(table);
      } catch (error) {
        console.error('Error fetching table data:', error);
        alert(isThai 
          ? 'ไม่สามารถโหลดข้อมูลโต๊ะได้' 
          : 'Failed to load table data');
        navigate('/');
      }
    };
    fetchTableData();
  }, [encryptedId, navigate, isThai]);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAllMenuItems();
        // Filter only available items
        const availableItems = response.data.filter(item => item.availability);
        setMenuItems(availableItems);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Poll table status every 10 seconds to check if table is still open
  useEffect(() => {
    if (!tableNumber) return;

    const checkTableStatus = async () => {
      try {
        const response = await tableService.getTableByNumber(tableNumber);
        const table = response.data;
        
        // If table is no longer open, redirect to home
        if (table.status !== 'Open') {
          alert(isThai 
            ? 'โต๊ะของคุณถูกปิดแล้ว' 
            : 'Your table has been closed');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking table status:', error);
      }
    };

    // Check immediately and then every 10 seconds
    const interval = setInterval(checkTableStatus, 10000);
    
    return () => clearInterval(interval);
  }, [tableNumber, navigate, isThai]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem(`cart_table_${tableNumber}`, JSON.stringify(cart));
    }
  }, [cart, tableNumber]);

  // Get allowed menu items based on buffet tier
  const getAllowedItems = () => {
    if (!tableData) return [];
    
    const buffetTier = tableData.buffetTier;
    
    // À La Carte is always available
    const alacarte = menuItems.filter(item => item.category === 'À La Carte');
    
    // Add buffet items based on tier
    let buffetItems = [];
    if (buffetTier === 'Starter') {
      buffetItems = menuItems.filter(item => item.category === 'Starter Buffet');
    } else if (buffetTier === 'Premium') {
      buffetItems = menuItems.filter(item => 
        item.category === 'Starter Buffet' || item.category === 'Premium Buffet'
      );
    }
    
    return [...buffetItems, ...alacarte];
  };

  // Group items by food type (subcategory)
  const groupByFoodType = () => {
    const allowedItems = getAllowedItems();
    const grouped = {};
    
    allowedItems.forEach(item => {
      // Use subcategory or default to 'Other'
      const foodType = item.subcategory || 'อื่นๆ';
      if (!grouped[foodType]) {
        grouped[foodType] = [];
      }
      grouped[foodType].push(item);
    });
    
    return grouped;
  };

  // Filter items by selected category
  const getDisplayItems = () => {
    const allowedItems = getAllowedItems();
    
    if (selectedCategory === 'all') {
      return allowedItems.filter(item => item.category !== 'À La Carte');
    } else if (selectedCategory === 'alacarte') {
      return allowedItems.filter(item => item.category === 'À La Carte');
    } else {
      // Filter by food type (subcategory)
      return allowedItems.filter(item => 
        item.subcategory === selectedCategory && item.category !== 'À La Carte'
      );
    }
  };

  // Get unique food types for category buttons
  const getFoodTypeCategories = () => {
    const allowedItems = getAllowedItems();
    const buffetItems = allowedItems.filter(item => item.category !== 'À La Carte');
    const foodTypes = [...new Set(buffetItems.map(item => item.subcategory || 'อื่นๆ'))];
    return foodTypes.sort();
  };

  // Filter items by category
  const filteredItems = getDisplayItems();

  // Cart functions
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem._id !== itemId);
    });
  };

  const getItemQuantity = (itemId) => {
    const item = cart.find(cartItem => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    navigate('/order');
  };

  const handleLogout = () => {
    if (tableNumber) {
      localStorage.removeItem(`cart_table_${tableNumber}`);
    }
    navigate('/');
  };

  // Get category buttons
  const foodTypeCategories = getFoodTypeCategories();

  if (loading || !tableData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {isThai ? 'เมนูของเรา' : 'Our Menu'}
                </h1>
                <p className="text-sm text-gray-400">
                  {isThai ? `โต๊ะที่ ${tableNumber}` : `Table ${tableNumber}`} • {tableData.buffetTier} Buffet
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">
                {isThai ? 'ออกจากระบบ' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Category Filters */}
      <div className="sticky top-[72px] z-30 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isThai ? 'ทั้งหมด' : 'All'}
            </button>
            {foodTypeCategories.map(foodType => (
              <button
                key={foodType}
                onClick={() => setSelectedCategory(foodType)}
                className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === foodType
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {foodType}
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory('alacarte')}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'alacarte'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isThai ? 'อลาคาด' : 'À La Carte'}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const quantity = getItemQuantity(item._id);
            return (
              <div
                key={item._id}
                className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-red-600/20 transition-all duration-300"
              >
                {/* Item Image */}
                {item.imageUrl && (
                  <div className="aspect-video bg-gray-800">
                    <img
                      src={item.imageUrl}
                      alt={isThai ? item.nameThai : item.nameEnglish}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Item Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">
                    {isThai ? item.nameThai : item.nameEnglish}
                  </h3>
                  
                  {item.descriptionThai && item.descriptionEnglish && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {isThai ? item.descriptionThai : item.descriptionEnglish}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">
                      ฿{item.price}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      {quantity > 0 ? (
                        <>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          
                          <span className="text-xl font-bold w-8 text-center">
                            {quantity}
                          </span>
                          
                          <button
                            onClick={() => addToCart(item)}
                            className="w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          {isThai ? 'เพิ่ม' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-500">
              {isThai ? 'ไม่มีเมนูในหมวดนี้' : 'No items in this category'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Cart Footer */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingCart className="w-8 h-8 text-red-600" />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    {isThai ? 'ยอดรวม' : 'Total'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ฿{getTotalPrice()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-all hover:scale-105"
              >
                {isThai ? 'สั่งเลย' : 'Order Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
