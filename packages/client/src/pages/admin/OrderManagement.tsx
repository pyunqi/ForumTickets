import { useState, useEffect, useCallback } from 'react';
import { getOrders, getExportUrl, confirmPayment, verifyTransferPayment } from '../../api/admin';
import type { Order, PaginatedOrders } from '../../types';

export function OrderManagement() {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmingOrder, setConfirmingOrder] = useState<string | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [bankLast4, setBankLast4] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);

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

  const handleConfirmPayment = async (orderNo: string) => {
    if (!confirm('确认该订单已付款？确认后将发送确认邮件给客户。')) return;

    setConfirmingOrder(orderNo);
    try {
      await confirmPayment(orderNo);
      await loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setConfirmingOrder(null);
    }
  };

  const handleOpenVerifyModal = (order: Order) => {
    setVerifyingOrder(order);
    setBankLast4('');
  };

  const handleCloseVerifyModal = () => {
    setVerifyingOrder(null);
    setBankLast4('');
  };

  const handleVerifyTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder) return;

    if (!/^\d{4}$/.test(bankLast4)) {
      alert('请输入正确的4位数字');
      return;
    }

    setVerifySubmitting(true);
    try {
      await verifyTransferPayment(verifyingOrder.order_no, bankLast4);
      await loadOrders();
      handleCloseVerifyModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setVerifySubmitting(false);
    }
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: '待支付', className: 'bg-yellow-100 text-yellow-700' },
    paid: { label: '已支付', className: 'bg-green-100 text-green-700' },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
  };

  return (
    <div>
      {/* Verify Transfer Modal */}
      {verifyingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseVerifyModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">转账复核</h3>
            </div>
            <form onSubmit={handleVerifyTransfer} className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  <p><strong>订单号：</strong>{verifyingOrder.order_no}</p>
                  <p><strong>客户：</strong>{verifyingOrder.customer_name}</p>
                  <p><strong>金额：</strong>¥{verifyingOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  付款人银行账号后4位 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankLast4}
                  onChange={(e) => setBankLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="请输入4位数字"
                  maxLength={4}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  请核对转账记录，输入付款人银行卡号后4位以确认收款
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseVerifyModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={verifySubmitting || bankLast4.length !== 4}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {verifySubmitting ? '确认中...' : '确认收款'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">订单号</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '150px' }}>客户姓名</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '180px' }}>邮箱</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">票种</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">数量</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">金额</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">状态</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '160px' }}>创建时间</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap" style={{ minWidth: '100px' }}>操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order.order_no}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900" style={{ maxWidth: '200px' }}>
                      <div className="truncate" title={order.customer_name}>
                        {order.customer_name}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500" style={{ maxWidth: '200px' }}>
                      <div className="truncate" title={order.customer_email}>
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.ticket_name}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      {order.quantity}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusMap[order.status]?.className || ''}`}>
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmPayment(order.order_no)}
                          disabled={confirmingOrder === order.order_no}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {confirmingOrder === order.order_no ? '确认中...' : '确认付款'}
                        </button>
                      )}
                      {order.status === 'paid' && !order.payer_bank_last4 && (
                        <button
                          onClick={() => handleOpenVerifyModal(order)}
                          className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                        >
                          转账复核
                        </button>
                      )}
                      {order.status === 'paid' && order.payer_bank_last4 && (
                        <span className="text-green-600 text-xs" title={`已复核 (尾号${order.payer_bank_last4})`}>
                          已复核 ✓
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="text-gray-400 text-xs">已取消</span>
                      )}
                    </td>
                  </tr>
                ))}
                {data?.orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
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
