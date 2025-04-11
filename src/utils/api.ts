
// Main API file that re-exports all API functionality
// This file maintains backward compatibility with existing code

export type {
  UrlData,
  CreateUrlRequest,
  UrlAnalytics,
  Visit,
  AnonymousQuota
} from './api-types';

export {
  checkAnonymousQuota,
  createShortUrl
} from './url-service';

export {
  getUserUrls,
  deleteUrl
} from './url-management';

export {
  getUrlAnalytics
} from './analytics-service';
