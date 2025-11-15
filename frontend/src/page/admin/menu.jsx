import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ChefHat, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import menuService from '../../services/menuService';

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    nameEn: '',
    description: '',
    price: 0,
    category: 'เครื่องเคียง',
    tier: 'standard',
    isSpecial: false
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const allItems = await menuService.getAllMenuItems();
      setMenuItems(allItems || []);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setError('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const menuItemData = {
        ...newItem,
        price: newItem.isSpecial ? parseFloat(newItem.price) : 0
      };

      const addedItem = await menuService.addMenuItem(menuItemData);

      // Reload menu items to get the latest list including local storage items
      await loadMenuItems();

      // Reset form
      setNewItem({
        name: '',
        nameEn: '',
        description: '',
        price: 0,
        category: 'เครื่องเคียง',
        tier: 'standard',
        isSpecial: false
      });
      setShowAddForm(false);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuService.deleteMenuItem(id);
        setMenuItems(menuItems.filter(item => (item._id || item.id) !== id));
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">กำลังโหลดข้อมูลเมนู...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-red-600 p-3 rounded-full mr-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              จัดการเมนู
            </h1>
            <p className="text-red-400 text-lg mt-2">Menu Management</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-400 font-semibold">เกิดข้อผิดพลาด</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {!showAddForm && (
          <button
            onClick={loadMenuItems}
            className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </button>
        )}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-600/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มเมนูใหม่
          </button>
        )}
      </div>

      {/* Add Menu Form */}
      {showAddForm && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-600/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-serif font-bold text-white flex items-center">
              <Plus className="w-6 h-6 text-red-500 mr-3" />
              เพิ่มเมนูใหม่
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleAddItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">ชื่อเมนู (ภาษาไทย) *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">ชื่อเมนู (English)</label>
                <input
                  type="text"
                  value={newItem.nameEn}
                  onChange={(e) => setNewItem({...newItem, nameEn: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">หมวดหมู่</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="หมู">หมู</option>
                  <option value="เนื้อ">เนื้อ</option>
                  <option value="อาหารทะเล">อาหารทะเล</option>
                  <option value="เครื่องเคียง">เครื่องเคียง</option>
                  <option value="ผัก">ผัก</option>
                  <option value="เส้น">เส้น</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ของหวาน">ของหวาน</option>
                </select>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">ระดับ</label>
                <select
                  value={newItem.tier}
                  onChange={(e) => setNewItem({...newItem, tier: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white focus:border-red-600 focus:outline-none"
                >
                  <option value="standard">มาตรฐาน</option>
                  <option value="premium">พรีเมียม</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-white font-medium mb-2">คำอธิบาย</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={newItem.isSpecial}
                    onChange={(e) => setNewItem({...newItem, isSpecial: e.target.checked, price: e.target.checked ? '' : 0})}
                    className="mr-2"
                  />
                  เมนูพิเศษ (คิดเงินเพิ่ม)
                </label>
              </div>
              {newItem.isSpecial && (
                <div>
                  <label className="block text-white font-medium mb-2">ราคา (บาท) *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                    required
                    min="1"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                เพิ่มเมนู
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-red-600/20 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-serif font-bold text-white">
            รายการเมนู ({menuItems.length} รายการ)
          </h3>
        </div>

        {menuItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-lg">ไม่มีรายการเมนู</p>
            <p className="text-gray-500 text-sm mt-2">No menu items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-medium">ชื่อเมนู</th>
                  <th className="px-6 py-4 text-left text-white font-medium">หมวดหมู่</th>
                  <th className="px-6 py-4 text-left text-white font-medium">ระดับ</th>
                  <th className="px-6 py-4 text-left text-white font-medium">ราคา</th>
                  <th className="px-6 py-4 text-center text-white font-medium">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {menuItems.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        {item.nameEn && (
                          <div className="text-gray-400 text-sm">{item.nameEn}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.tier === 'premium'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {item.tier === 'premium' ? 'พรีเมียม' : 'มาตรฐาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.price > 0 ? (
                        <span className="text-yellow-400 font-semibold">฿{item.price}</span>
                      ) : (
                        <span className="text-green-400">ฟรี</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteItem(item._id || item.id)}
                          className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuManagement;