'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MapPin, Shield, CheckCircle } from 'lucide-react';
import { getCurrentLocation } from '@/lib/geolocation';
import { TrackLocationResponse } from '@/types';

interface LinkInfo {
  id: string;
  title: string;
  is_active: boolean;
}

export default function TrackingPage() {
  const params = useParams();
  const linkId = params?.linkId as string;
  
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (linkId) {
      fetchLinkInfo();
    }
  }, [linkId]);

  const fetchLinkInfo = async () => {
    try {
      const response = await fetch(`/api/track/${linkId}`);
      const data = await response.json();

      if (data.success) {
        setLinkInfo(data.link);
      } else {
        setError(data.error || 'Invalid tracking link');
      }
    } catch (err) {
      setError('Failed to load tracking information');
      console.error('Error fetching link info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllowTracking = async () => {
    setTracking(true);
    setLocationError(null);

    try {
      // Get user's current location
      const location = await getCurrentLocation();

      // Send location data to the server
      const response = await fetch(`/api/track/${linkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }),
      });

      const data: TrackLocationResponse = await response.json();

      if (data.success) {
        setTracked(true);
      } else {
        setLocationError(data.error || 'Failed to record location');
      }
    } catch (err: any) {
      setLocationError(err.message || 'Failed to get your location');
      console.error('Location error:', err);
    } finally {
      setTracking(false);
    }
  };

  const handleDeclineTracking = () => {
    // Redirect to a general page or show a message
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading tracking information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-red-400">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tracked) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-green-400">Location Recorded</CardTitle>
            <CardDescription className="text-gray-400">
              Thank you! Your location has been successfully recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              You can now safely close this page or continue browsing.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Visit Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <MapPin className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <CardTitle className="text-2xl">{linkInfo?.title}</CardTitle>
          <CardDescription className="text-gray-400">
            This link requires location access to track your visit
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Privacy Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-blue-400">Privacy Notice</h4>
                <p className="text-sm text-gray-300">
                  This link will collect your current location coordinates for tracking purposes. 
                  Your location data will be securely stored and used only for analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {locationError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Location Error</h4>
                  <p className="text-sm text-gray-300 mt-1">{locationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAllowTracking}
              disabled={tracking}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
            >
              {tracking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Recording Location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Allow Location Access
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDeclineTracking}
              variant="outline"
              disabled={tracking}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Decline & Leave
            </Button>
          </div>

          {/* Information */}
          <div className="text-center text-xs text-gray-400 space-y-1">
            <p>By clicking "Allow Location Access", you consent to location tracking.</p>
            <p>Your browser will prompt you to grant location permissions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}