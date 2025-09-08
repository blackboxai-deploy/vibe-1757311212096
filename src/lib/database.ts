import Database from 'better-sqlite3';
import path from 'path';
import { TrackingLink, LocationRecord } from '@/types';

const dbPath = path.join(process.cwd(), 'data', 'tracking.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    city TEXT,
    country TEXT,
    accuracy REAL,
    FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_locations_link_id ON locations(link_id);
  CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
`);

// Prepared statements for better performance
const insertLink = db.prepare(`
  INSERT INTO links (id, title) VALUES (?, ?)
`);

const insertLocation = db.prepare(`
  INSERT INTO locations (link_id, latitude, longitude, ip_address, user_agent, city, country, accuracy)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const selectLinks = db.prepare(`
  SELECT l.*, COUNT(loc.id) as visit_count
  FROM links l
  LEFT JOIN locations loc ON l.id = loc.link_id
  GROUP BY l.id
  ORDER BY l.created_at DESC
`);

const selectLinkById = db.prepare(`
  SELECT * FROM links WHERE id = ?
`);

const selectLocationsByLinkId = db.prepare(`
  SELECT * FROM locations WHERE link_id = ? ORDER BY timestamp DESC
`);

const deleteLink = db.prepare(`
  DELETE FROM links WHERE id = ?
`);

const deleteLocation = db.prepare(`
  DELETE FROM locations WHERE id = ?
`);

const deleteLocationsByLinkId = db.prepare(`
  DELETE FROM locations WHERE link_id = ?
`);

export const database = {
  // Link operations
  createLink: (id: string, title: string): void => {
    insertLink.run(id, title);
  },

  getLinks: (): TrackingLink[] => {
    return selectLinks.all() as TrackingLink[];
  },

  getLinkById: (id: string): TrackingLink | undefined => {
    return selectLinkById.get(id) as TrackingLink | undefined;
  },

  deleteLink: (id: string): boolean => {
    // First delete associated locations
    deleteLocationsByLinkId.run(id);
    // Then delete the link
    const result = deleteLink.run(id);
    return result.changes > 0;
  },

  // Location operations
  createLocation: (
    linkId: string,
    latitude: number,
    longitude: number,
    ipAddress?: string,
    userAgent?: string,
    city?: string,
    country?: string,
    accuracy?: number
  ): void => {
    insertLocation.run(linkId, latitude, longitude, ipAddress, userAgent, city, country, accuracy);
  },

  getLocationsByLinkId: (linkId: string): LocationRecord[] => {
    return selectLocationsByLinkId.all(linkId) as LocationRecord[];
  },

  deleteLocation: (id: number): boolean => {
    const result = deleteLocation.run(id);
    return result.changes > 0;
  },

  // Close database connection
  close: (): void => {
    db.close();
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  database.close();
  process.exit(0);
});