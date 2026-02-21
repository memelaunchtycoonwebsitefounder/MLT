/**
 * Fetch API Utility - Modern replacement for Axios
 * Provides Axios-like interface using native Fetch API
 * Saves ~13KB in bundle size
 */

const fetchUtils = {
  /**
   * GET request
   * @param {string} url - Request URL
   * @param {object} config - Configuration object (headers, etc.)
   * @returns {Promise<{data: any, status: number, statusText: string}>}
   */
  async get(url, config = {}) {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    };

    try {
      const response = await fetch(url, options);
      const data = await this._parseResponse(response);
      
      if (!response.ok) {
        throw this._createError(response, data);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {any} data - Request body
   * @param {object} config - Configuration object
   * @returns {Promise<{data: any, status: number, statusText: string}>}
   */
  async post(url, data, config = {}) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
      ...config,
    };

    try {
      const response = await fetch(url, options);
      const responseData = await this._parseResponse(response);
      
      if (!response.ok) {
        throw this._createError(response, responseData);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {any} data - Request body
   * @param {object} config - Configuration object
   * @returns {Promise<{data: any, status: number, statusText: string}>}
   */
  async put(url, data, config = {}) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
      ...config,
    };

    try {
      const response = await fetch(url, options);
      const responseData = await this._parseResponse(response);
      
      if (!response.ok) {
        throw this._createError(response, responseData);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {object} config - Configuration object
   * @returns {Promise<{data: any, status: number, statusText: string}>}
   */
  async delete(url, config = {}) {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    };

    try {
      const response = await fetch(url, options);
      const data = await this._parseResponse(response);
      
      if (!response.ok) {
        throw this._createError(response, data);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Parse response based on content type
   * @private
   */
  async _parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  },

  /**
   * Create error object
   * @private
   */
  _createError(response, data) {
    const error = new Error(data.error || data.message || response.statusText);
    error.response = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
    error.request = {};
    return error;
  },

  /**
   * Handle errors
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error
      return error;
    } else if (error.request) {
      // Request made but no response
      error.message = '網絡錯誤：無法連接到服務器';
      return error;
    } else {
      // Something else happened
      error.message = error.message || '請求失敗';
      return error;
    }
  },

  /**
   * Create request with authorization header
   */
  createAuthConfig(token) {
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
  },
  
  /**
   * Hide page loader
   */
  hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 300);
    }
  },
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.fetchUtils = fetchUtils;
}
