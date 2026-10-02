/**
 * Backend API Configuration
 * 
 * Configured with persistent production endpoint support.
 * Can be overridden at build or runtime via the EXPO_PUBLIC_API_URL environment variable
 * (e.g. EXPO_PUBLIC_API_URL=https://your-backend.onrender.com).
 */
const PRODUCTION_BACKEND_URL = 'https://personal-assistant-api.onrender.com';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || PRODUCTION_BACKEND_URL,
  TIMEOUT_MS: 10000,
};
