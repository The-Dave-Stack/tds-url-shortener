
/**
 * Validates if a string is a valid URL
 * @param url The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    // Create a URL object to validate the URL format
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validates if a short code is valid (alphanumeric only)
 * @param code The short code to validate
 * @returns boolean indicating if the code is valid
 */
export const isValidShortCode = (code: string): boolean => {
  const pattern = /^[a-zA-Z0-9-_]+$/;
  return pattern.test(code);
};

/**
 * Generates a random short code for URLs
 * @param length Length of the short code (default: 6)
 * @returns A random alphanumeric string
 */
export const generateShortCode = (length = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};
