import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ChefHat, AlertCircle, Loader2, RefreshCw, Power } from 'lucide-react';
import menuService from '../../services/menuService';
import { useBilingual } from '../../hook/useBilingual';

function MenuManagement() {
  const { isThai } = useBilingual();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    category: 'Starter Buffet',
    nameThai: '',
    nameEnglish: '',
    descriptionThai: '',
    descriptionEnglish: '',
    price: 0,
    imageUrl: ''
  });

  useEffect(() => {
    loadMenuItems();
  }, [categoryFilter]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.getMenuItems(categoryFilter);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setError(isThai ? 'ไม่สามารถโหลดรายการเมนูได้' : 'Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Starter Buffet',
      nameThai: '',
      nameEnglish: '',
      descriptionThai: '',
      descriptionEnglish: '',
      price: 0,
      imageUrl: ''
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await menuService.createMenuItem(formData);
      showSuccess(isThai ? 'เพิ่มรายการเมนูสำเร็จ' : 'Menu item created successfully');
      setShowAddDialog(false);
      resetForm();
      loadMenuItems();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      nameThai: item.nameThai,
      nameEnglish: item.nameEnglish,
      descriptionThai: item.descriptionThai || '',
      descriptionEnglish: item.descriptionEnglish || '',
      price: item.price,
      imageUrl: item.imageUrl || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await menuService.updateMenuItem(editingItem._id, formData);
      showSuccess(isThai ? 'อัปเดตรายการเมนูสำเร็จ' : 'Menu item updated successfully');
      setShowEditDialog(false);
      setEditingItem(null);
      resetForm();
      loadMenuItems();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const newAvailability = item.availability === 'Available' ? 'Out of Stock' : 'Available';
      await menuService.toggleAvailability(item._id, newAvailability);
      showSuccess(isThai ? 'เปลี่ยนสถานะสำเร็จ' : 'Availability updated');
      loadMenuItems();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(isThai 
      ? `ต้องการลบ "${item.nameThai}" หรือไม่?` 
      : `Delete "${item.nameEnglish}"?`)) {
      return;
    }

    try {
      await menuService.deleteMenuItem(item._id);
      showSuccess(isThai ? 'ลบรายการเมนูสำเร็จ' : 'Menu item deleted successfully');
      loadMenuItems();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Starter Buffet': return 'bg-blue-500';
      case 'Premium Buffet': return 'bg-purple-500';
      case 'Special Menu': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const categories = ['Starter Buffet', 'Premium Buffet', 'Special Menu'];

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">
            {isThai ? 'กำลังโหลดข้อมูลเมนู...' : 'Loading menu items...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">
              {isThai ? 'จัดการเมนูอาหาร' : 'Menu Management'}
            </h1>
            <p className="text-blue-400 text-lg mt-2">
              {isThai ? 'เพิ่ม แก้ไข และจัดการรายการเมนู' : 'Add, Edit, and Manage Menu Items'}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <p className="text-green-400 font-semibold">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isThai ? 'เพิ่มเมนูใหม่' : 'Add Menu Item'}
        </button>
        <button
          onClick={loadMenuItems}
          className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {isThai ? 'รีเฟรช' : 'Refresh'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            categoryFilter === null
              ? 'bg-white text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isThai ? 'ทั้งหมด' : 'All'} ({menuItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-white text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border-2 border-gray-700">
          <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-xl font-semibold">
            {isThai ? 'ไม่มีรายการเมนู' : 'No menu items found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all shadow-lg"
            >
              {/* Category Badge */}
              <div className="flex items-start justify-between mb-4">
                <span className={`${getCategoryBadgeColor(item.category)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.availability === 'Available'
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                    }`}
                    title={item.availability === 'Available' ? 'Mark as Out of Stock' : 'Mark as Available'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item Names */}
              <h3 className="text-xl font-bold text-white mb-1">
                {isThai ? item.nameThai : item.nameEnglish}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {isThai ? item.nameEnglish : item.nameThai}
              </p>

              {/* Description */}
              {(item.descriptionThai || item.descriptionEnglish) && (
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {isThai ? item.descriptionThai : item.descriptionEnglish}
                </p>
              )}

              {/* Price */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-blue-400">
                  ฿{item.price}
                </span>
              </div>

              {/* Availability Status */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.availability === 'Available'
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {item.availability === 'Available' 
                    ? (isThai ? 'พร้อมให้บริการ' : 'Available')
                    : (isThai ? 'หมด' : 'Out of Stock')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleEditClick(item)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isThai ? 'แก้ไข' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDeleteItem(item)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isThai ? 'ลบ' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <Dialog
          title={isThai ? 'เพิ่มเมนูใหม่' : 'Add New Menu Item'}
          onClose={() => {
            setShowAddDialog(false);
            resetForm();
          }}
        >
          <MenuForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAddItem}
            onCancel={() => {
              setShowAddDialog(false);
              resetForm();
            }}
            submitLabel={isThai ? 'เพิ่มเมนู' : 'Add Item'}
            isThai={isThai}
          />
        </Dialog>
      )}

      {/* Edit Dialog */}
      {showEditDialog && editingItem && (
        <Dialog
          title={isThai ? 'แก้ไขเมนู' : 'Edit Menu Item'}
          onClose={() => {
            setShowEditDialog(false);
            setEditingItem(null);
            resetForm();
          }}
        >
          <MenuForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateItem}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingItem(null);
              resetForm();
            }}
            submitLabel={isThai ? 'บันทึก' : 'Save Changes'}
            isThai={isThai}
          />
        </Dialog>
      )}
    </div>
  );
}

// Dialog Component
function Dialog({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Menu Form Component
function MenuForm({ formData, setFormData, onSubmit, onCancel, submitLabel, isThai }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'หมวดหมู่' : 'Category'} <span className="text-red-400">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="Starter Buffet">Starter Buffet</option>
          <option value="Premium Buffet">Premium Buffet</option>
          <option value="Special Menu">Special Menu</option>
        </select>
      </div>

      {/* Thai Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'ชื่อเมนู (ไทย)' : 'Thai Name'} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="nameThai"
          value={formData.nameThai}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={isThai ? 'กรอกชื่อเมนูภาษาไทย' : 'Enter Thai name'}
        />
      </div>

      {/* English Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'ชื่อเมนู (อังกฤษ)' : 'English Name'} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="nameEnglish"
          value={formData.nameEnglish}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={isThai ? 'กรอกชื่อเมนูภาษาอังกฤษ' : 'Enter English name'}
        />
      </div>

      {/* Thai Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'คำอธิบาย (ไทย)' : 'Thai Description'}
        </label>
        <textarea
          name="descriptionThai"
          value={formData.descriptionThai}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={isThai ? 'กรอกคำอธิบายภาษาไทย' : 'Enter Thai description'}
        />
      </div>

      {/* English Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'คำอธิบาย (อังกฤษ)' : 'English Description'}
        </label>
        <textarea
          name="descriptionEnglish"
          value={formData.descriptionEnglish}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={isThai ? 'กรอกคำอธิบายภาษาอังกฤษ' : 'Enter English description'}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'ราคา (฿)' : 'Price (฿)'} <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={isThai ? 'กรอกราคา (0 สำหรับบุฟเฟ่ต์)' : 'Enter price (0 for buffet items)'}
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {isThai ? 'URL รูปภาพ' : 'Image URL'}
        </label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={isThai ? 'กรอก URL รูปภาพ (ถ้ามี)' : 'Enter image URL (optional)'}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          {isThai ? 'ยกเลิก' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}

export default MenuManagement;
