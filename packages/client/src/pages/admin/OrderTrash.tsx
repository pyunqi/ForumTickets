import { useState, useEffect, useCallback } from 'react';
import { getTrashedOrders, restoreOrder, permanentDeleteOrder } from '../../api/admin';
import type { Order, PaginatedOrders } from '../../types';
import { getCurrencySymbol } from '../../utils/currency';

interface Props {
  onBack: () => void;
}

export function OrderTrash({ onBack }: Props) {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [restoringOrder, setRestoringOrder] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTrashedOrders({ page, pageSize, search: search || undefined });
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleRestore = async (orderNo: string) => {
    if (!confirm(`确认恢复订单 ${orderNo}？`)) return;
    setRestoringOrder(orderNo);
    try {
      await restoreOrder(orderNo);
      await loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : '恢复失败');
    } finally {
      setRestoringOrder(null);
    }
  };

  const handlePermanentDelete = async (orderNo: string) => {
    if (!confirm(`确认永久删除订单 ${orderNo}？此操作不可恢复！`)) return;
    setDeletingOrder(orderNo);
    try {
      await permanentDeleteOrder(orderNo);
      await loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingOrder(null);
    }
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: '待支付', className: 'bg-yellow-100 text-yellow-700' },
    paid: { label: '已支付', className: 'bg-green-100 text-green-700' },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            ← 返回订单列表
          </button>
          <h2 className="text-xl font-semibold text-gray-900">垃圾桶</h2>
          {data && (
            <span className="text-sm text-gray-500">共 {data.total} 条</span>
          )}
        </div>

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
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        垃圾桶中的订单已从订单列表中隐藏。可点击"恢复"将订单重新加入订单列表，或点击"永久删除"彻底清除数据。
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full divide-y divide-gray-200" style={{ minWidth: '900px' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">订单号</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '150px' }}>客户姓名</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '180px' }}>邮箱</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">票种</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">金额</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">原状态</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '160px' }}>删除时间</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '140px' }}>操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50 opacity-75">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-mono text-gray-500">
                      {order.order_no}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700" style={{ maxWidth: '200px' }}>
                      <div className="truncate" title={order.customer_name}>{order.customer_name}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500" style={{ maxWidth: '200px' }}>
                      <div className="truncate" title={order.customer_email}>{order.customer_email}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                      {order.ticket_name}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                      {getCurrencySymbol(order.currency ?? 'CNY')}{order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusMap[order.status]?.className || ''}`}>
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {order.deleted_at ? new Date(order.deleted_at).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(order.order_no)}
                          disabled={restoringOrder === order.order_no}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {restoringOrder === order.order_no ? '恢复中...' : '恢复'}
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(order.order_no)}
                          disabled={deletingOrder === order.order_no}
                          className="px-3 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingOrder === order.order_no ? '删除中...' : '永久删除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      垃圾桶为空
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-500">
                共 {data.total} 条，第 {data.page}/{data.totalPages} 页
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
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
