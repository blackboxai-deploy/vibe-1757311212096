'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

import { 
  Copy, 
  ExternalLink, 
  Trash2, 
  MapPin, 
  Calendar, 
  Users,
  BarChart3
} from 'lucide-react';
import LocationMap from '@/components/LocationMap';
import { TrackingLink, LocationRecord, LinksResponse, LocationsResponse } from '@/types';

export default function DashboardPage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'link' | 'location';
    id: string | number;
    title?: string;
  }>({ open: false, type: 'link', id: '' });

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (selectedLinkId) {
      fetchLocations(selectedLinkId);
    } else {
      setLocations([]);
    }
  }, [selectedLinkId]);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      const data: LinksResponse = await response.json();
      
      if (data.success) {
        setLinks(data.links);
        // Select first link by default if available
        if (data.links.length > 0 && !selectedLinkId) {
          setSelectedLinkId(data.links[0].id);
        }
      } else {
        toast.error('Failed to load tracking links');
      }
    } catch (error) {
      toast.error('Network error while loading links');
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (linkId: string) => {
    setLocationsLoading(true);
    
    try {
      const response = await fetch(`/api/locations/${linkId}`);
      const data: LocationsResponse = await response.json();
      
      if (data.success) {
        setLocations(data.locations);
      } else {
        toast.error('Failed to load location data');
        setLocations([]);
      }
    } catch (error) {
      toast.error('Network error while loading locations');
      console.error('Error fetching locations:', error);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Link deleted successfully');
        setLinks(links.filter(link => link.id !== linkId));
        
        // Select another link or clear selection
        if (selectedLinkId === linkId) {
          const remainingLinks = links.filter(link => link.id !== linkId);
          setSelectedLinkId(remainingLinks.length > 0 ? remainingLinks[0].id : null);
        }
      } else {
        toast.error(data.error || 'Failed to delete link');
      }
    } catch (error) {
      toast.error('Network error while deleting link');
      console.error('Error deleting link:', error);
    }
  };

   const handleDeleteLocation = async (locationId: number) => {
    try {
      const response = await fetch(`/api/locations/delete/${locationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Location deleted successfully');
        setLocations(locations.filter(loc => loc.id !== locationId));
        
        // Update the visit count for the current link
        if (selectedLinkId) {
          const updatedLinks = links.map(link => {
            if (link.id === selectedLinkId) {
              return { ...link, visit_count: (link.visit_count || 1) - 1 };
            }
            return link;
          });
          setLinks(updatedLinks);
        }
      } else {
        toast.error(data.error || 'Failed to delete location');
      }
    } catch (error) {
      toast.error('Network error while deleting location');
      console.error('Error deleting location:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const getTrackingUrl = (linkId: string) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/track/${linkId}`;
  };

  const confirmDelete = (type: 'link' | 'location', id: string | number, title?: string) => {
    setDeleteDialog({ open: true, type, id, title });
  };

  const executeDelete = async () => {
    const { type, id } = deleteDialog;
    
    if (type === 'link') {
      await handleDeleteLink(id as string);
    } else {
      await handleDeleteLocation(id as number);
    }
    
    setDeleteDialog({ open: false, type: 'link', id: '' });
  };

  const selectedLink = selectedLinkId ? links.find(link => link.id === selectedLinkId) : null;
  const totalVisits = links.reduce((sum, link) => sum + (link.visit_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-300">Monitor your tracking links and visitor locations</p>
        </div>

        {links.length === 0 ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Tracking Links</h3>
              <p className="text-gray-400 mb-6">Create your first tracking link to start monitoring locations</p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Links</p>
                      <p className="text-2xl font-bold text-white">{links.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Visits</p>
                      <p className="text-2xl font-bold text-white">{totalVisits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-purple-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Active Locations</p>
                      <p className="text-2xl font-bold text-white">{locations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Links List */}
              <div className="lg:col-span-1">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Tracking Links</CardTitle>
                    <CardDescription>Select a link to view its locations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          selectedLinkId === link.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                        onClick={() => setSelectedLinkId(link.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white truncate pr-2">{link.title}</h4>
                          <Badge variant="secondary" className="shrink-0">
                            {link.visit_count || 0} visits
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-400 mb-3">
                          Created: {new Date(link.created_at).toLocaleDateString()}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(getTrackingUrl(link.id));
                            }}
                            className="flex-1 text-xs border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getTrackingUrl(link.id), '_blank');
                            }}
                            className="flex-1 text-xs border-white/20 text-white hover:bg-white/10"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete('link', link.id, link.title);
                            }}
                            className="shrink-0 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Map and Locations */}
              <div className="lg:col-span-2 space-y-6">
                {selectedLink ? (
                  <>
                    {/* Map */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                          {selectedLink.title}
                        </CardTitle>
                        <CardDescription>
                          Interactive map showing all tracked locations
                          {locationsLoading && ' (Loading...)'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LocationMap 
                          locations={locations}
                          onLocationDelete={(locationId) => confirmDelete('location', locationId)}
                          height="400px"
                        />
                      </CardContent>
                    </Card>

                    {/* Locations List */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                            Location History
                          </span>
                          {locations.length > 0 && (
                            <Badge variant="outline" className="border-white/20 text-white">
                              {locations.length} {locations.length === 1 ? 'location' : 'locations'}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {locations.length === 0 ? (
                          <div className="text-center py-8">
                            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No locations tracked yet</p>
                            <p className="text-sm text-gray-500 mt-1">Locations will appear here when visitors access this link</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {locations.map((location) => (
                              <div
                                key={location.id}
                                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MapPin className="h-4 w-4 text-purple-400" />
                                      <span className="text-sm font-medium text-white">
                                        Location #{location.id}
                                      </span>
                                      {location.city && location.country && (
                                        <Badge variant="outline" className="border-blue-500/20 text-blue-300 text-xs">
                                          {location.city}, {location.country}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                      <div>
                                        <span className="text-gray-400">Coordinates:</span>
                                        <br />
                                        <code className="text-green-300 text-xs">
                                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </code>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Time:</span>
                                        <br />
                                        <span className="text-gray-200 text-xs">
                                          {new Date(location.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      {location.accuracy && (
                                        <div>
                                          <span className="text-gray-400">Accuracy:</span>
                                          <span className="ml-2 text-blue-300 text-xs">±{location.accuracy}m</span>
                                        </div>
                                      )}
                                      {location.ip_address && (
                                        <div>
                                          <span className="text-gray-400">IP:</span>
                                          <span className="ml-2 text-gray-200 text-xs">{location.ip_address}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => confirmDelete('location', location.id)}
                                    className="shrink-0 border-red-500/20 text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a Link</h3>
                      <p className="text-gray-400">Choose a tracking link from the left to view its locations</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete {deleteDialog.type === 'link' ? 'Tracking Link' : 'Location'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {deleteDialog.type === 'link' ? (
                <>
                  This will permanently delete the tracking link "{deleteDialog.title}" and all associated location data. This action cannot be undone.
                </>
              ) : (
                'This will permanently delete this location record. This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}