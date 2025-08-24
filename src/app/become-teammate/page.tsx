'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Star, Users, Clock, CheckCircle } from 'lucide-react';

export default function BecomeTeammatePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    game: '',
    rank: '',
    role: '',
    experience: '',
    availability: '',
    whyJoin: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users/become-teammate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch {
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="page-container pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Login Required</h3>
            <p className="text-gray-500">You must be logged in to apply as a mentor.</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page-container pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Application Submitted!</h3>
            <p className="text-gray-500 mb-6">
              Thank you for your interest in becoming a mentor. We&apos;ll review your application and get back to you within 24-48 hours.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="primary-button"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="page-title md:text-5xl">
            Become a Mentor
          </h1>
          <p className="text-primary/80 max-w-2xl mx-auto text-lg">
            Join our elite team of professional gamers and earn money doing what you love
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits */}
          <div className="lg:col-span-1">
            <div className="card-container p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-primary mb-6">Why Join?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Earn Money</h3>
                    <p className="text-gray-400 text-sm">
                      Make $10-30 per hour playing your favorite games
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-[#6b8ab0]/20 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-[#6b8ab0]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Flexible Schedule</h3>
                    <p className="text-gray-400 text-sm">
                      Work when you want, as much or as little as you prefer
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-[#8a675e]/20 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-[#8a675e]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Verified Badge</h3>
                    <p className="text-gray-400 text-sm">
                      Get a verified badge and build your reputation
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Quick Payments</h3>
                    <p className="text-gray-400 text-sm">
                      Get paid weekly via PayPal or bank transfer
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#2a2a2a] rounded-lg">
                <h4 className="font-semibold text-white mb-2">Requirements:</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Top 10% rank in your game</li>
                  <li>• Good communication skills</li>
                  <li>• Reliable internet connection</li>
                  <li>• Professional attitude</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
              <h2 className="text-2xl font-bold text-[#e6915b] mb-6">Application Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#e6915b] text-sm font-medium mb-2">
                      Primary Game *
                    </label>
                    <select
                      value={formData.game}
                      onChange={(e) => handleInputChange('game', e.target.value)}
                      required
                      className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e6915b]"
                    >
                      <option value="">Select a game</option>
                      <option value="valorant">Valorant</option>
                      <option value="league">League of Legends</option>
                      <option value="csgo">CS:GO 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#e6915b] text-sm font-medium mb-2">
                      Current Rank *
                    </label>
                    <input
                      type="text"
                      value={formData.rank}
                      onChange={(e) => handleInputChange('rank', e.target.value)}
                      required
                      placeholder="e.g., Diamond, Immortal, Master"
                      className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e6915b]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#e6915b] text-sm font-medium mb-2">
                      Preferred Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                      className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e6915b]"
                    >
                      <option value="">Select a role</option>
                      <option value="Duelist">Duelist</option>
                      <option value="Controller">Controller</option>
                      <option value="Initiator">Initiator</option>
                      <option value="Sentinel">Sentinel</option>
                      <option value="Jungle">Jungle</option>
                      <option value="Top">Top</option>
                      <option value="Mid">Mid</option>
                      <option value="ADC">ADC</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#e6915b] text-sm font-medium mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      required
                      placeholder="e.g., 3 years"
                      className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e6915b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#e6915b] text-sm font-medium mb-2">
                    Availability (hours per week) *
                  </label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    required
                    placeholder="e.g., 20-30 hours per week"
                    className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e6915b]"
                  />
                </div>

                <div>
                  <label className="block text-[#e6915b] text-sm font-medium mb-2">
                    Why do you want to join? *
                  </label>
                  <textarea
                    value={formData.whyJoin}
                    onChange={(e) => handleInputChange('whyJoin', e.target.value)}
                    required
                    rows={4}
                    placeholder="Tell us about your motivation, goals, and what makes you a great mentor..."
                    className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e6915b] resize-none"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#e6915b] hover:bg-[#d8824a] text-white px-8"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4 mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Submit Application
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="border-[#6b8ab0] text-[#6b8ab0] hover:bg-[#6b8ab0]/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 