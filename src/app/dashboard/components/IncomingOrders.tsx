// components/IncomingOrders.tsx
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface IncomingOrder {
  id: number;
  clientName: string;
  clientAvatar?: string;
  game: string;
  mode: string;
  price: number;
  duration: number;
}

interface IncomingOrdersProps {
  orders: IncomingOrder[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  isOnline: boolean;
}

const IncomingOrders = ({ orders, onAccept, onReject, isOnline }: IncomingOrdersProps) => (
  <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white">Incoming Orders</h2>
      <Link href="/teammate-rules" className="text-[#e6915b] hover:text-[#d18251] text-sm">
        View Mentor Rules →
      </Link>
    </div>
    <div className="space-y-4">
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="p-4 bg-[#2a2a2a] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e6915b] rounded-full flex items-center justify-center">
                  {order.clientAvatar ? (
                    <img src={order.clientAvatar} alt={order.clientName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{order.clientName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{order.clientName}</p>
                  <p className="text-gray-400 text-sm">{order.game} - {order.mode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">${order.price.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">{order.duration}min</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button className="bg-green-500 hover:bg-green-600 flex-1" onClick={() => onAccept(order.id)}>
                <CheckCircle size={16} className="mr-2" />
                Accept
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 flex-1" onClick={() => onReject(order.id)}>
                <XCircle size={16} className="mr-2" />
                Decline
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Users className="mx-auto mb-4" size={48} />
          <p>No incoming orders</p>
          <p className="text-sm">
            {isOnline ? 'Orders will appear here when customers request your services' : 'Go online to start receiving orders'}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default IncomingOrders;
