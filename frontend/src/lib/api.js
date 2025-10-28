/**
 * API service for KBee Manager
 * Handles all backend API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle authentication errors
        if (response.status === 401) {
          // Clear token if authentication fails
          this.setToken(null);
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication API
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async updateProfile(data) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async checkSetupStatus() {
    return await this.request('/auth/setup/check');
  }

  async setupAdmin(data) {
    return await this.request('/auth/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Beehives API
  async getBeehives(page = 1, per_page = 10, searchParams = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      ...(searchParams.serialNumber && { serialNumber: searchParams.serialNumber }),
      ...(searchParams.import_date && { import_date: searchParams.import_date }),
      ...(searchParams.split_date && { split_date: searchParams.split_date }),
      ...(searchParams.notes && { notes: searchParams.notes }),
    });
    
    return await this.request(`/beehives?${params}`);
  }

  async getSoldBeehives(page = 1, per_page = 10, searchParams = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      ...(searchParams.serialNumber && { serialNumber: searchParams.serialNumber }),
      ...(searchParams.import_date && { import_date: searchParams.import_date }),
      ...(searchParams.sold_date && { sold_date: searchParams.sold_date }),
      ...(searchParams.notes && { notes: searchParams.notes }),
    });
    
    return await this.request(`/sold-beehives?${params}`);
  }

  async getStats() {
    return await this.request('/stats');
  }

  async getBeehive(serialNumber) {
    return await this.request(`/beehives/${serialNumber}`);
  }

  async getBeehiveByToken(token) {
    return await this.request(`/beehive/${token}`);
  }

  async createBeehive(data) {
    return await this.request('/beehives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBeehive(serialNumber, data) {
    return await this.request(`/beehives/${serialNumber}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBeehive(serialNumber) {
    return await this.request(`/beehives/${serialNumber}`, {
      method: 'DELETE',
    });
  }

  async markBeehiveAsSold(serialNumber, soldDate) {
    return await this.request(`/beehives/${serialNumber}/sell`, {
      method: 'POST',
      body: JSON.stringify({ sold_date: soldDate }),
    });
  }

  async markBeehiveAsNotSold(serialNumber) {
    return await this.request(`/beehives/${serialNumber}/unsell`, {
      method: 'POST',
    });
  }

  async generateQRCode(serialNumber) {
    return await this.request(`/qr/${serialNumber}`);
  }

  async exportPDF(serialNumber) {
    const url = `${this.baseURL}/export_pdf/${serialNumber}`;
    const token = this.getToken();

    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async exportBulkQRPDF(serialNumbers) {
    const url = `${this.baseURL}/export_bulk_qr_pdf`;
    const token = this.getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ serial_numbers: serialNumbers }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Bulk operations
  async createMultipleBeehives(beehives) {
    const promises = beehives.map(beehive => this.createBeehive(beehive));
    return await Promise.all(promises);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
