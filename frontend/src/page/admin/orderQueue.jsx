import React, { useState, useEffect } from "react";
import { ShoppingCart, Clock, AlertCircle, RefreshCw, CheckCircle, Send, ChefHat } from "lucide-react";
import OrderList from "../../components/order/OrderList";
import { useOrderQueue } from "../../hook/useOrderQueue";
import orderService from "../../services/orderService";
import { useBilingual } from '../../hook/useBilingual';

export default function OrderQueue() {
  const { isThai } = useBilingual();
  const { normalQueue, specialQueue, loading, error, refetch } = useOrderQueue(3000); // 3s polling
  const [servingOrder, setServingOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ส่งเมนูคิวแรก (complete order)
  const handleServeFirstOrder = async (queueType) => {
    const queue = queueType === 'Normal' ? normalQueue : specialQueue;
    if (queue.length === 0) return;
    
    const firstOrder = queue[0];
    try {
      setServingOrder(firstOrder._id);
      await orderService.complete(firstOrder._id);
      
      // Show success message
      const tableNum = firstOrder.tableNumber;
      setSuccessMessage(
        isThai 
          ? `✅ ส่งเมนูโต๊ะ ${tableNum} เรียบร้อย!` 
          : `✅ Served to Table ${tableNum}!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refetch queues to update UI
      refetch();
    } catch (err) {
      console.error('Failed to serve order:', err);
      alert(err.message || 'Failed to serve order');
    } finally {
      setServingOrder(null);
    }
  };

  const totalCount = normalQueue.length + specialQueue.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {isThai ? 'กำลังโหลดคิวออเดอร์...' : 'Loading order queues...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2.5 rounded-xl">
              <ChefHat className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {isThai ? '🍳 คิวออเดอร์ครัว' : '🍳 Kitchen Queue'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isThai ? 'กดส่งเมนูเมื่อทำเสร็จ' : 'Press serve when ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">
                {currentTime.toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })}
              </span>
            </div>
            <button
              onClick={refetch}
              className="p-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title={isThai ? 'รีเฟรช' : 'Refresh'}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 md:p-4 text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalCount}</div>
          <div className="text-xs md:text-sm text-gray-400">
            {isThai ? 'ออเดอร์ทั้งหมด' : 'Total'}
          </div>
        </div>
        <div className="bg-blue-900/30 border border-blue-600/30 rounded-xl p-3 md:p-4 text-center">
          <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">{normalQueue.length}</div>
          <div className="text-xs md:text-sm text-blue-300">
            {isThai ? 'คิวปกติ' : 'Normal'}
          </div>
        </div>
        <div className="bg-purple-900/30 border border-purple-600/30 rounded-xl p-3 md:p-4 text-center">
          <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">{specialQueue.length}</div>
          <div className="text-xs md:text-sm text-purple-300">
            {isThai ? 'คิวพิเศษ' : 'Special'}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className="text-green-400 font-semibold text-lg">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Order Queues - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-2">
        <OrderList
          queueType="Normal"
          orders={normalQueue}
          onServeFirst={() => handleServeFirstOrder('Normal')}
          isServing={servingOrder === (normalQueue[0]?._id)}
        />
        <OrderList
          queueType="Special"
          orders={specialQueue}
          onServeFirst={() => handleServeFirstOrder('Special')}
          isServing={servingOrder === (specialQueue[0]?._id)}
        />
      </div>
    </div>
  );
}
