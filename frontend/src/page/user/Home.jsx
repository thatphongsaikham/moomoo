import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Phone, Star, ChefHat, Flame } from "lucide-react";
import { useBilingual } from '@/hook/useBilingual';
import { encryptTableId } from '@/utils/encryption';
import menuService from '@/services/menuService';
import tableService from '@/services/tableService';

function Home() {
  const navigate = useNavigate();
  const { isThai } = useBilingual();
  const [tableNumber, setTableNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  // Menu data grouped by category: { starter: [], premium: [], special: [] }
  const [menuData, setMenuData] = useState({ starter: [], premium: [], special: [] });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('starter');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAllMenuItems();
        console.log('Menu response:', response);
        // Backend returns { success: true, data: { starter: [], premium: [], special: [] } }
        const data = response?.data || response || { starter: [], premium: [], special: [] };
        console.log('Parsed menu data:', data);
        setMenuData({
          starter: data.starter || [],
          premium: data.premium || [],
          special: data.special || []
        });
      } catch (error) {
        console.error('Error fetching menu:', error);
        setMenuData({ starter: [], premium: [], special: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-y-auto pt-20 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 z-10"></div>
        <div className="absolute inset-0">
          <img
            src="/src/assets/background.png"
            alt="BBQ Restaurant Background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto my-auto">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600 p-4 rounded-full animate-pulse">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 tracking-tight">
            <span className="text-red-600">m</span>oo<span className="text-red-600">m</span>oo
          </h1>
          <p className="text-xl md:text-2xl text-red-400 font-serif mb-2">
            บุฟเฟ่ต์หมูกระทะ
          </p>
          <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            ทานไม่อั้น! เนื้อสด ผักสด วัตถุดิบคุณภาพ ในราคาคุ้มค่า
            <br />
            All You Can Eat Thai BBQ & Hotpot Buffet
          </p>
          
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-8">
            <Clock className="w-5 h-5" />
            <p className="text-base">
              {isThai ? 'เปิดทุกวัน: จ.-ศ. 11:00-22:00 | ส.-อา. 10:00-23:00' : 'Open Daily: Mon-Fri 11:00-22:00 | Sat-Sun 10:00-23:00'}
            </p>
          </div>
          
          {/* Location */}
          <div className="max-w-2xl mx-auto mb-6">
            <h3 className="text-xl font-serif font-semibold text-gray-300 mb-3 text-center">
              {isThai ? 'ตำแหน่งร้าน' : 'Location'}
            </h3>
            
            <div className="rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d473.53481731071787!2d99.49054067344835!3d18.28886597803102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d96d4652d07923%3A0x5af6e807bb05ba67!2z4Lir4LmJ4Liy4LmB4Lii4LiB4Lir4Lit4LiZ4Liy4Lis4Li04LiB4Liy!5e0!3m2!1sth!2sth!4v1763242097809!5m2!1sth!2sth&style=feature:all%7Celement:geometry%7Ccolor:0x242f3e&style=feature:all%7Celement:labels.text.stroke%7Ccolor:0x242f3e&style=feature:all%7Celement:labels.text.fill%7Ccolor:0x746855&style=feature:road%7Celement:geometry%7Ccolor:0x38414e&style=feature:road%7Celement:geometry.stroke%7Ccolor:0x212a37&style=feature:road.highway%7Celement:geometry%7Ccolor:0x746855&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0x1f2835&style=feature:water%7Celement:geometry%7Ccolor:0x17263c" 
                width="100%" 
                height="250" 
                style={{border:0, filter: 'invert(90%) hue-rotate(180deg)'}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant Location"
              ></iframe>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                const section = document.getElementById('order-section');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/50 animate-pulse"
            >
              ได้รับโต๊ะแล้วเริ่มสั่งเลย / Start Ordering
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">ราคาบุฟเฟ่ต์</h2>
            <p className="text-xl text-red-400 font-serif">Buffet Pricing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gray-900/50 border border-red-600/20 rounded-xl overflow-hidden group hover:border-red-600/50 transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-serif font-bold text-white">เซ็ตมาตรฐาน</h3>
                  <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">฿259</span>
                </div>
                <p className="text-gray-400 mb-6">Standard Set</p>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> เนื้อวัวออสเตรเลีย</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> หมูสามชั้น</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ไก่</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> อาหารทะเล</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ผักสด</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-red-600/20 rounded-xl overflow-hidden group hover:border-red-600/50 transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-serif font-bold text-white">เซ็ตพรีเมียม</h3>
                  <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">฿299</span>
                </div>
                <p className="text-gray-400 mb-6">Premium Set</p>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> เนื้อวัวพรีเมียม</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> หมูวากิว</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ไก่อบ</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> กุ้งหอยเป๋าฮื้อ</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ผักนานาชนิด</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => {
                console.log('Button clicked, current showMenu:', showMenu);
                console.log('Current menuData:', menuData);
                console.log('Current loading:', loading);
                setShowMenu(!showMenu);
              }}
              className="border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/50 animate-pulse"
            >
              {showMenu ? (isThai ? 'ซ่อนเมนู / Hide Menu' : 'Hide Menu') : (isThai ? 'ดูเมนูทั้งหมด / Full Menu' : 'Full Menu')}
            </button>
          </div>

          {/* Menu Display Section */}
          {showMenu && (
            <div className="mt-12 max-w-6xl mx-auto animate-slideDown">
              <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 border border-red-600/30">
                <h3 className="text-3xl font-serif font-bold text-white mb-6 text-center">
                  {isThai ? 'รายการเมนูทั้งหมด' : 'Full Menu'}
                </h3>

                {/* Category Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <button
                    onClick={() => setSelectedCategory('starter')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedCategory === 'starter'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Starter ({menuData.starter.length})
                  </button>
                  <button
                    onClick={() => setSelectedCategory('premium')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedCategory === 'premium'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Premium ({menuData.premium.length})
                  </button>
                  <button
                    onClick={() => setSelectedCategory('special')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedCategory === 'special'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    A la carte ({menuData.special.length})
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <p className="text-gray-400 mt-4">{isThai ? 'กำลังโหลดเมนู...' : 'Loading menu...'}</p>
                  </div>
                ) : menuData[selectedCategory] && menuData[selectedCategory].length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuData[selectedCategory].map((item) => (
                      <div key={item.id || item._id} className="bg-black/50 border border-red-600/20 rounded-lg p-4 hover:border-red-600/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                          {selectedCategory === 'special' && item.price > 0 && (
                            <span className="text-red-400 font-bold">฿{item.price}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                        )}
                        {item.foodType && (
                          <p className="text-gray-500 text-xs mb-2">{item.foodType}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                            {selectedCategory === 'starter' ? 'Starter' : selectedCategory === 'premium' ? 'Premium' : 'A la carte'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.isAvailable 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-red-600/20 text-red-400'
                          }`}>
                            {item.isAvailable ? (isThai ? 'พร้อมให้บริการ' : 'Available') : (isThai ? 'หมด' : 'Out of Stock')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">{isThai ? 'ไม่พบรายการเมนู' : 'No menu items found'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order Section */}
      <section id="order-section" className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-600 p-4 rounded-full">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-serif font-bold text-white mb-4">เริ่มสั่งอาหาร</h2>
            <p className="text-xl text-red-400 font-serif">Start Your Order</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-black/50 backdrop-blur-md rounded-lg p-8 border border-red-600/30">
              <label className="block text-white text-lg font-semibold mb-4 text-center">
                {isThai ? 'กรุณาระบุหมายเลขโต๊ะและรหัส 4 หลัก' : 'Enter Table Number and 4-Digit PIN'}
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {isThai ? 'หมายเลขโต๊ะ' : 'Table Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder={isThai ? 'โต๊ะที่ 1-10' : 'Table 1-10'}
                    className="w-full px-4 py-3 bg-gray-900 text-white border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 text-center text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {isThai ? 'รหัส 4 หลัก' : '4-Digit PIN'}
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    pattern="[0-9]*"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    className="w-full px-4 py-3 bg-gray-900 text-white border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 text-center text-2xl font-bold tracking-widest"
                  />
                </div>
                <button
                  onClick={async () => {
                    const num = parseInt(tableNumber);
                    if (num >= 1 && num <= 10 && pin.length === 4) {
                      try {
                        const response = await tableService.verifyPIN(num, pin);
                        
                        if (response.success) {
                          navigate(`/menu/${response.data.encryptedId}`);
                        } else {
                          alert(isThai ? 'รหัส PIN ไม่ถูกต้อง' : 'Invalid PIN');
                        }
                      } catch (error) {
                        alert(isThai 
                          ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' 
                          : 'Error occurred, please try again');
                      }
                    } else {
                      alert(isThai 
                        ? 'กรุณาระบุโต๊ะที่ 1-10 และรหัส 4 หลัก' 
                        : 'Please enter table 1-10 and 4-digit PIN');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
                >
                  {isThai ? 'เข้าสู่ระบบ' : 'Enter'}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-4 text-center">
                <div>
                  หากไม่ได้รับรหัสผ่าน 4 หลัก สามารถขอได้จากพนักงาน
                </div>
                <div>
                  ขออภัยล่วงหน้าในความไม่สะดวก
                </div>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">ติดต่อเรา</h2>
            <p className="text-xl text-red-400 font-serif">Contact & Location</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4">
                <MapPin className="w-12 h-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">ที่อยู่</h3>
              <p className="text-gray-400">123 ถนนสุขุมวิท<br/>กรุงเทพมหานคร 10110</p>
              <p className="text-red-400 text-sm mt-2">123 Sukhumvit Road<br/>Bangkok 10110</p>
            </div>

            <div className="text-center">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4">
                <Clock className="w-12 h-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">เวลาเปิด-ปิด</h3>
              <p className="text-gray-400">จันทร์ - ศุกร์: 11:00 - 22:00<br/>เสาร์ - อาทิตย์: 10:00 - 23:00</p>
              <p className="text-red-400 text-sm mt-2">Mon-Fri: 11:00-22:00<br/>Sat-Sun: 10:00-23:00</p>
            </div>

            <div className="text-center">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4">
                <Phone className="w-12 h-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">โทรศัพท์</h3>
              <p className="text-gray-400">02-123-4567</p>
              <p className="text-red-400 text-sm mt-2">Reservation recommended</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-600/20 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">moomoo</h3>
            <p className="text-red-400 font-serif">บุฟเฟ่ต์หมูกระทะ</p>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 บุฟเฟ่ต์หมูกระทะ. All rights reserved. | สงวนลิขสิทธิ์ พ.ศ. 2567
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
