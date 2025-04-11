
// Types for API interactions

/**
 * Interface for URL data
 */
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  customAlias?: string;
}

/**
 * Interface for URL creation request
 */
export interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
}

/**
 * Interface for URL analytics
 */
export interface UrlAnalytics {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
  dailyClicks: { date: string; clicks: number }[];
  countries: { name: string; value: number }[];
  recentVisits: Visit[];
}

/**
 * Interface for a visit
 */
export interface Visit {
  id: string;
  timestamp: string;
  country: string;
  userAgent: string;
  ip?: string;
}

/**
 * Interface for anonymous quota information
 */
export interface AnonymousQuota {
  used: number;
  limit: number;
  remaining: number;
}
