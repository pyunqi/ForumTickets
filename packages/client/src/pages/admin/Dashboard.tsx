import { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminManagement } from './AdminManagement';
import { OrderManagement } from './OrderManagement';
import { TicketManagement } from './TicketManagement';
import { PaymentSettingsManagement } from './PaymentSettings';
import { SponsorManagement } from './SponsorManagement';
import { ConferenceManagement } from './ConferenceManagement';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'sponsors' | 'conference' | 'payment' | 'admins'>('orders');

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              订单管理
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              票种管理
            </button>
            <button
              onClick={() => setActiveTab('sponsors')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'sponsors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              赞助商管理
            </button>
            <button
              onClick={() => setActiveTab('conference')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'conference'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              会议信息
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'payment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              支付设置
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          {activeTab === 'sponsors' && <SponsorManagement />}
          {activeTab === 'conference' && <ConferenceManagement />}
          {activeTab === 'payment' && <PaymentSettingsManagement />}
          {activeTab === 'admins' && <AdminManagement />}
        </div>
      </div>
    </AdminLayout>
  );
}
