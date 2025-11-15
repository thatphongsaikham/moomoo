import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Flame, Clock, Users } from 'lucide-react';

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);

  // Mock cart data
  useEffect(() => {
    const mockCartItems = [
      {
        id: 1,
        name: 'เซ็ตมาตรฐาน',
        nameEn: 'Standard Set',
        price: 259,
        quantity: 1,
        category: 'package',
        description: 'เหมาะสำหรับ 2 ท่าน',
        items: ['หมูสไลซ์', 'สามชั้น', 'ลูกชิ้นรวม', 'ผักสด']
      },
      {
        id: 2,
        name: 'หอยแครง',
        nameEn: 'Scallops',
        price: 120,
        quantity: 2,
        category: 'special',
        description: 'หอยแครงสดๆ นำเข้า'
      }
    ];

    const mockTableInfo = {
      tableId: 'T05',
      tableName: 'โต๊ะ 5',
      seats: 4,
      tier: 'standard'
    };

    setCartItems(mockCartItems);
    setTableInfo(mockTableInfo);
  }, []);

  const updateQuantity = (itemId, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateServiceCharge = () => {
    return Math.round(calculateSubtotal() * 0.10); // 10% service charge
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceCharge();
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('กรุณาเพิ่มสินค้าในตะกร้า');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">กำลังโหลดตะกร้า...</p>
          <p className="text-gray-400 text-sm mt-2">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <img src="/src/assets/background.png" alt="Cart Background" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600 p-3 rounded-full">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">ตะกร้าของคุณ</h1>
          <p className="text-xl text-red-400 font-serif mb-6">Your Cart</p>

          {tableInfo && (
            <div className="inline-flex items-center bg-gray-900/50 border border-red-600/30 rounded-lg px-4 py-2 mb-4">
              <Users className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-white">{tableInfo.tableName} - {tableInfo.seats} ที่นั่ง</span>
            </div>
          )}
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-serif font-semibold text-white mb-4">ตะกร้าว่าง</h2>
              <p className="text-gray-400 mb-8">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                ดูเมนู / View Menu
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
                  <h3 className="text-xl font-serif font-semibold text-white mb-6">รายการสินค้า</h3>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-black/50 border border-red-600/10 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                            <p className="text-red-400 text-sm mb-1">{item.nameEn}</p>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">฿{item.price * item.quantity}</p>
                            <p className="text-gray-500 text-sm">฿{item.price} × {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6 sticky top-4">
                  <h3 className="text-xl font-serif font-semibold text-white mb-6">สรุปคำสั่งซื้อ</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-300">
                      <span>รวมสินค้า</span>
                      <span>฿{calculateSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>ค่าบริการ (10%)</span>
                      <span>฿{calculateServiceCharge()}</span>
                    </div>
                    <div className="border-t border-red-600/20 pt-4">
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>ทั้งหมด</span>
                        <span className="text-red-500">฿{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/menu')}
                      className="w-full border border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                    >
                      เพิ่มสินค้า / Add Items
                    </button>
                    <button
                      onClick={proceedToCheckout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      ดำเนินการชำระเงิน / Checkout
                    </button>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-6 p-4 bg-black/50 border border-red-600/10 rounded-lg">
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>เวลาจัดเก็บประมาณ 15-20 นาที</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      <span>บริการที่โต๊ะของคุณ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CartPage;