'use client';

import { useState, useEffect } from 'react';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, MessageCircle, Users } from 'lucide-react';

export default function TestSocketPage() {
  const { isConnected, joinQueue, leaveQueue, sendChatMessage } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');

  // Listen for queue updates
  useSocketEvent('queue:update', (data) => {
    const message = `Queue Update: ${data.queueLength} in queue, ${data.availableTeammates} teammates available, ${data.estimatedWaitTime}min wait`;
    setMessages(prev => [...prev, message]);
  });

  // Listen for match found
  useSocketEvent('match:found', (data) => {
    const message = `Match Found! Session ${data.sessionId} with ${data.teammate.username}`;
    setMessages(prev => [...prev, message]);
  });

  // Listen for teammate status
  useSocketEvent('teammate:online', (data) => {
    const message = `Teammate Online: ${data.username} (${data.game})`;
    setMessages(prev => [...prev, message]);
  });

  useSocketEvent('teammate:offline', (data) => {
    const message = `Teammate Offline: ${data.username}`;
    setMessages(prev => [...prev, message]);
  });

  // Listen for chat messages
  useSocketEvent('chat:message', (data) => {
    const message = `Chat: ${data.message.senderName}: ${data.message.content}`;
    setMessages(prev => [...prev, message]);
  });

  const handleJoinQueue = () => {
    joinQueue('valorant', 'ranked');
    setMessages(prev => [...prev, 'Joined queue for Valorant Ranked']);
  };

  const handleLeaveQueue = () => {
    leaveQueue();
    setMessages(prev => [...prev, 'Left queue']);
  };

  const handleSendTestMessage = () => {
    if (testMessage.trim()) {
      sendChatMessage(1, testMessage); // Using session ID 1 for testing
      setMessages(prev => [...prev, `Sent: ${testMessage}`]);
      setTestMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-[#e6915b] mb-8 text-center">
          WebSocket Test Page
        </h1>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isConnected 
              ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
              : 'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20">
            <h3 className="text-[#e6915b] font-semibold mb-4">Queue Tests</h3>
            <div className="space-y-3">
              <Button
                onClick={handleJoinQueue}
                disabled={!isConnected}
                className="w-full bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Queue (Valorant Ranked)
              </Button>
              <Button
                onClick={handleLeaveQueue}
                disabled={!isConnected}
                variant="outline"
                className="w-full border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
              >
                Leave Queue
              </Button>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20">
            <h3 className="text-[#e6915b] font-semibold mb-4">Chat Tests</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Test message..."
                  className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#e6915b]/30 rounded-lg text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none"
                />
                <Button
                  onClick={handleSendTestMessage}
                  disabled={!isConnected || !testMessage.trim()}
                  className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Log */}
        <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20">
          <h3 className="text-[#e6915b] font-semibold mb-4">Event Log</h3>
          <div className="h-96 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-[#e6915b]/60 text-center py-8">
                No events yet. Try joining the queue or sending a message!
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className="p-3 bg-[#1a1a1a] rounded-lg border border-[#e6915b]/10"
                >
                  <span className="text-[#e6915b]/80 text-sm">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <p className="text-[#e6915b] mt-1">{message}</p>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-[#e6915b]/60 text-sm">
              {messages.length} events
            </span>
            <Button
              onClick={() => setMessages([])}
              variant="outline"
              size="sm"
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
            >
              Clear Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 