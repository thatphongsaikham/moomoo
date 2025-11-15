import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Users, Utensils, AlertCircle } from 'lucide-react';
import tableService from '../../services/tableService';
import orderService from '../../services/orderService';
import { useBilingual } from '../../hook/useBilingual';

/**
 * Linked List Node for Table
 */
class TableNode {
  constructor(tableData) {
    this.data = tableData;
    this.next = null;
  }
}

/**
 * Linked List for Active Tables
 */
class ActiveTablesLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Add table to the end of the list
  append(tableData) {
    const newNode = new TableNode(tableData);
    
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  // Remove table by table ID (ใช้ _id แทน tableNumber เพื่อความแม่นยำ)
  remove(tableId) {
    if (!this.head) return false;

    // If head node is the one to remove
    if (this.head.data._id === tableId) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.data._id === tableId) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Update table data
  update(tableId, newData) {
    let current = this.head;
    while (current) {
      if (current.data._id === tableId) {
        current.data = { ...current.data, ...newData };
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Find table by ID
  find(tableId) {
    let current = this.head;
    while (current) {
      if (current.data._id === tableId) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  // Check if table exists
  exists(tableId) {
    return this.find(tableId) !== null;
  }

  // Convert to array for rendering
  toArray() {
    const arr = [];
    let current = this.head;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  // Get all table IDs
  getAllIds() {
    const ids = new Set();
    let current = this.head;
    while (current) {
      ids.add(current.data._id);
      current = current.next;
    }
    return ids;
  }

  // Clear all nodes
  clear() {
    this.head = null;
    this.size = 0;
  }
}

function ActiveTablesView() {
  const { isThai } = useBilingual();
  const tablesLinkedListRef = useRef(new ActiveTablesLinkedList());
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  /**
   * Fetch active tables and their orders
   */
  const fetchActiveTables = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    fetchingRef.current = true;

    try {
      // Get all open tables from server
      const response = await tableService.getTables('Open');
      const openTables = response.data || [];

      const linkedList = tablesLinkedListRef.current;
      
      // Get current table IDs in linked list
      const currentTableIds = linkedList.getAllIds();
      
      // Get new table IDs from server
      const serverTableIds = new Set(openTables.map(t => t._id));

      // 1. Remove tables that are no longer open (ลบโต๊ะที่ปิดไปแล้ว)
      const tablesToRemove = [...currentTableIds].filter(id => !serverTableIds.has(id));
      tablesToRemove.forEach(tableId => {
        const removed = linkedList.remove(tableId);
        if (removed) {
          console.log(`Removed closed table: ${tableId}`);
        }
      });

      // 2. Update existing tables or add new ones
      for (const table of openTables) {
        try {
          // Get orders for this table
          const ordersResponse = await orderService.getOrdersByTable(table.tableNumber);
          const orders = ordersResponse.data || [];

          const tableWithOrders = {
            ...table,
            orders: orders,
            orderCount: orders.length
          };

          // Update if exists, append if new
          if (linkedList.exists(table._id)) {
            linkedList.update(table._id, tableWithOrders);
          } else {
            linkedList.append(tableWithOrders);
            console.log(`Added new table: ${table.tableNumber} (${table._id})`);
          }
        } catch (error) {
          console.error(`Failed to fetch orders for table ${table.tableNumber}:`, error);
          
          // Still update/add table without orders
          const tableWithoutOrders = {
            ...table,
            orders: [],
            orderCount: 0
          };

          if (linkedList.exists(table._id)) {
            linkedList.update(table._id, tableWithoutOrders);
          } else {
            linkedList.append(tableWithoutOrders);
          }
        }
      }

      // Convert linked list to array for rendering
      if (mountedRef.current) {
        setTables([...linkedList.toArray()]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch active tables:', error);
      if (mountedRef.current) {
        setLoading(false);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  /**
   * Format time remaining (milliseconds to MM:SS)
   */
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  /**
   * Get time color based on remaining time
   */
  const getTimeColor = (ms) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes <= 0) return 'text-red-500 font-bold';
    if (minutes <= 15) return 'text-yellow-500 font-bold';
    return 'text-green-400';
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (order) => {
    const statusMap = {
      Pending: { bg: 'bg-yellow-600', text: isThai ? 'รอทำ' : 'Pending' },
      'In Progress': { bg: 'bg-blue-600', text: isThai ? 'กำลังทำ' : 'In Progress' },
      Completed: { bg: 'bg-green-600', text: isThai ? 'เสร็จแล้ว' : 'Completed' },
      Served: { bg: 'bg-gray-600', text: isThai ? 'เสิร์ฟแล้ว' : 'Served' }
    };

    const status = statusMap[order.status] || statusMap.Pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${status.bg} text-white`}>
        {status.text}
      </span>
    );
  };

  /**
   * Poll tables every 3 seconds
   */
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchActiveTables();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchActiveTables();
    }, 3000);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchActiveTables]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">{isThai ? 'กำลังโหลด...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-red-600 p-3 rounded-full mr-4">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              {isThai ? 'โต๊ะที่เปิดอยู่' : 'Active Tables'}
            </h1>
            <p className="text-red-400 text-lg mt-2">
              {isThai ? 'รายการออเดอร์และเวลาที่เหลือ' : 'Orders & Time Remaining'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
          <div className="bg-black/50 backdrop-blur-sm border border-blue-600/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'โต๊ะที่เปิด' : 'Open Tables'}</p>
              <p className="text-blue-400 text-3xl font-bold">{tables.length}</p>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-green-600/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'ออเดอร์ทั้งหมด' : 'Total Orders'}</p>
              <p className="text-green-400 text-3xl font-bold">
                {tables.reduce((sum, t) => sum + t.orderCount, 0)}
              </p>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4 col-span-2 md:col-span-1">
            <div className="text-center">
              <p className="text-gray-400 text-sm">{isThai ? 'ลูกค้าทั้งหมด' : 'Total Customers'}</p>
              <p className="text-purple-400 text-3xl font-bold">
                {tables.reduce((sum, t) => sum + t.customerCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables List */}
      {tables.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-xl">
            {isThai ? 'ไม่มีโต๊ะที่เปิดอยู่' : 'No active tables'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tables.map((table) => (
            <div
              key={table._id}
              className="bg-black/50 backdrop-blur-sm border-2 border-blue-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Table Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl font-bold">{table.tableNumber}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {isThai ? 'โต๊ะ' : 'Table'} {table.tableNumber}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center text-gray-300">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">{table.customerCount} {isThai ? 'ท่าน' : 'pax'}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {table.buffetTier === 'Starter' ? (isThai ? 'ธรรมดา' : 'Starter') : (isThai ? 'พรีเมียม' : 'Premium')} (฿{table.buffetPrice})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center gap-3 bg-gray-900/50 px-6 py-3 rounded-xl border border-gray-700">
                  <Clock className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400">{isThai ? 'เวลาที่เหลือ' : 'Time Left'}</p>
                    <p className={`text-2xl font-mono font-bold ${getTimeColor(table.diningTimeRemaining)}`}>
                      {formatTimeRemaining(table.diningTimeRemaining)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-red-400" />
                    {isThai ? 'ออเดอร์' : 'Orders'} ({table.orderCount})
                  </h4>
                </div>

                {table.orders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {isThai ? 'ยังไม่มีออเดอร์' : 'No orders yet'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {table.orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-gray-900/30 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-400">
                              {isThai ? 'ออเดอร์' : 'Order'} #{order._id.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleTimeString('th-TH')}
                            </p>
                          </div>
                          {getStatusBadge(order)}
                        </div>

                        {/* Order Items */}
                        <div className="mt-3 space-y-2">
                          {order.items.map((item, idx) => (
                            <div 
                              key={`${order._id}-item-${item.menuItem?._id || idx}`} 
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-300">
                                {item.quantity}x {isThai ? item.menuItem?.nameThai : item.menuItem?.nameEnglish}
                              </span>
                              {item.menuItem?.price > 0 && (
                                <span className="text-gray-400">฿{item.menuItem.price * item.quantity}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Special Notes */}
                        {order.specialNotes && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-500">{isThai ? 'หมายเหตุ' : 'Notes'}:</p>
                            <p className="text-sm text-gray-400">{order.specialNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning if time is running out */}
              {table.diningTimeRemaining <= 900000 && table.diningTimeRemaining > 0 && (
                <div className="mt-4 bg-yellow-900/30 border border-yellow-500 rounded-lg p-3 flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-400 font-semibold">
                    {isThai ? 'ใกล้หมดเวลา! กรุณาเตรียมปิดโต๊ะ' : 'Time running out! Please prepare to close table'}
                  </p>
                </div>
              )}

              {/* Overtime Warning */}
              {table.diningTimeRemaining <= 0 && (
                <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-3 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-400 font-semibold">
                    {isThai ? 'เกินเวลา! กรุณาปิดโต๊ะโดยเร็ว' : 'Overtime! Please close table immediately'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Linked List Info */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>{isThai ? 'ใช้ Linked List Structure สำหรับการจัดการโต๊ะ' : 'Using Linked List Structure for Table Management'}</p>
        <p>{isThai ? 'ขนาดรายการ' : 'List Size'}: {tablesLinkedListRef.current.size} {isThai ? 'โหนด' : 'nodes'}</p>
      </div>
    </div>
  );
}

export default ActiveTablesView;