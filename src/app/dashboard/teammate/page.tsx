'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, User, CheckCircle, XCircle, MessageCircle, Play } from 'lucide-react';

interface QueueRequest {
  id: number;
  game: string;
  mode: string;
  duration: number;
  price: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    rank: string;
    role: string;
  };
}

interface Session {
  id: number;
  game: string;
  mode: string;
  status: string;
  startTime: string;
  price: number;
  duration: number;
  client: {
    username: string;
    rank: string;
  };
}

export default function TeammateDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<QueueRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only customers are restricted from accessing the teammate dashboard
    if (user && user.role === 'customer') {
      router.push('/profile');
      return;
    }

    // Administrators and teammates can access the teammate dashboard
    if (user && (user.role === 'teammate' || user.role === 'administrator')) {
      fetchData();
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Fetch pending requests and active sessions
  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch pending requests
      const requestsResponse = await fetch('/api/teammates/notifications', {
        credentials: 'include'
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setPendingRequests(requestsData.pendingRequests);
      }

      // Fetch active sessions
      const sessionsResponse = await fetch('/api/sessions/teammate', {
        credentials: 'include'
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setActiveSessions(sessionsData.sessions);
      }

    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Accept a queue request
  const acceptRequest = async (queueEntryId: number) => {
    try {
      const response = await fetch('/api/teammates/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ queueEntryId })
      });

      if (response.ok) {
        const data = await response.json();
        // Remove from pending requests and add to active sessions
        setPendingRequests(prev => prev.filter(req => req.id !== queueEntryId));
        setActiveSessions(prev => [...prev, data.session]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to accept request');
      }
    } catch (error) {
      setError('Failed to accept request');
      console.error('Error accepting request:', error);
    }
  };

  // Poll for new requests
  useEffect(() => {
    if (user?.isPro) {
      fetchData();
      
      // Poll every 5 seconds for new requests
      const interval = setInterval(fetchData, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchData]);

  if (!user?.isPro) {
    return (
      <div className="bg-[#0f0f0f] min-h-screen pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Access Denied</h3>
            <p className="text-gray-500">You must be a verified mentor to access this dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#0f0f0f] min-h-screen pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full border-2 border-[#e6915b] border-t-transparent h-8 w-8 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-gray-400">
            Manage incoming requests and active sessions
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
            <div className="p-6 bg-[#2a2a2a] border-b border-[#333]">
              <h2 className="text-xl font-bold flex items-center">
                <Clock className="mr-2 h-5 w-5 text-[#e6915b]" />
                Pending Requests
                <span className="ml-2 bg-[#e6915b] text-black text-sm px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              </h2>
            </div>
            
            <div className="p-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-400">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="bg-[#1f1f1f] rounded-lg border border-[#333] p-4 hover:border-[#e6915b] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-[#e6915b]">{request.user.username}</h3>
                          <p className="text-sm text-gray-400">
                            {request.user.rank} • {request.user.role}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${request.price}</p>
                          <p className="text-sm text-gray-400">{request.duration} min</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-[#6b8ab0]/20 text-[#6b8ab0] px-2 py-1 rounded">
                            {request.game}
                          </span>
                          <span className="bg-[#8a675e]/20 text-[#8a675e] px-2 py-1 rounded">
                            {request.mode}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => acceptRequest(request.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
            <div className="p-6 bg-[#2a2a2a] border-b border-[#333]">
              <h2 className="text-xl font-bold flex items-center">
                <Play className="mr-2 h-5 w-5 text-[#e6915b]" />
                Active Sessions
                <span className="ml-2 bg-[#e6915b] text-black text-sm px-2 py-1 rounded-full">
                  {activeSessions.length}
                </span>
              </h2>
            </div>
            
            <div className="p-6">
              {activeSessions.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-400">No active sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="bg-[#1f1f1f] rounded-lg border border-[#333] p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-[#e6915b]">{session.client.username}</h3>
                          <p className="text-sm text-gray-400">{session.client.rank}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${session.price}</p>
                          <p className="text-sm text-gray-400">{session.duration} min</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-[#6b8ab0]/20 text-[#6b8ab0] px-2 py-1 rounded">
                            {session.game}
                          </span>
                          <span className="bg-[#8a675e]/20 text-[#8a675e] px-2 py-1 rounded">
                            {session.mode}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            session.status === 'Active' 
                              ? 'bg-green-900/20 text-green-400' 
                              : 'bg-yellow-900/20 text-yellow-400'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1 bg-[#e6915b] hover:bg-[#d8824a] text-white"
                          onClick={() => window.open(`/chat/${session.id}`, '_blank')}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Open Chat
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-[#6b8ab0] text-[#6b8ab0] hover:bg-[#6b8ab0]/10"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 