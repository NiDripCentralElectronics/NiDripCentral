/**
 * @file Config.utility.js
 * @module Core/Configuration
 * @description
 * Single source of truth for environment-specific application configuration.
 *
 * Centralizes critical settings such as:
 * - Backend API base URL (switches between local development and production environments)
 * - Future extensibility for other service endpoints, feature flags, or app constants
 *
 * Usage pattern:
 * - Import and use CONFIG.BACKEND_API_URL in all API service layers
 * - Easily toggle between local dev server and deployed production backend
 *   by commenting/uncommenting the appropriate line
 */

const CONFIG = {
  /** Dev Backend API Url */
  BACKEND_API_URL: 'http://192.168.1.14:8000/api',  

  /** Prod Backend API Url */
  // BACKEND_API_URL: 'https://ni-drip-backend.vercel.app/api',

  /** Stripe Publishable Key */
  // STRIPE_PUBLISHABLE_KEY:
  //   'pk_test_51SvoxIQOTKVwwqqo6MzUjJvU6mDltqbRC7F0L7WY6WetUZ3xK5OoVUqvsWoV9Kg9MHxm0wAwZNT3f2VvUeGR2yqv00TTDQVjDo',
  STRIPE_PUBLISHABLE_KEY:
    'pk_live_51SvoxIQOTKVwwqqoltpFVYwOW0fHX5QaLPqHlgP1UuHiGJ5kx3eR0joTsQizLZa16mO4w1YSghovMFfEQOTn4O4G00Qo41qnEo',
};

export default CONFIG;
