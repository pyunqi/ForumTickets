import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { createOrder } from '../api/orders';
import { getTickets } from '../api/tickets';
import { useEmbed } from '../context/EmbedContext';
import { useLanguage } from '../i18n';
import type { TicketType } from '../types';
import { getCurrencySymbol } from '../utils/currency';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTENDEES = 5;

interface Attendee {
  id: number;
  name: string;
  ticketTypeId: number;
}

export function OrderForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { routePrefix } = useEmbed();
  const { t } = useLanguage();
  const selectedTicket = location.state?.ticket as TicketType | undefined;

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: 1, name: '', ticketTypeId: selectedTicket?.id || 0 }
  ]);
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
        setAttendees(prev => prev.map(a =>
          a.ticketTypeId === 0 ? { ...a, ticketTypeId: data[0].id } : a
        ));
      }
    }
    loadTickets();
  }, [selectedTicket]);

  const getTicketById = (id: number) => tickets.find(t => t.id === id);

  const totalAmount = attendees.reduce((sum, a) => {
    const ticket = getTicketById(a.ticketTypeId);
    return sum + (ticket?.price || 0);
  }, 0);

  const addAttendee = () => {
    if (attendees.length >= MAX_ATTENDEES) return;
    const defaultTicketId = selectedTicket?.id || tickets[0]?.id || 0;
    setAttendees([...attendees, { id: nextId, name: '', ticketTypeId: defaultTicketId }]);
    setNextId(nextId + 1);
  };

  const removeAttendee = (id: number) => {
    if (attendees.length <= 1) return;
    setAttendees(attendees.filter((a) => a.id !== id));
  };

  const updateAttendee = (id: number, field: 'name' | 'ticketTypeId', value: string | number) => {
    setAttendees(attendees.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Check all attendee names and ticket types
    for (let i = 0; i < attendees.length; i++) {
      if (!attendees[i].name.trim()) {
        newErrors.attendees = t.orderForm.nameRequired.replace('{index}', String(i + 1));
        break;
      }
      if (!attendees[i].ticketTypeId) {
        newErrors.attendees = t.orderForm.typeRequired.replace('{index}', String(i + 1));
        break;
      }
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = t.orderForm.emailRequired;
    } else if (!EMAIL_REGEX.test(customerEmail)) {
      newErrors.customerEmail = t.orderForm.emailInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        customerEmail,
        customerPhone,
        attendees: attendees.map((a) => ({
          name: a.name.trim(),
          ticketTypeId: a.ticketTypeId,
        })),
      });
      navigate(`${routePrefix}/payment/${order.order_no}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : t.orderForm.submitFailed });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1a365d] mb-2">{t.orderForm.title}</h1>
          <p className="text-gray-600">{t.orderForm.maxAttendeesHint.replace('{max}', String(MAX_ATTENDEES))}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendees Section */}
          <div className="bg-white rounded shadow-md p-6 border-t-4 border-[#1a365d]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-serif font-medium text-[#1a365d]">{t.orderForm.attendeeInfo}</h2>
                <p className="text-sm text-gray-500">{t.orderForm.addedCount.replace('{count}', String(attendees.length)).replace('{max}', String(MAX_ATTENDEES))}</p>
              </div>
              {attendees.length < MAX_ATTENDEES && (
                <button
                  type="button"
                  onClick={addAttendee}
                  className="px-4 py-2 bg-[#1a365d] text-white text-sm font-medium rounded hover:bg-[#234876] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t.form.addAttendee}
                </button>
              )}
            </div>

            {errors.attendees && (
              <p className="mb-4 text-sm text-[#7b2c3a]">{errors.attendees}</p>
            )}

            <div className="space-y-4">
              {attendees.map((attendee, index) => {
                const ticket = getTicketById(attendee.ticketTypeId);
                return (
                  <div
                    key={attendee.id}
                    className="p-4 bg-[#faf8f5] rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[#1a365d]">
                        {t.orderForm.attendeeIndex.replace('{index}', String(index + 1))}
                      </span>
                      {attendees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttendee(attendee.id)}
                          className="text-[#7b2c3a] hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t.form.remove}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.form.name}</label>
                        <input
                          type="text"
                          value={attendee.name}
                          onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1a365d] focus:border-transparent text-sm"
                          placeholder={t.form.namePlaceholder}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.form.registrationType}</label>
                        <select
                          value={attendee.ticketTypeId}
                          onChange={(e) => updateAttendee(attendee.id, 'ticketTypeId', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1a365d] focus:border-transparent text-sm"
                        >
                          {tickets.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} - {getCurrencySymbol(t.currency)}{t.price.toFixed(0)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {ticket && (
                      <div className="mt-2 text-right">
                        <span className="text-sm text-gray-500">{t.form.registrationFee}:</span>
                        <span className="text-sm font-medium text-[#7b2c3a] ml-1">{getCurrencySymbol(ticket.currency)}{ticket.price.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded shadow-md p-6 border-t-4 border-[#1a365d]">
            <h2 className="text-lg font-serif font-medium text-[#1a365d] mb-4">{t.orderForm.contactInfo}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.email} <span className="text-[#7b2c3a]">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                placeholder={t.form.emailPlaceholder}
              />
              {errors.customerEmail && (
                <p className="mt-1 text-sm text-[#7b2c3a]">{errors.customerEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.phone} <span className="text-gray-400">({t.form.optional})</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                placeholder={t.form.phonePlaceholder}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded shadow-md p-6 border-t-4 border-[#c9a227]">
            <h2 className="text-lg font-serif font-medium text-[#1a365d] mb-4">{t.orderForm.feeSummary}</h2>

            <div className="space-y-2 text-sm mb-4">
              {attendees.map((attendee, index) => {
                const ticket = getTicketById(attendee.ticketTypeId);
                return (
                  <div key={attendee.id} className="flex justify-between text-gray-600">
                    <span>{attendee.name || `${t.orderForm.attendeeIndex.replace('{index}', String(index + 1))}`} - {ticket?.name}</span>
                    <span>{getCurrencySymbol(ticket?.currency)}{ticket?.price.toFixed(0)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-[#1a365d] font-medium">{t.orderForm.totalFee.replace('{count}', String(attendees.length))}</span>
                <span className="text-2xl font-serif font-bold text-[#7b2c3a]">
                  {getCurrencySymbol(getTicketById(attendees[0]?.ticketTypeId)?.currency)}{totalAmount.toFixed(0)}
                </span>
              </div>
            </div>

            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-[#7b2c3a]">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#1a365d] text-white font-medium rounded hover:bg-[#234876] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t.orderForm.submitting : t.form.submit}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
