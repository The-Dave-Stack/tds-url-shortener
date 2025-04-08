
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
