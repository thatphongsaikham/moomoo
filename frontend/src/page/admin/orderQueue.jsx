import React, { useState } from "react";
import { ShoppingCart, Clock, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import OrderList from "../../components/order/OrderList";
import { useOrderQueue } from "../../hook/useOrderQueue";
import orderService from "../../services/orderService";
import { useBilingual } from '../../hook/useBilingual';

export default function OrderQueue() {
  const { isThai } = useBilingual();
  const { normalQueue, specialQueue, loading, error, refetch } = useOrderQueue(3000); // 3s polling
  const [completingOrder, setCompletingOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCompleteOrder = async (orderId) => {
    try {
      setCompletingOrder(orderId);
      await orderService.completeOrder(orderId);
      
      // Show success message
      setSuccessMessage(isThai ? 'ทำเครื่องหมายออเดอร์เสร็จสิ้นแล้ว' : 'Order marked as completed');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refetch queues to update UI
      refetch();
    } catch (err) {
      console.error('Failed to complete order:', err);
      alert(err.message || 'Failed to complete order');
    } finally {
      setCompletingOrder(null);
    }
  };

  const totalCount = normalQueue.length + specialQueue.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {isThai ? 'กำลังโหลดคิวออเดอร์...' : 'Loading order queues...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">
              {isThai ? 'คิวออเดอร์ครัว' : 'Kitchen Order Queue'}
            </h1>
            <p className="text-blue-400 text-lg mt-2">
              {isThai ? 'จัดการคิวธรรมดาและคิวพิเศษ' : 'Manage Normal & Special Queues'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-mono">
            {new Date().toLocaleTimeString(isThai ? 'th-TH' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={isThai ? 'ออเดอร์ทั้งหมด' : 'Total Orders'}
          count={totalCount}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title={isThai ? 'คิวธรรมดา' : 'Normal Queue'}
          count={normalQueue.length}
          color="bg-gradient-to-br from-blue-400 to-blue-500"
        />
        <StatCard
          title={isThai ? 'คิวพิเศษ' : 'Special Queue'}
          count={specialQueue.length}
          color="bg-gradient-to-br from-purple-400 to-purple-500"
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className="text-green-400 font-semibold">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-400 font-semibold">
                {isThai ? 'เกิดข้อผิดพลาด' : 'Error'}
              </p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="bg-gray-800 rounded-xl p-12 text-center border-2 border-gray-700 mb-8">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-xl font-semibold">
            {isThai ? 'ไม่มีออเดอร์ในคิว' : 'No orders in queue'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {isThai ? 'รอออเดอร์ใหม่จากลูกค้า...' : 'Waiting for new customer orders...'}
          </p>
        </div>
      )}

      {/* Order Queues */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <OrderList
          queueType="Normal"
          orders={normalQueue}
          onComplete={handleCompleteOrder}
        />
        <OrderList
          queueType="Special"
          orders={specialQueue}
          onComplete={handleCompleteOrder}
        />
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={refetch}
          className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isThai ? 'รีเฟรชคิว' : 'Refresh Queues'}
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, count, color }) {
  return (
    <div className={`${color} rounded-xl p-6 shadow-lg text-white`}>
      <div className="text-center">
        <div className="text-5xl font-bold mb-2">{count}</div>
        <div className="text-sm font-semibold uppercase tracking-wide opacity-90">
          {title}
        </div>
      </div>
    </div>
  );
}
