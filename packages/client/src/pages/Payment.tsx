import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getOrder, payOrder } from '../api/orders';
import { getEnabledPaymentMethods, PaymentMethod } from '../api/settings';
import type { Order } from '../types';

export function Payment() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!orderNo) return;
      try {
        const [orderData, methods] = await Promise.all([
          getOrder(orderNo),
          getEnabledPaymentMethods()
        ]);

        if (orderData.status === 'paid') {
          navigate(`/order/success/${orderNo}`);
          return;
        }
        setOrder(orderData);
        setPaymentMethods(methods);

        // Set default payment method (first one or transfer if available)
        const transferMethod = methods.find(m => m.id === 'transfer');
        setPaymentMethod(transferMethod ? 'transfer' : methods[0]?.id || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载订单失败');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderNo, navigate]);

  const handlePayClick = () => {
    if (paymentMethod === 'transfer') {
      setShowTransferConfirm(true);
    } else {
      handlePay();
    }
  };

  const handlePay = async () => {
    if (!orderNo) return;
    setShowTransferConfirm(false);
    setPaying(true);
    try {
      await payOrder(orderNo);
      navigate(`/order/success/${orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '支付失败');
      setPaying(false);
    }
  };

  const currentMethod = paymentMethods.find(m => m.id === paymentMethod);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-[#7b2c3a]">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1a365d] mb-2">
            缴纳注册费
          </h1>
          <p className="text-gray-600">请选择缴费方式完成注册</p>
        </div>

        <div className="bg-white rounded shadow-md p-6 mb-6 border-t-4 border-[#1a365d]">
          <h2 className="text-lg font-serif font-medium text-[#1a365d] mb-4">注册信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">注册编号</span>
              <span className="font-mono">{order.order_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">参会者</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">人数</span>
              <span>{order.quantity} 人</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-[#1a365d] font-medium">应缴金额</span>
              <span className="text-xl font-serif font-bold text-[#7b2c3a]">
                ¥{order.total_amount.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {paymentMethods.length > 0 && (
          <div className="bg-white rounded shadow-md p-6 mb-6 border-t-4 border-[#1a365d]">
            <h2 className="text-lg font-serif font-medium text-[#1a365d] mb-4">选择缴费方式</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center p-4 border rounded cursor-pointer hover:bg-[#faf8f5] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#1a365d]"
                  />
                  <span className="ml-3 font-medium text-[#1a365d]">{method.name}</span>
                  {method.id === 'transfer' && (
                    <span className="ml-2 text-xs text-gray-500">(推荐)</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {paymentMethod === 'transfer' && currentMethod?.bankInfo && (
          <div className="bg-[#faf8f5] border border-[#c9a227] rounded p-6 mb-6">
            <h3 className="text-lg font-serif font-medium text-[#1a365d] mb-4">银行转账信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">收款银行</span>
                <span className="font-medium text-[#1a365d]">{currentMethod.bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">账户名称</span>
                <span className="font-medium text-[#1a365d]">{currentMethod.bankInfo.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">银行账号</span>
                <span className="font-mono font-medium text-[#1a365d]">{currentMethod.bankInfo.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">转账金额</span>
                <span className="font-serif font-bold text-[#7b2c3a]">¥{order.total_amount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">转账备注</span>
                <span className="font-mono font-medium text-[#1a365d]">学术论坛+{order.order_no}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {currentMethod.bankInfo.note}，会务组将在 1-2 个工作日内确认并发送参会确认函
            </p>
          </div>
        )}

        <button
          onClick={handlePayClick}
          disabled={paying || !paymentMethod}
          className="w-full py-4 px-4 bg-[#1a365d] text-white text-lg font-medium rounded hover:bg-[#234876] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {paying ? '处理中...' : paymentMethod === 'transfer' ? '我已完成转账' : `确认支付 ¥${order.total_amount.toFixed(0)}`}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          {paymentMethod === 'transfer'
            ? '点击按钮确认已转账，会务组核实后将发送参会确认函'
            : '这是模拟支付环境，点击按钮即可完成支付'}
        </p>
      </div>

      {/* Transfer Confirmation Modal */}
      {showTransferConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTransferConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-serif font-bold text-[#1a365d] mb-4">
              确认转账信息
            </h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                请确认您已按照以下信息完成银行转账：
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• 转账金额：<span className="font-medium text-[#7b2c3a]">¥{order.total_amount.toFixed(0)}</span></li>
                <li>• 转账备注：<span className="font-mono">学术论坛+{order.order_no}</span></li>
              </ul>
              <div className="bg-[#fef3c7] border border-[#f59e0b] rounded p-3">
                <p className="text-sm text-[#92400e]">
                  <strong>温馨提示：</strong>如果会务组未能收到您的转账款项，我们将通过您预留的邮箱 ({order.customer_email}) 与您联系核实。请确保邮箱地址正确并注意查收邮件。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTransferConfirm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                返回修改
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 py-3 px-4 bg-[#1a365d] text-white rounded hover:bg-[#234876] disabled:bg-gray-400 transition-colors"
              >
                {paying ? '处理中...' : '确认已转账'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
