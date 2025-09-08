'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, BarChart3 } from 'lucide-react';
import { TrackingLink, CreateLinkResponse } from '@/types';

export default function HomePage() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<TrackingLink | null>(null);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your tracking link');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data: CreateLinkResponse = await response.json();

      if (data.success && data.link) {
        setGeneratedLink(data.link);
        setTitle('');
        toast.success('Tracking link created successfully!');
      } else {
        toast.error(data.error || 'Failed to create tracking link');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Error creating link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Error copying to clipboard:', error);
    }
  };

  const getTrackingUrl = (linkId: string) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/track/${linkId}`;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Create Trackable Links
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Generate unique tracking links and monitor visitor locations in real-time with interactive maps and detailed analytics.
          </p>
        </div>

        {/* Link Creation Form */}
        <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Generate New Tracking Link</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Create a custom link that will track visitor locations when opened
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Link Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Marketing Campaign, Product Launch, Survey Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || !title.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {loading ? 'Creating Link...' : 'Generate Tracking Link'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Link Display */}
        {generatedLink && (
          <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-green-400">Link Created Successfully!</CardTitle>
              <CardDescription className="text-gray-400">
                Your tracking link is ready. Share it to start collecting location data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Link Title</Label>
                <p className="text-lg font-semibold text-purple-300">{generatedLink.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Tracking URL</Label>
                <div className="flex items-center space-x-2 p-3 bg-black/30 rounded-lg border border-white/10">
                  <code className="flex-1 text-sm text-gray-300 break-all">
                    {getTrackingUrl(generatedLink.id)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(getTrackingUrl(generatedLink.id))}
                    className="shrink-0 border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => window.open(getTrackingUrl(generatedLink.id), '_blank')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Link
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-purple-300">Precise Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Capture exact GPS coordinates with high accuracy using browser geolocation API.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-pink-300">Interactive Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Visualize all tracked locations on interactive maps with detailed information popups.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-300">Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Full control over your data with options to delete individual locations or entire link records.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}