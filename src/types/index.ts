export interface TrackingLink {
  id: string;
  title: string;
  created_at: string;
  is_active: boolean;
  visit_count?: number;
}

export interface LocationRecord {
  id: number;
  link_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  city?: string;
  country?: string;
  accuracy?: number;
}

export interface CreateLinkRequest {
  title: string;
}

export interface CreateLinkResponse {
  success: boolean;
  link?: TrackingLink;
  error?: string;
}

export interface TrackLocationRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface TrackLocationResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface LocationsResponse {
  success: boolean;
  locations: LocationRecord[];
  error?: string;
}

export interface LinksResponse {
  success: boolean;
  links: TrackingLink[];
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}