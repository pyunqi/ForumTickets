import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { createOrder } from '../api/orders';
import { getTickets } from '../api/tickets';
import type { TicketType } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OrderForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTicket = location.state?.ticket as TicketType | undefined;

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    ticketTypeId: selectedTicket?.id || 0,
    quantity: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      const data = await getTickets();
      setTickets(data);
      if (!selectedTicket && data.length > 0) {
        setFormData((prev) => ({ ...prev, ticketTypeId: data[0].id }));
      }
    }
    loadTickets();
  }, [selectedTicket]);

  const currentTicket = tickets.find((t) => t.id === formData.ticketTypeId);
  const totalAmount = currentTicket ? currentTicket.price * formData.quantity : 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = '请填写姓名';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = '请填写邮箱';
    } else if (!EMAIL_REGEX.test(formData.customerEmail)) {
      newErrors.customerEmail = '请填写有效的邮箱地址';
    }

    if (!formData.ticketTypeId) {
      newErrors.ticketTypeId = '请选择票种';
    }

    if (formData.quantity < 1 || formData.quantity > 10) {
      newErrors.quantity = '购票数量应在1-10之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      const order = await createOrder(formData);
      navigate(`/payment/${order.order_no}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : '提交失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">订票信息</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              票种 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ticketTypeId}
              onChange={(e) => setFormData({ ...formData, ticketTypeId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.name} - ¥{ticket.price.toFixed(2)}
                </option>
              ))}
            </select>
            {errors.ticketTypeId && (
              <p className="mt-1 text-sm text-red-600">{errors.ticketTypeId}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的姓名"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的邮箱"
            />
            {errors.customerEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系电话 <span className="text-gray-400">(选填)</span>
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的联系电话"
            />
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-700">总计</span>
              <span className="text-2xl font-bold text-blue-600">
                ¥{totalAmount.toFixed(2)}
              </span>
            </div>

            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '提交中...' : '提交订单'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
