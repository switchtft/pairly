'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  MessageCircle, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Paperclip, 
  Image, 
  Video, 
  File, 
  Smile,
  Volume2,
  VolumeX,
  Users,
  Crown,
  Shield,
  Zap,
  Target,
  Trophy
} from 'lucide-react';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
  type: 'text' | 'file' | 'image' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions?: { [key: string]: number };
}

interface EnhancedChatInterfaceProps {
  sessionId: number;
  teammate?: {
    id: number;
    username: string;
    rank: string;
    isOnline: boolean;
  };
}

// Gaming-themed emojis
const GAMING_EMOJIS = [
  { emoji: '🎮', name: 'game' },
  { emoji: '🏆', name: 'trophy' },
  { emoji: '⚡', name: 'zap' },
  { emoji: '🎯', name: 'target' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '💪', name: 'muscle' },
  { emoji: '👑', name: 'crown' },
  { emoji: '🛡️', name: 'shield' },
  { emoji: '⚔️', name: 'sword' },
  { emoji: '🎲', name: 'dice' },
  { emoji: '🚀', name: 'rocket' },
  { emoji: '💎', name: 'diamond' },
];

export default function EnhancedChatInterface({ sessionId, teammate }: EnhancedChatInterfaceProps) {
  const { user } = useAuth();
  const { isConnected, sendChatMessage, joinSession } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceParticipants, setVoiceParticipants] = useState<string[]>([]);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Listen for typing indicators
  useSocketEvent('chat:typing', (data) => {
    if (data.sessionId === sessionId && data.userId !== user?.id) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  });

  // Listen for voice chat events
  useSocketEvent('voice:join', (data) => {
    if (data.sessionId === sessionId) {
      setVoiceParticipants(prev => [...prev, data.username]);
    }
  });

  useSocketEvent('voice:leave', (data) => {
    if (data.sessionId === sessionId) {
      setVoiceParticipants(prev => prev.filter(name => name !== data.username));
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

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Emit typing event
    // This would be implemented in the socket hook
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator
    }, 1000);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;

    try {
      // Send message via WebSocket
      sendChatMessage(sessionId, newMessage.trim());
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported');
      return;
    }

    try {
      setFileUploadProgress(0);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId.toString());

      // Upload file
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const data = await response.json();
      
      // Send file message
      sendChatMessage(sessionId, `[File: ${file.name}](${data.fileUrl})`);
      setFileUploadProgress(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
      setFileUploadProgress(null);
    }
  };

  const handleVoiceChatToggle = () => {
    setIsVoiceChatActive(!isVoiceChatActive);
    // This would integrate with Discord voice or WebRTC
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const addReaction = (messageId: number, emoji: string) => {
    // This would send a reaction via WebSocket
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-4 h-4" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
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
      {/* Voice Chat Status */}
      {isVoiceChatActive && (
        <div className="px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg mx-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Voice Chat Active</span>
              <span className="text-green-400/60 text-xs">
                ({voiceParticipants.length} participants)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {voiceParticipants.map((participant, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs">{participant}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teammate Status */}
      {teammate && (
        <div className="px-4 py-2 bg-[#2a2a2a] rounded-lg mx-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${teammate.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-[#e6915b] font-medium">{teammate.username}</span>
              <span className="text-[#e6915b]/60 text-sm">{teammate.rank}</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-4 h-4 text-[#e6915b]" />
              <span className="text-[#e6915b] text-xs">Pro</span>
            </div>
          </div>
        </div>
      )}

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
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === user?.id
                    ? 'bg-[#e6915b] text-[#1a1a1a]'
                    : 'bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.senderName}
                </div>
                
                {/* Message Content */}
                {message.type === 'file' ? (
                  <div className="flex items-center gap-2 p-2 bg-[#1a1a1a]/20 rounded-lg">
                    {getFileIcon(message.fileName || '')}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{message.fileName}</p>
                      <p className="text-xs opacity-60">
                        {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)}MB` : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#e6915b] hover:bg-[#e6915b]/10"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm">{message.content}</div>
                )}

                {/* Message Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {Object.entries(message.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(message.id, emoji)}
                        className="px-2 py-1 bg-[#1a1a1a]/20 rounded-full text-xs hover:bg-[#1a1a1a]/40 transition-colors"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-xs mt-1 ${
                  message.senderId === user?.id 
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
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-1">
                <span className="text-sm">Typing</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-[#e6915b] rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-[#e6915b] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-[#e6915b] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
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

      {/* File Upload Progress */}
      {fileUploadProgress !== null && (
        <div className="px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg mx-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-400 text-sm">Uploading file...</span>
            <span className="text-blue-400 text-sm">{fileUploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-500/20 rounded-full h-1 mt-1">
            <div 
              className="bg-blue-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${fileUploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Voice Chat Controls */}
      <div className="px-4 py-2 border-t border-[#e6915b]/20">
        <div className="flex items-center gap-2 mb-2">
          <Button
            onClick={handleVoiceChatToggle}
            variant={isVoiceChatActive ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-1 ${
              isVoiceChatActive 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10'
            }`}
          >
            {isVoiceChatActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            {isVoiceChatActive ? 'Leave Voice' : 'Join Voice'}
          </Button>
          
          {isVoiceChatActive && (
            <Button
              onClick={handleMuteToggle}
              variant={isMuted ? "destructive" : "outline"}
              size="sm"
              className="flex items-center gap-1"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          )}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e6915b]/20">
        <div className="flex gap-2">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Emoji Picker Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
          >
            <Smile className="w-4 h-4" />
          </Button>

          {/* Message Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] border border-[#e6915b]/30 rounded-lg text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none disabled:opacity-50"
          />

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] px-4"
          >
            <Send size={16} />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mt-2 p-2 bg-[#2a2a2a] rounded-lg border border-[#e6915b]/30">
            <div className="grid grid-cols-6 gap-1">
              {GAMING_EMOJIS.map((emojiData) => (
                <button
                  key={emojiData.name}
                  type="button"
                  onClick={() => {
                    setNewMessage(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-lg"
                >
                  {emojiData.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept="image/*,video/*,.pdf"
          className="hidden"
        />
      </form>
    </div>
  );
} 