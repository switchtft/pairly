'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  DollarSign,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';

interface QueueRequest {
  id: number;
  user: {
    id: number;
    username: string;
    rank: string;
  };
  game: string;
  gameMode: string;
  numberOfMatches: number;
  teammatesNeeded: number;
  pricePerMatch: number;
  totalPrice: number;
  specialRequests?: string;
  createdAt: string;
}

interface Session {
  id: number;
  client: {
    id: number;
    username: string;
    rank: string;
  };
  game: string;
  mode: string;
  status: string;
  startTime: string;
  price: number;
  duration: number;
}

export default function TeammateDashboard() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<QueueRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // WebSocket connection
  const { isConnected, updateTeammateStatus } = useSocket();

  // Real-time notifications for new queue requests
  useSocketEvent('queue:update', (data) => {
    // Refresh pending requests when queue updates
    fetchPendingRequests();
  });

  // Real-time match notifications
  useSocketEvent('match:found', (data) => {
    // Refresh active sessions when a match is found
    fetchActiveSessions();
  });

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/teammates/notifications');
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setPendingRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError('Failed to load pending requests');
    }
  }, []);

  // Fetch active sessions
  const fetchActiveSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions/teammate');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setActiveSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setError('Failed to load active sessions');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPendingRequests(), fetchActiveSessions()]);
      setLoading(false);
    };

    fetchData();
  }, [fetchPendingRequests, fetchActiveSessions]);

  // Update online status when it changes
  useEffect(() => {
    if (isConnected) {
      updateTeammateStatus(isOnline);
    }
  }, [isConnected, isOnline, updateTeammateStatus]);

  // Handle accepting a request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch('/api/teammates/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) throw new Error('Failed to accept request');

      const data = await response.json();
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Add to active sessions
      setActiveSessions(prev => [...prev, data.session]);
      
      alert('Request accepted! Session created successfully.');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  // Handle rejecting a request
  const handleRejectRequest = async (requestId: number) => {
    try {
      // Remove from pending requests (in a real app, you'd send this to the server)
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      alert('Request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  // Handle opening chat
  const handleOpenChat = (sessionId: number) => {
    setCurrentSessionId(sessionId);
    setShowChat(true);
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setShowChat(false);
    setCurrentSessionId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#e6915b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#e6915b]/60">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#e6915b] mb-2">
            Teammate Dashboard
          </h1>
          <p className="text-[#e6915b]/60">
            Manage your incoming requests and active sessions
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isConnected 
              ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
              : 'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}>
            <span className="text-sm font-medium">
              {isConnected ? 'Real-time Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Online Status Toggle */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setIsOnline(!isOnline)}
            variant={isOnline ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              isOnline 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'border-gray-600 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {isOnline ? <Bell size={16} /> : <BellOff size={16} />}
            {isOnline ? 'Online' : 'Offline'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#2a2a2a] border-[#e6915b]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#e6915b] text-lg">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-[#e6915b]" />
                <span className="text-2xl font-bold text-[#e6915b]">{pendingRequests.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-[#e6915b]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#e6915b] text-lg">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#e6915b]" />
                <span className="text-2xl font-bold text-[#e6915b]">{activeSessions.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-[#e6915b]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#e6915b] text-lg">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-[#e6915b]" />
                <span className="text-2xl font-bold text-[#e6915b]">
                  ${activeSessions.reduce((sum, session) => sum + session.price, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e6915b] mb-4">
            Pending Requests
          </h2>
          
          {pendingRequests.length === 0 ? (
            <Card className="bg-[#2a2a2a] border-[#e6915b]/20">
              <CardContent className="text-center py-8">
                <Users className="w-8 h-8 text-[#e6915b]/60 mx-auto mb-2" />
                <p className="text-[#e6915b]/60">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-[#2a2a2a] border-[#e6915b]/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#e6915b]">{request.user.username}</CardTitle>
                      <Badge className="bg-[#e6915b] text-[#1a1a1a]">{request.game}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Rank:</span>
                        <span className="text-[#e6915b]">{request.user.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Game Mode:</span>
                        <span className="text-[#e6915b]">{request.gameMode}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Matches:</span>
                        <span className="text-[#e6915b]">{request.numberOfMatches}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Price:</span>
                        <span className="text-[#e6915b] font-semibold">${request.totalPrice}</span>
                      </div>
                      {request.specialRequests && (
                        <div className="text-sm">
                          <span className="text-[#e6915b]/60">Special Requests:</span>
                          <p className="text-[#e6915b] mt-1">{request.specialRequests}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e6915b] mb-4">
            Active Sessions
          </h2>
          
          {activeSessions.length === 0 ? (
            <Card className="bg-[#2a2a2a] border-[#e6915b]/20">
              <CardContent className="text-center py-8">
                <Clock className="w-8 h-8 text-[#e6915b]/60 mx-auto mb-2" />
                <p className="text-[#e6915b]/60">No active sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSessions.map((session) => (
                <Card key={session.id} className="bg-[#2a2a2a] border-[#e6915b]/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#e6915b]">{session.client.username}</CardTitle>
                      <Badge className={`${
                        session.status === 'Active' 
                          ? 'bg-green-600' 
                          : 'bg-yellow-600'
                      }`}>
                        {session.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Rank:</span>
                        <span className="text-[#e6915b]">{session.client.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Game:</span>
                        <span className="text-[#e6915b]">{session.game}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Mode:</span>
                        <span className="text-[#e6915b]">{session.mode}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Duration:</span>
                        <span className="text-[#e6915b]">{session.duration} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#e6915b]/60">Price:</span>
                        <span className="text-[#e6915b] font-semibold">${session.price}</span>
                      </div>
                      <Button
                        onClick={() => handleOpenChat(session.id)}
                        className="w-full bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && currentSessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#e6915b]/20">
              <h3 className="text-[#e6915b] font-semibold">Session Chat</h3>
              <Button
                onClick={handleCloseChat}
                variant="ghost"
                className="text-[#e6915b]/60 hover:text-[#e6915b]"
              >
                ×
              </Button>
            </div>
            <div className="flex-1 p-4">
              <EnhancedChatInterface 
                sessionId={currentSessionId} 
                teammate={{
                  id: user?.id || 0,
                  username: user?.username || "Teammate",
                  rank: "Pro",
                  isOnline: true
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 