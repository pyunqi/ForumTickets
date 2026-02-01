import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getOrder, payOrder } from '../api/orders';
import type { Order } from '../types';

export function Payment() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('alipay');

  useEffect(() => {
    async function loadOrder() {
      if (!orderNo) return;
      try {
        const data = await getOrder(orderNo);
        if (data.status === 'paid') {
          navigate(`/order/success/${orderNo}`);
          return;
        }
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载订单失败');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNo, navigate]);

  const handlePay = async () => {
    if (!orderNo) return;
    setPaying(true);
    try {
      await payOrder(orderNo);
      navigate(`/order/success/${orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '支付失败');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          订单支付
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">订单信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">订单号</span>
              <span className="font-mono">{order.order_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">票种</span>
              <span>{order.ticket_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">数量</span>
              <span>{order.quantity} 张</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-900 font-medium">应付金额</span>
              <span className="text-xl font-bold text-blue-600">
                ¥{order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">选择支付方式</h2>
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="alipay"
                checked={paymentMethod === 'alipay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 font-medium">支付宝</span>
            </label>
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="wechat"
                checked={paymentMethod === 'wechat'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 font-medium">微信支付</span>
            </label>
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 font-medium">银行转账</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'transfer' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-amber-800 mb-4">银行转账信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">收款银行</span>
                <span className="font-medium text-gray-900">中国工商银行</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">账户名称</span>
                <span className="font-medium text-gray-900">Forum科技有限公司</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">银行账号</span>
                <span className="font-mono font-medium text-gray-900">6222 0000 1234 5678 901</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">转账金额</span>
                <span className="font-bold text-blue-600">¥{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">转账备注</span>
                <span className="font-mono font-medium text-gray-900">{order.order_no}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-amber-600">
              请在转账时备注订单号，转账后工作人员将在 1-2 个工作日内确认并发送电子票
            </p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-4 px-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {paying ? '支付中...' : paymentMethod === 'transfer' ? '我已完成转账' : `确认支付 ¥${order.total_amount.toFixed(2)}`}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          {paymentMethod === 'transfer'
            ? '点击按钮确认已转账，工作人员将核实后处理'
            : '这是模拟支付，点击按钮即可完成支付'}
        </p>
      </div>
    </Layout>
  );
}
