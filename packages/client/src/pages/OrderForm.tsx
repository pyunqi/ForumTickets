import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { createOrder } from '../api/orders';
import { getTickets } from '../api/tickets';
import type { TicketType } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTENDEES = 5;

interface Attendee {
  id: number;
  name: string;
}

export function OrderForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTicket = location.state?.ticket as TicketType | undefined;

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [ticketTypeId, setTicketTypeId] = useState(selectedTicket?.id || 0);
  const [attendees, setAttendees] = useState<Attendee[]>([{ id: 1, name: '' }]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    async function loadTickets() {
      const data = await getTickets();
      setTickets(data);
      if (!selectedTicket && data.length > 0) {
        setTicketTypeId(data[0].id);
      }
    }
    loadTickets();
  }, [selectedTicket]);

  const currentTicket = tickets.find((t) => t.id === ticketTypeId);
  const totalAmount = currentTicket ? currentTicket.price * attendees.length : 0;

  const addAttendee = () => {
    if (attendees.length >= MAX_ATTENDEES) return;
    setAttendees([...attendees, { id: nextId, name: '' }]);
    setNextId(nextId + 1);
  };

  const removeAttendee = (id: number) => {
    if (attendees.length <= 1) return;
    setAttendees(attendees.filter((a) => a.id !== id));
  };

  const updateAttendeeName = (id: number, name: string) => {
    setAttendees(attendees.map((a) => (a.id === id ? { ...a, name } : a)));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Check all attendee names
    const emptyAttendees = attendees.filter((a) => !a.name.trim());
    if (emptyAttendees.length > 0) {
      newErrors.attendees = '请填写所有参会人姓名';
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = '请填写邮箱';
    } else if (!EMAIL_REGEX.test(customerEmail)) {
      newErrors.customerEmail = '请填写有效的邮箱地址';
    }

    if (!ticketTypeId) {
      newErrors.ticketTypeId = '请选择票种';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Combine attendee names
      const customerName = attendees.map((a) => a.name.trim()).join('、');
      const order = await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        ticketTypeId,
        quantity: attendees.length,
      });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">订票信息</h1>
        <p className="text-gray-600 mb-8">一次最多可购买 {MAX_ATTENDEES} 张票</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              票种 <span className="text-red-500">*</span>
            </label>
            <select
              value={ticketTypeId}
              onChange={(e) => setTicketTypeId(parseInt(e.target.value))}
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

          {/* Attendees Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">参会人信息</h2>
                <p className="text-sm text-gray-500">已添加 {attendees.length} / {MAX_ATTENDEES} 人</p>
              </div>
              {attendees.length < MAX_ATTENDEES && (
                <button
                  type="button"
                  onClick={addAttendee}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  添加参会人
                </button>
              )}
            </div>

            {errors.attendees && (
              <p className="mb-4 text-sm text-red-600">{errors.attendees}</p>
            )}

            <div className="space-y-4">
              {attendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      参会人 {index + 1}
                    </span>
                    {attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(attendee.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        移除
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={attendee.name}
                    onChange={(e) => updateAttendeeName(attendee.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入参会人姓名"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">联系信息</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="用于接收电子票"
              />
              {errors.customerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话 <span className="text-gray-400">(选填)</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="方便活动方联系您"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单汇总</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">票种</span>
                <span>{currentTicket?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">单价</span>
                <span>¥{currentTicket?.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">数量</span>
                <span>{attendees.length} 张</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-900 font-medium">总计</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{totalAmount.toFixed(2)}
                </span>
              </div>
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
