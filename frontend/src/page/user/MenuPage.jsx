import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Users, Plus, Minus, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import menuService from '../../services/menuService';

function MenuPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState({
    standard: [],
    premium: [],
    special: []
  });
  const [categories, setCategories] = useState([]);

  // Load menu data from API
  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load categories
      const categoriesData = await menuService.getCategories();
      setCategories(categoriesData);

      // Load all menu items from API
      const allMenuItems = await menuService.getAllMenuItems();

      // Categorize items based on their properties
      const standardItems = allMenuItems.filter(item =>
        item.tier === 'standard' && !item.isSpecial
      );
      const premiumItems = allMenuItems.filter(item =>
        item.tier === 'premium' && !item.isSpecial
      );
      const specialItems = allMenuItems.filter(item =>
        item.isSpecial || item.price > 0
      );

      setMenuData({
        standard: standardItems,
        premium: premiumItems,
        special: specialItems
      });

    } catch (error) {
      console.error('Failed to load menu data:', error);
      setError(error.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadMenuData();
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  const getAllItems = () => {
    return [...menuData.standard, ...menuData.premium, ...menuData.special];
  };

  const hasMenuItems = getAllItems().length > 0;

  const filteredItems = () => {
    const allItems = getAllItems();
    if (selectedCategory === 'all') return allItems;
    return allItems.filter(item =>
      item.category.includes(selectedCategory) ||
      item.category.includes(selectedCategory.replace('(พรีเมียม)', '')) ||
      item.category.includes(selectedCategory.replace('พิเศษ', ''))
    );
  };

  const updateQuantity = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getPackageInfo = () => [
    {
      type: 'standard',
      name: 'เซ็ตมาตรฐาน',
      nameEn: 'Standard Set',
      price: 259,
      description: 'เหมาะสำหรับ 2 ท่าน | Perfect for 2 persons',
      items: menuData.standard.length,
      badge: 'ยอดนิยม',
      badgeEn: 'Popular'
    },
    {
      type: 'premium',
      name: 'เซ็ตพรีเมียม',
      nameEn: 'Premium Set',
      price: 299,
      description: 'เหมาะสำหรับ 2 ท่าน | Perfect for 2 persons',
      items: menuData.standard.length + menuData.premium.length,
      badge: 'แนะนำ',
      badgeEn: 'Recommended'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">กำลังโหลดเมนู...</p>
          <p className="text-gray-400 text-sm mt-2">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-red-400 text-lg mb-2">Connection Error</p>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่ / Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/src/assets/background.png"
            alt="Menu Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600 p-3 rounded-full">
              <Flame className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-serif font-bold text-white mb-4">เมนูของเรา</h1>
          <p className="text-xl text-red-400 font-serif mb-6">Our Menu</p>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            สดใหม่ อร่อย ครบครัน พร้อมสัมผัสรสชาติดั้งเดิมที่คุณจะต้องประทับใจ
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรชเมนู
          </button>
        </div>
      </section>

      {/* Package Selection */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">
            เลือกแพ็คเกจของคุณ
            <span className="block text-red-400 text-lg mt-2">Choose Your Package</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {getPackageInfo().map((pkg) => (
              <div
                key={pkg.type}
                className="bg-black border border-red-600/30 rounded-2xl p-8 hover:border-red-600/60 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {pkg.badge}
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-red-400 font-serif mb-4">{pkg.nameEn}</p>

                  <div className="text-4xl font-bold text-red-600 mb-4">฿{pkg.price}</div>

                  <p className="text-gray-400 mb-6">{pkg.description}</p>

                  <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                    <Users className="w-5 h-5" />
                    <span>รวม {pkg.items} รายการ | Includes {pkg.items} items</span>
                  </div>

                  <button
                    onClick={() => navigate('/table')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    เลือกแพ็คเกจนี้ / Select This Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-16 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">
            รายการอาหาร
            <span className="block text-red-400 text-lg mt-2">Menu Items</span>
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.name}
                <span className="text-sm ml-1 text-gray-400">({category.nameEn})</span>
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems().map((item) => {
              const itemId = item._id || item.id;
              const quantity = quantities[itemId] || 0;
              const isPaid = item.price > 0;

              return (
                <div
                  key={itemId}
                  className="bg-gray-900 border border-red-600/20 rounded-xl p-6 hover:border-red-600/40 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-semibold text-white mb-1">
                        {item.name}
                      </h3>
                      <p className="text-red-400 text-sm mb-2">{item.nameEn}</p>
                      <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">
                          {item.category}
                        </span>
                        {isPaid && (
                          <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                            +฿{item.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isPaid && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">฿{item.price}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(itemId, -1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(itemId, 1)}
                          className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredItems().length === 0 && (
            <div className="text-center py-12">
              {hasMenuItems ? (
                <>
                  <p className="text-gray-400 text-lg">ไม่พบรายการอาหารในหมวดนี้</p>
                  <p className="text-gray-500 text-sm mt-2">No items found in this category</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-lg">ยังไม่มีรายการอาหารในระบบ</p>
                  <p className="text-gray-500 text-sm mt-2">No menu items available</p>
                  <p className="text-gray-600 text-sm mt-4">กรุณารอแอดมินเพิ่มเมนู หรือลองรีเฟรชหน้านี้อีกครั้ง</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Special Items Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">รายการพิเศษ</h2>
            <p className="text-xl text-red-400 font-serif">Special Items</p>
            <p className="text-gray-400 mt-4">สามารถเพิ่มได้โดยจ่ายเพิ่มเติม | Available for additional purchase</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuData.special.map((item) => {
              const itemId = item._id || item.id;
              const quantity = quantities[itemId] || 0;

              return (
                <div
                  key={itemId}
                  className="bg-gray-900/50 border border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-serif font-semibold text-white">
                      {item.name}
                    </h3>
                    <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ฿{item.price}
                    </span>
                  </div>
                  <p className="text-yellow-400 text-sm mb-2">{item.nameEn}</p>
                  <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(itemId, -1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(itemId, 1)}
                        className="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {getTotalItems() > 0 && (
        <section className="py-12 px-4 bg-red-600/10 border-t border-red-600/20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                คุณเลือก {getTotalItems()} รายการ
              </h3>
              <p className="text-gray-300 mb-6">
                พร้อมสั่งอาหารแล้วใช่หรือไม่? | Ready to order?
              </p>
              <button
                onClick={() => navigate('/table')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-red-600/50"
              >
                ไปที่หน้าสั่งอาหาร / Go to Ordering
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default MenuPage;