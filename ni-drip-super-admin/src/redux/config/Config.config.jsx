/**
 * @file Config.utility.js
 * @module Core/Configuration
 * @description
 * Centralized Application Configuration Manager.
 * * This module serves as the single source of truth for environment-specific
 * variables and external service endpoints. It facilitates seamless switching
 * between development (local) and production (cloud) environments.
 * * **Key Values:**
 * - **BACKEND_API_URL:** The base endpoint for all RESTful API communications.
 * * @constant {Object} CONFIG
 * @property {string} BACKEND_API_URL - The base URL used by services to communicate with the backend.
 */

const CONFIG = {
  /** Dev Backend API Url */
  BACKEND_API_URL: "http://localhost:8000/api",

  /** Prod Backend API Url */
  // BACKEND_API_URL: "https://ni-drip-backend.vercel.app/api",
};

export default CONFIG;
