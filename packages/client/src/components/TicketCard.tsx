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
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
      isSoldOut ? 'border-gray-200 opacity-60' : 'border-transparent hover:border-blue-500 hover:shadow-lg'
    }`}>
      <h3 className="text-xl font-semibold mb-2">{ticket.name}</h3>
      <p className="text-gray-600 mb-4 min-h-[48px]">{ticket.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-blue-600">
          ¥{ticket.price.toFixed(2)}
        </span>
        <span className={`text-sm ${isSoldOut ? 'text-red-500' : 'text-gray-500'}`}>
          {isSoldOut ? '已售罄' : `剩余: ${remaining}`}
        </span>
      </div>
      <button
        onClick={() => onSelect(ticket)}
        disabled={isSoldOut}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isSoldOut
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSoldOut ? '已售罄' : '立即购买'}
      </button>
    </div>
  );
}
