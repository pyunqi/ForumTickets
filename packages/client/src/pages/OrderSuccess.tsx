import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getOrder } from '../api/orders';
import type { Order } from '../types';

export function OrderSuccess() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNo) return;
      try {
        const data = await getOrder(orderNo);
        setOrder(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNo]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          支付成功
        </h1>

        <p className="text-gray-600 mb-8">
          您的订单已支付成功，电子票将发送至您的邮箱
        </p>

        {order && (
          <div className="bg-white rounded-lg shadow-md p-6 text-left mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单详情</h2>
            <div className="space-y-3 text-sm">
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
              <div className="flex justify-between">
                <span className="text-gray-600">姓名</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">邮箱</span>
                <span>{order.customer_email}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-900 font-medium">支付金额</span>
                <span className="font-bold text-green-600">
                  ¥{order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </Layout>
  );
}
