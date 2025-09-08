export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface IPLocationData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get user's current location using the Geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Unknown location error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Get location from IP address (fallback method)
 */
export const getLocationFromIP = async (ipAddress?: string): Promise<IPLocationData> => {
  try {
    const url = ipAddress 
      ? `http://ip-api.com/json/${ipAddress}`
      : 'http://ip-api.com/json/';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch IP location');
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        city: data.city,
        country: data.country,
        latitude: data.lat,
        longitude: data.lon
      };
    } else {
      throw new Error(data.message || 'IP location lookup failed');
    }
  } catch (error) {
    console.error('IP location lookup error:', error);
    return {};
  }
};

/**
 * Extract IP address from request headers
 */
export const getClientIP = (headers: Headers): string | undefined => {
  // Check various headers for IP address
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded', 
    'forwarded-for',
    'forwarded'
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // Take the first IP if multiple are present
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  return undefined;
};

/**
 * Basic IP validation
 */
const isValidIP = (ip: string): boolean => {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Generate a unique tracking link ID
 */
export const generateTrackingId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  const latStr = `${Math.abs(lat).toFixed(6)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(6)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
};

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};