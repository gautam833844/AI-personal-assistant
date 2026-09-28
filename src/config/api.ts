import { Platform } from 'react-native';

/**
 * Backend API Configuration
 * 
 * Configured with Cloudflare Tunnel URL for reliable cross-network connectivity
 * across physical Android/iOS devices, simulators, and web.
 */
export const API_CONFIG = {
  BASE_URL: 'https://read-vitamins-nam-lamp.trycloudflare.com',
  TIMEOUT_MS: 10000,
};
