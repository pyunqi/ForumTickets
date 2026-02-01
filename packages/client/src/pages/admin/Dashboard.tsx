import { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminManagement } from './AdminManagement';
import { OrderManagement } from './OrderManagement';
import { TicketManagement } from './TicketManagement';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'admins'>('orders');

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              订单管理
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              票种管理
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              管理员管理
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'tickets' && <TicketManagement />}
          {activeTab === 'admins' && <AdminManagement />}
        </div>
      </div>
    </AdminLayout>
  );
}
