// components/OnlineStatus.tsx
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface OnlineStatusProps {
  isOnline: boolean;
  onToggle: () => void;
}

const OnlineStatus = ({ isOnline, onToggle }: OnlineStatusProps) => (
  <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
    <h2 className="text-xl font-bold text-white mb-4">Online Status</h2>
    <div className="flex items-center gap-4">
      <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
      <span className="text-white">{isOnline ? 'Online' : 'Offline'}</span>
      <Button
        onClick={onToggle}
        className={`ml-auto ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isOnline ? <WifiOff size={16} className="mr-2" /> : <Wifi size={16} className="mr-2" />}
        {isOnline ? 'Go Offline' : 'Go Online'}
      </Button>
    </div>
    {!isOnline && (
      <p className="text-gray-400 text-sm mt-2">
        <AlertCircle size={14} className="inline mr-1" />
        You need to be online to receive orders
      </p>
    )}
  </div>
);

export default OnlineStatus;
