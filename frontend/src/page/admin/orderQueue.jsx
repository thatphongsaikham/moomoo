import React, { useState, useEffect } from "react";
import useOrderService from "../../services/userService";
import OrderList from "../../components/order/orderList";
import { ShoppingCart, Clock, TrendingUp, AlertCircle, Flame, RefreshCw } from "lucide-react";

export default function OrderQueue() {
  const { orders, loading, completeOrder } = useOrderService();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  const handleCompleteOrder = async (orderId) => {
    try {
      await completeOrder(orderId);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading || !orders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">กำลังโหลดข้อมูลออเดอร์...</p>
          <p className="text-gray-400 text-sm mt-2">Loading order data...</p>
        </div>
      </div>
    );
  }

  // ใช้ค่า default [] ป้องกัน undefined
  const normalOrders = orders?.normal || [];
  const specialOrders = orders?.special || [];
  const totalCount = normalOrders.length + specialOrders.length;

  return (
    <div className="p-6 md:p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-red-600 p-3 rounded-full mr-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              ระบบจัดการออเดอร์
            </h1>
            <p className="text-red-400 text-lg mt-2">Order Management System</p>
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-mono">
            {currentTime.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
          </span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="ออเดอร์ทั้งหมด"
          titleEn="Total Orders"
          count={totalCount}
          icon={ShoppingCart}
          color="red"
          trend={totalCount > 0 ? "up" : "neutral"}
        />

        <SummaryCard
          title="เมนูปกติ"
          titleEn="Standard Orders"
          count={normalOrders.length}
          icon={Flame}
          color="red"
          trend="neutral"
        />

        <SummaryCard
          title="เมนูพิเศษ"
          titleEn="Special Orders"
          count={specialOrders.length}
          icon={TrendingUp}
          color="yellow"
          trend="neutral"
        />
      </div>

      {/* Status Alert */}
      {totalCount === 0 && (
        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
            <div>
              <p className="text-yellow-400 font-semibold">ไม่มีออเดอร์ในคิว</p>
              <p className="text-gray-400 text-sm mt-1">No orders in queue at the moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-400 font-semibold">เกิดข้อผิดพลาด</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Lists */}
      <div className="grid md:grid-cols-2 gap-8">
        <OrderList
          title="คิวเมนูปกติ"
          titleEn="Standard Queue"
          color="red"
          orders={normalOrders}
          onComplete={handleCompleteOrder}
        />
        <OrderList
          title="คิวเมนูพิเศษ"
          titleEn="Special Queue"
          color="yellow"
          orders={specialOrders}
          onComplete={handleCompleteOrder}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700 hover:border-gray-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          รีเฟรชข้อมูล
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ title, titleEn, count, icon: Icon, color, trend }) {
  const getColorClasses = (colorType) => {
    switch (colorType) {
      case 'red':
        return {
          bg: 'bg-red-600/20',
          border: 'border-red-600/40',
          icon: 'text-red-500',
          count: 'text-red-400'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-600/20',
          border: 'border-yellow-600/40',
          icon: 'text-yellow-500',
          count: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-gray-600/20',
          border: 'border-gray-600/40',
          icon: 'text-gray-500',
          count: 'text-gray-400'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`bg-black/50 backdrop-blur-sm border ${colors.border} rounded-2xl p-6 hover:border-opacity-60 transition-all duration-300 group hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {trend && (
          <div className="flex items-center">
            <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-gray-500'}`} />
          </div>
        )}
      </div>

      <div className="text-center">
        <div className={`text-4xl md:text-5xl font-serif font-bold ${colors.count} mb-2`}>
          {count}
        </div>
        <div className="text-white font-semibold">{title}</div>
        <div className="text-gray-400 text-sm mt-1">{titleEn}</div>
      </div>
    </div>
  );
}
