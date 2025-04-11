
import { v4 as uuidv4 } from 'uuid';

/**
 * Get or create a client ID for anonymous users
 * @returns A unique client ID stored in localStorage
 */
export const getClientId = (): string => {
  let clientId = localStorage.getItem('anonymous_client_id');
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem('anonymous_client_id', clientId);
  }
  return clientId;
};
