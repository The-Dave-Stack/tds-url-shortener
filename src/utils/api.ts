
import axios from 'axios';

// In a real application, this would be an environment variable
const API_BASE_URL = 'http://localhost:3000/api';

// Interface for the URL data
export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  customAlias?: string;
}

// Interface for URL creation request
interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
}

// Interface for the URL analytics
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

// Interface for a visit
export interface Visit {
  id: string;
  timestamp: string;
  country: string;
  userAgent: string;
  ip?: string;
}

/**
 * Create a short URL
 * @param originalUrl The original URL to shorten
 * @param customAlias Optional custom alias for the short URL
 * @returns Promise with the created URL data
 */
export const createShortUrl = async (
  originalUrl: string,
  customAlias?: string
): Promise<UrlData> => {
  try {
    const response = await axios.post<UrlData>(`${API_BASE_URL}/urls`, {
      originalUrl,
      customAlias,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating short URL:', error);
    throw error;
  }
};

/**
 * Get all URLs created by the user
 * @returns Promise with array of URL data
 */
export const getUserUrls = async (): Promise<UrlData[]> => {
  try {
    const response = await axios.get<UrlData[]>(`${API_BASE_URL}/urls`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user URLs:', error);
    throw error;
  }
};

/**
 * Get analytics for a specific URL
 * @param id The URL ID
 * @returns Promise with the URL analytics data
 */
export const getUrlAnalytics = async (id: string): Promise<UrlAnalytics> => {
  try {
    const response = await axios.get<UrlAnalytics>(`${API_BASE_URL}/urls/${id}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching URL analytics:', error);
    throw error;
  }
};

// This function would be used in a backend API call
// It simulates how you would generate a unique short code
export const generateShortCode = (length = 6): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};
