import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets } from '../../api/tickets';
import { TicketCard } from '../../components/TicketCard';
import type { TicketType } from '../../types';

export function EmbedTickets() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const handleSelect = (ticket: TicketType) => {
    navigate('/embed/order', { state: { ticket } });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1a365d] mb-2">参会注册</h1>
          <p className="text-gray-600">请选择注册类型</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
