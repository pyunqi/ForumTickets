import { useState, useEffect, useCallback } from 'react';
import { getOrders, getExportUrl } from '../../api/admin';
import type { Order, PaginatedOrders } from '../../types';

export function OrderManagement() {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrders({ page, status: status || undefined, search: search || undefined });
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleExport = () => {
    const url = getExportUrl(status || undefined);
    window.open(url, '_blank');
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: '待支付', className: 'bg-yellow-100 text-yellow-700' },
    paid: { label: '已支付', className: 'bg-green-100 text-green-700' },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">订单列表</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索订单号/姓名/邮箱"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              搜索
            </button>
          </form>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部状态</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
            <option value="cancelled">已取消</option>
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            导出CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户姓名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">票种</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.orders.map((order: Order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order.order_no}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer_email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.ticket_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusMap[order.status]?.className || ''}`}>
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
                {data?.orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      暂无订单数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                共 {data.total} 条记录，第 {data.page}/{data.totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
