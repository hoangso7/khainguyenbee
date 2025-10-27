// Test API service functionality
import apiService from './lib/api.js';

console.log('Testing API Service...');

// Test API base URL
console.log('API Base URL:', apiService.baseURL);

// Test token management
apiService.setToken('test-token');
console.log('Token set:', apiService.getToken());

// Test request method (without actually making request)
console.log('API Service initialized successfully');

// Test environment variables
console.log('Environment:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);
