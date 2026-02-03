import type { TicketType } from '../types';

interface TicketCardProps {
  ticket: TicketType;
  onSelect: (ticket: TicketType) => void;
}

export function TicketCard({ ticket, onSelect }: TicketCardProps) {
  const remainingCount = ticket.quota === -1 ? -1 : ticket.quota - ticket.sold_count;
  const isSoldOut = ticket.quota !== -1 && remainingCount <= 0;
  const remaining = ticket.quota === -1 ? '不限' : remainingCount;

  return (
    <div className={`bg-white rounded shadow-md border-t-4 transition-all ${
      isSoldOut
        ? 'border-gray-300 opacity-60'
        : 'border-[#1a365d] hover:shadow-xl hover:-translate-y-1'
    }`}>
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-[#1a365d] mb-2">{ticket.name}</h3>
        <p className="text-gray-600 mb-6 min-h-[48px] text-sm leading-relaxed">{ticket.description}</p>
        <div className="flex justify-between items-baseline mb-6">
          <div>
            <span className="text-3xl font-serif font-bold text-[#7b2c3a]">
              ¥{ticket.price.toFixed(0)}
            </span>
            <span className="text-gray-400 text-sm ml-1">/人</span>
          </div>
          <span className={`text-sm ${isSoldOut ? 'text-red-500' : 'text-gray-500'}`}>
            {isSoldOut ? '名额已满' : `剩余名额: ${remaining}`}
          </span>
        </div>
        <button
          onClick={() => onSelect(ticket)}
          disabled={isSoldOut}
          className={`w-full py-3 px-4 rounded font-medium transition-colors ${
            isSoldOut
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#1a365d] text-white hover:bg-[#234876]'
          }`}
        >
          {isSoldOut ? '名额已满' : '立即报名'}
        </button>
      </div>
    </div>
  );
}
