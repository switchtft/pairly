'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  sessionId: number;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // WebSocket connection
  const { isConnected, sendChatMessage, joinSession } = useSocket();

  // Join the session room when component mounts
  useEffect(() => {
    if (isConnected && sessionId) {
      joinSession(sessionId);
    }
  }, [isConnected, sessionId, joinSession]);

  // Listen for real-time chat messages
  useSocketEvent('chat:message', (data) => {
    if (data.sessionId === sessionId) {
      setMessages(prev => [...prev, data.message]);
    }
  });

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chat?sessionId=${sessionId}`);
        if (!response.ok) throw new Error('Failed to load messages');
        
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;

    try {
      // Send message via WebSocket
      sendChatMessage(sessionId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e6915b] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-[#e6915b]/60">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[#e6915b]/60 py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === 1
                    ? 'bg-[#e6915b] text-[#1a1a1a]'
                    : 'bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.senderName}
                </div>
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.senderId === 1 
                    ? 'text-[#1a1a1a]/70' 
                    : 'text-[#e6915b]/60'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-lg mx-4 mb-4">
          <p className="text-red-400 text-sm text-center">
            Connection lost. Messages may not be sent.
          </p>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e6915b]/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] border border-[#e6915b]/30 rounded-lg text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] px-4"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
} 