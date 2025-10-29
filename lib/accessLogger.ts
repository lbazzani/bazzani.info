import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

const LOG_DIR = path.join(process.cwd(), 'log');
const ACCESS_LOG_FILE = path.join(LOG_DIR, 'access.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export interface AccessLogEntry {
  timestamp: string;
  method: string;
  url: string;
  pathname: string;
  search: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  headers: Record<string, string>;
}

/**
 * Extract IP address from request
 */
function getIpAddress(request: NextRequest): string | null {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return null;
}

/**
 * Get geolocation data from Vercel/Cloudflare headers
 */
function getGeolocation(request: NextRequest): { country: string | null; city: string | null } {
  return {
    country: request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry'),
    city: request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity'),
  };
}

/**
 * Format timestamp for logging
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Log an access request
 */
export function logAccess(request: NextRequest): void {
  const url = new URL(request.url);
  const geo = getGeolocation(request);

  // Collect relevant headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // Only log non-sensitive headers
    if (!key.toLowerCase().includes('authorization') &&
        !key.toLowerCase().includes('cookie') &&
        !key.toLowerCase().includes('token')) {
      headers[key] = value;
    }
  });

  const entry: AccessLogEntry = {
    timestamp: formatTimestamp(),
    method: request.method,
    url: request.url,
    pathname: url.pathname,
    search: url.search,
    ip: getIpAddress(request),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    country: geo.country,
    city: geo.city,
    headers,
  };

  const logLine = JSON.stringify(entry) + '\n';

  try {
    fs.appendFileSync(ACCESS_LOG_FILE, logLine, 'utf8');
  } catch (error) {
    console.error('Error writing to access log:', error);
  }
}

/**
 * Read access log entries
 * @param limit - Maximum number of entries to return (most recent first)
 */
export function readAccessLog(limit?: number): AccessLogEntry[] {
  if (!fs.existsSync(ACCESS_LOG_FILE)) {
    return [];
  }

  try {
    const content = fs.readFileSync(ACCESS_LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);
    const entries = lines.map(line => JSON.parse(line) as AccessLogEntry);

    // Return most recent first
    const reversed = entries.reverse();
    return limit ? reversed.slice(0, limit) : reversed;
  } catch (error) {
    console.error('Error reading access log:', error);
    return [];
  }
}

/**
 * Get access statistics
 */
export function getAccessStats(): {
  totalRequests: number;
  uniqueIps: Set<string>;
  topPaths: Map<string, number>;
  topCountries: Map<string, number>;
  methodCounts: Map<string, number>;
} {
  const entries = readAccessLog();

  const uniqueIps = new Set<string>();
  const topPaths = new Map<string, number>();
  const topCountries = new Map<string, number>();
  const methodCounts = new Map<string, number>();

  entries.forEach(entry => {
    if (entry.ip) uniqueIps.add(entry.ip);

    const pathCount = topPaths.get(entry.pathname) || 0;
    topPaths.set(entry.pathname, pathCount + 1);

    if (entry.country) {
      const countryCount = topCountries.get(entry.country) || 0;
      topCountries.set(entry.country, countryCount + 1);
    }

    const methodCount = methodCounts.get(entry.method) || 0;
    methodCounts.set(entry.method, methodCount + 1);
  });

  return {
    totalRequests: entries.length,
    uniqueIps,
    topPaths,
    topCountries,
    methodCounts,
  };
}

/**
 * Clean old access log entries (keep only last N days)
 */
export function cleanOldAccessLogs(daysToKeep: number = 30): void {
  if (!fs.existsSync(ACCESS_LOG_FILE)) {
    return;
  }

  try {
    const content = fs.readFileSync(ACCESS_LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);
    const entries = lines.map(line => JSON.parse(line) as AccessLogEntry);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Keep only entries after cutoff date
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate > cutoffDate;
    });

    // Write back filtered entries
    const newContent = filteredEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
    fs.writeFileSync(ACCESS_LOG_FILE, newContent, 'utf8');

    console.log(`Access log cleaned: kept ${filteredEntries.length} of ${entries.length} entries`);
  } catch (error) {
    console.error('Error cleaning access log:', error);
  }
}
