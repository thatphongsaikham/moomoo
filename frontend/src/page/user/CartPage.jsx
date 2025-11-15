import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Loader2, Send } from 'lucide-react';
import orderService from '@/services/orderService';
import menuService from '@/services/menuService';
import { useBilingual } from '@/hook/useBilingual';

/**
 * CartPage - Review cart and submit order
 */
function CartPage() {
  const navigate = useNavigate();
  const { t, isThai } = useBilingual();
  
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);
  const [notes, setNotes] = useState('');

  // Load cart and menu data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get table number
        const storedTableNumber = localStorage.getItem('tableNumber');
        if (!storedTableNumber) {
          alert(isThai ? 'กรุณาระบุหมายเลขโต๊ะ' : 'Please enter table number');
          navigate('/');
          return;
        }
        setTableNumber(parseInt(storedTableNumber));

        // Load cart
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }

        // Load menu items
        const response = await menuService.getAllMenuItems();
        setMenuItems(response.data || response);
      } catch (error) {
        console.error('Failed to load cart data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate, isThai]);

  // Get cart items with menu data
  const getCartItems = () => {
    return Object.entries(cart)
      .map(([itemId, quantity]) => {
        const menuItem = menuItems.find(item => item._id === itemId);
        return menuItem ? { menuItem, quantity } : null;
      })
      .filter(Boolean);
  };

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    const newCart = { ...cart };
    if (newQuantity <= 0) {
      delete newCart[itemId];
    } else {
      newCart[itemId] = newQuantity;
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Calculate total
  const calculateTotal = () => {
    return getCartItems().reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);
  };

  // Submit order
  const handleSubmitOrder = async () => {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      alert(isThai ? 'ตะกร้าว่างเปล่า' : 'Cart is empty');
      return;
    }

    try {
      setSubmitting(true);
      
      // Format items for API
      const items = Object.entries(cart).map(([menuItem, quantity]) => ({
        menuItem,
        quantity,
      }));

      // Submit order
      const response = await orderService.placeOrder(tableNumber, items, notes);
      
      // Clear cart
      localStorage.removeItem('cart');
      setCart({});
      
      // Show success
      alert(
        isThai
          ? `สั่งอาหารสำเร็จ! ออเดอร์ของคุณอยู่ใน ${response.data.queueType} queue`
          : `Order placed successfully! Your order is in the ${response.data.queueType} queue`
      );
      navigate('/');
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert(error.message || (isThai ? 'ไม่สามารถสั่งอาหารได้' : 'Failed to place order'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  const cartItems = getCartItems();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isThai ? 'ตะกร้า' : 'Cart'}
              </h1>
              <p className="text-sm text-gray-600">
                {isThai ? 'โต๊ะที่' : 'Table'} {tableNumber}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {isThai ? 'ตะกร้าว่างเปล่า' : 'Your cart is empty'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isThai ? 'เพิ่มรายการอาหารจากเมนู' : 'Add items from the menu'}
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {isThai ? 'ดูเมนู' : 'View Menu'}
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              {cartItems.map(({ menuItem, quantity }) => (
                <div
                  key={menuItem._id}
                  className="flex items-center justify-between p-4 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {isThai ? menuItem.nameThai : menuItem.nameEnglish}
                    </h3>
                    <p className="text-sm text-gray-600">{menuItem.category}</p>
                    <p className="text-red-600 font-bold mt-1">
                      ฿{menuItem.price} × {quantity} = ฿{menuItem.price * quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(menuItem._id, quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(menuItem._id, quantity + 1)}
                      className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(menuItem._id, 0)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {isThai ? 'หมายเหตุ (ถ้ามี)' : 'Notes (optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isThai ? 'เช่น ไม่ใส่ผักชี' : 'e.g. No cilantro'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                rows="3"
              />
            </div>

            {/* Total */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-800">{isThai ? 'รวมทั้งหมด' : 'Total'}</span>
                <span className="text-red-600">฿{total}</span>
              </div>
              {total === 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {isThai ? '(รายการบุฟเฟ่ต์ฟรี)' : '(Buffet items are free)'}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isThai ? 'กำลังส่ง...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>{isThai ? 'ส่งออเดอร์' : 'Submit Order'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
