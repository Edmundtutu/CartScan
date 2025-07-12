// API Configuration
// This file centralizes all API-related configuration

export const API_CONFIG = {
  // Base URL for the API server
  // Update this when your ngrok URL changes
  API_SERVER_BASE_URL: 'https://35ad14812df8.ngrok-free.app',
  
  // API version
  API_VERSION: 'v1',
  
  // API endpoints
  ENDPOINTS: {
    TRANSACTIONS: 'api/v1/transactions',
    ITEMS: 'api/v1/items',
  },
  
  // Helper function to get full API URL
  getApiUrl: (endpoint: string) => `${API_CONFIG.API_SERVER_BASE_URL}/${endpoint}`,
  
  // Helper function to get transaction URL
  getTransactionUrl: (transactionId: string) => 
    `${API_CONFIG.API_SERVER_BASE_URL}/api/v1/transactions/${transactionId}`,
  
  // Helper function to get item URL
  getItemUrl: (serial: string | number) => 
    `${API_CONFIG.API_SERVER_BASE_URL}/api/v1/items/${serial}`,
};

// Environment types
type Environment = 'development' | 'production' | 'staging';

// Environment-specific configurations
export const ENV_CONFIG: Record<Environment, { API_SERVER_BASE_URL: string }> = {
  // Development environment
  development: {
    API_SERVER_BASE_URL: 'https://35ad14812df8.ngrok-free.app',
  },
  
  // Production environment (when you deploy)
  production: {
    API_SERVER_BASE_URL: 'https://domain.com', // to be updated on deploy time
  },
  
  // Staging environment (if needed)
  staging: {
    API_SERVER_BASE_URL: 'https://domain.com', // to be updated at staging time.
  },
};

// Get current environment (you can modify this based on your needs)
const getCurrentEnv = (): Environment => {
  // For now, we'll use development
  // You can modify this to detect environment based on your setup
  return 'development';
};

// Export the current API configuration
export const getApiConfig = () => {
  const env = getCurrentEnv();
  return {
    ...API_CONFIG,
    API_SERVER_BASE_URL: ENV_CONFIG[env]?.API_SERVER_BASE_URL || API_CONFIG.API_SERVER_BASE_URL,
  };
}; 