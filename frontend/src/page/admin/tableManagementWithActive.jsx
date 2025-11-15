import React, { useState } from 'react';
import { LayoutGrid, Eye } from 'lucide-react';
import TableManagement from './tableManagement';
import ActiveTablesView from './activeTablesView';
import { useBilingual } from '../../hook/useBilingual';

function TableManagementWithActive() {
  const { isThai } = useBilingual();
  const [activeTab, setActiveTab] = useState('management'); // 'management' or 'active'

  return (
    <div className="min-h-screen">
      {/* Tab Navigation */}
      <div className="bg-gray-900/50 border-b border-red-600/20">
        <div className="flex justify-center gap-2 p-4">
          <button
            onClick={() => setActiveTab('management')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'management'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mr-2" />
            {isThai ? 'จัดการโต๊ะ' : 'Table Management'}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'active'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <Eye className="w-5 h-5 mr-2" />
            {isThai ? 'โต๊ะที่เปิดอยู่' : 'Active Tables'}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'management' && <TableManagement />}
        {activeTab === 'active' && <ActiveTablesView />}
      </div>
    </div>
  );
}

export default TableManagementWithActive;
