import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Calendar, Star, History, Settings, LogOut, Flame } from 'lucide-react';

function ProfilePage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: 'สมชาย ใจดี',
    email: 'somchai@email.com',
    phone: '081-234-5678',
    memberSince: '2024-01-15',
    totalOrders: 23,
    favoriteItems: ['เซ็ตพรีเมียม', 'หอยแครง'],
    addresses: [
      {
        id: 1,
        name: 'บ้าน',
        address: '123 ถนนสุขุมวิท กรุงเทพมหานคร 10110',
        isDefault: true
      }
    ],
    preferences: {
      spicyLevel: 'medium',
      allergies: ['ถั่ว'],
      specialInstructions: 'ไม่ชอบผักบางชนิด'
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock order history
  const orderHistory = [
    {
      id: 'ORD-2024-001',
      date: '2024-11-10',
      items: ['เซ็ตพรีเมียม', 'หอยแครง'],
      total: 419,
      status: 'completed',
      rating: 5
    },
    {
      id: 'ORD-2024-002',
      date: '2024-11-05',
      items: ['เซ็ตมาตรฐาน'],
      total: 259,
      status: 'completed',
      rating: 4
    },
    {
      id: 'ORD-2024-003',
      date: '2024-10-28',
      items: ['เซ็ตพรีเมียม', 'ไอศกรีมไข่เค็ม'],
      total: 349,
      status: 'completed',
      rating: 5
    }
  ];

  const handleLogout = () => {
    // Mock logout
    alert('ออกจากระบบสำเร็จ');
    navigate('/');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold text-white">{userInfo.name}</h3>
            <p className="text-gray-400">สมาชิกตั้งแต่ {userInfo.memberSince}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/50 border border-red-600/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{userInfo.totalOrders}</p>
            <p className="text-gray-400 text-sm">ครั้งที่สั่ง</p>
          </div>
          <div className="bg-black/50 border border-red-600/10 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
              ))}
            </div>
            <p className="text-gray-400 text-sm">คะแนนเฉลี่ย</p>
          </div>
          <div className="bg-black/50 border border-red-600/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-500">VIP</p>
            <p className="text-gray-400 text-sm">ระดับสมาชิก</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
        <h4 className="text-xl font-serif font-semibold text-white mb-4">ข้อมูลติดต่อ</h4>
        <div className="space-y-3">
          <div className="flex items-center text-gray-300">
            <Mail className="w-5 h-5 text-red-500 mr-3" />
            <span>{userInfo.email}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Phone className="w-5 h-5 text-red-500 mr-3" />
            <span>{userInfo.phone}</span>
          </div>
        </div>
      </div>

      {/* Favorite Items */}
      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
        <h4 className="text-xl font-serif font-semibold text-white mb-4">เมนูโปรด</h4>
        <div className="flex flex-wrap gap-2">
          {userInfo.favoriteItems.map((item, index) => (
            <span key={index} className="bg-red-600/20 border border-red-600/30 px-3 py-1 rounded-full text-sm text-red-400">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
      <h4 className="text-xl font-serif font-semibold text-white mb-6">ประวัติการสั่งซื้อ</h4>
      <div className="space-y-4">
        {orderHistory.map((order) => (
          <div key={order.id} className="bg-black/50 border border-red-600/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="text-lg font-semibold text-white">{order.id}</h5>
                <p className="text-gray-400 text-sm">{order.date}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 bg-green-600/20 border border-green-600/30 rounded text-green-400 text-xs mb-2">
                  {order.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                </span>
                <p className="text-white font-bold">฿{order.total}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-sm">รายการ: {order.items.join(', ')}</p>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < order.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Preferences */}
      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
        <h4 className="text-xl font-serif font-semibold text-white mb-4">การตั้งค่าส่วนตัว</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">ระดับความเผ็ด</label>
            <select className="w-full px-4 py-2 bg-black border border-red-600/30 rounded-lg text-white">
              <option value="mild" selected={userInfo.preferences.spicyLevel === 'mild'}>เผ็ดน้อย</option>
              <option value="medium" selected={userInfo.preferences.spicyLevel === 'medium'}>เผ็ดปานกลาง</option>
              <option value="hot" selected={userInfo.preferences.spicyLevel === 'hot'}>เผ็ดมาก</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">ข้อมูลแพ้อาหาร</label>
            <input
              type="text"
              value={userInfo.preferences.allergies.join(', ')}
              className="w-full px-4 py-2 bg-black border border-red-600/30 rounded-lg text-white"
              readOnly
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">คำแนะนำพิเศษ</label>
            <textarea
              value={userInfo.preferences.specialInstructions}
              className="w-full px-4 py-2 bg-black border border-red-600/30 rounded-lg text-white resize-none"
              rows={3}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-6">
        <h4 className="text-xl font-serif font-semibold text-white mb-4">จัดการบัญชี</h4>
        <div className="space-y-3">
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
            เปลี่ยนรหัสผ่าน
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
            แก้ไขข้อมูลส่วนตัว
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <img src="/src/assets/background.png" alt="Profile Background" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600 p-3 rounded-full">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">โปรไฟล์ของฉัน</h1>
          <p className="text-xl text-red-400 font-serif mb-6">My Profile</p>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ประวัติการสั่งซื้อ
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              การตั้งค่า
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;