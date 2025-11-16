/**
 * URL Encoding/Decoding Utilities
 * Provides safe URL encoding and decoding functions
 */

class UrlEncoding {
  /**
   * Safely encode a URL component
   * @param {string} component - The component to encode
   * @returns {string} - Encoded component
   */
  static encodeComponent(component) {
    if (typeof component !== 'string') {
      return String(component);
    }

    try {
      return encodeURIComponent(component);
    } catch (e) {
      console.warn('Failed to encode URL component:', e);
      return '';
    }
  }

  /**
   * Safely decode a URL component
   * @param {string} component - The component to decode
   * @returns {string} - Decoded component
   */
  static decodeComponent(component) {
    if (typeof component !== 'string') {
      return String(component);
    }

    try {
      return decodeURIComponent(component);
    } catch (e) {
      console.warn('Failed to decode URL component:', e);
      return component; // Return original if decoding fails
    }
  }

  /**
   * Safely encode a full URL
   * @param {string} url - The URL to encode
   * @returns {string} - Encoded URL
   */
  static encodeUrl(url) {
    if (typeof url !== 'string') {
      return String(url);
    }

    try {
      return encodeURI(url);
    } catch (e) {
      console.warn('Failed to encode URL:', e);
      return url; // Return original if encoding fails
    }
  }

  /**
   * Safely decode a full URL
   * @param {string} url - The URL to decode
   * @returns {string} - Decoded URL
   */
  static decodeUrl(url) {
    if (typeof url !== 'string') {
      return String(url);
    }

    try {
      return decodeURI(url);
    } catch (e) {
      console.warn('Failed to decode URL:', e);
      return url; // Return original if decoding fails
    }
  }

  /**
   * Build a URL with encoded parameters
   * @param {string} baseUrl - The base URL
   * @param {Object} params - Parameters to encode
   * @returns {string} - URL with encoded parameters
   */
  static buildUrlWithParams(baseUrl, params = {}) {
    try {
      const url = new URL(baseUrl);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v));
          } else {
            url.searchParams.set(key, value);
          }
        }
      });
      
      return url.toString();
    } catch (e) {
      console.warn('Failed to build URL with params:', e);
      return baseUrl;
    }
  }

  /**
   * Parse URL parameters safely
   * @param {string} url - The URL to parse
   * @returns {Object} - Parsed parameters
   */
  static parseUrlParams(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return params;
    } catch (e) {
      console.warn('Failed to parse URL parameters:', e);
      return {};
    }
  }

  /**
   * Encode form data as URL-encoded string
   * @param {Object} data - Form data to encode
   * @returns {string} - URL-encoded string
   */
  static encodeFormData(data) {
    if (typeof data !== 'object' || data === null) {
      return '';
    }

    const params = new URLSearchParams();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });
    
    return params.toString();
  }

  /**
   * Decode URL-encoded form data
   * @param {string} encodedData - URL-encoded string
   * @returns {Object} - Decoded form data
   */
  static decodeFormData(encodedData) {
    if (typeof encodedData !== 'string') {
      return {};
    }

    try {
      const params = new URLSearchParams(encodedData);
      const data = {};
      
      params.forEach((value, key) => {
        if (data[key]) {
          // Handle multiple values for the same key
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          data[key] = value;
        }
      });
      
      return data;
    } catch (e) {
      console.warn('Failed to decode form data:', e);
      return {};
    }
  }

  /**
   * Safely encode a filename for URL usage
   * @param {string} filename - The filename to encode
   * @returns {string} - Encoded filename
   */
  static encodeFilename(filename) {
    if (typeof filename !== 'string') {
      return 'unnamed_file';
    }

    // Remove dangerous characters
    let safe = filename.replace(/[<>:"/\\|?*]/g, '');
    
    // Encode the filename
    try {
      return encodeURIComponent(safe);
    } catch (e) {
      console.warn('Failed to encode filename:', e);
      return 'unnamed_file';
    }
  }

  /**
   * Safely decode a filename from URL
   * @param {string} encodedFilename - The encoded filename
   * @returns {string} - Decoded filename
   */
  static decodeFilename(encodedFilename) {
    if (typeof encodedFilename !== 'string') {
      return 'unnamed_file';
    }

    try {
      return decodeURIComponent(encodedFilename);
    } catch (e) {
      console.warn('Failed to decode filename:', e);
      return 'unnamed_file';
    }
  }

  /**
   * Create a safe data URL
   * @param {string} mimeType - MIME type of the data
   * @param {string} data - The data to encode
   * @returns {string} - Safe data URL
   */
  static createDataUrl(mimeType, data) {
    if (typeof mimeType !== 'string' || typeof data !== 'string') {
      return '';
    }

    // Validate MIME type
    const allowedMimeTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/xml',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      console.warn('Potentially unsafe MIME type:', mimeType);
      return '';
    }

    try {
      return `data:${mimeType};base64,${btoa(data)}`;
    } catch (e) {
      console.warn('Failed to create data URL:', e);
      return '';
    }
  }

  /**
   * Parse a data URL safely
   * @param {string} dataUrl - The data URL to parse
   * @returns {Object} - Parsed data URL information
   */
  static parseDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') {
      return { isValid: false, error: 'Data URL must be a string' };
    }

    const result = {
      isValid: false,
      mimeType: null,
      data: null,
      error: null
    };

    try {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      
      if (!match) {
        result.error = 'Invalid data URL format';
        return result;
      }

      const [, mimeType, base64Data] = match;
      
      // Validate MIME type
      const allowedMimeTypes = [
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json',
        'application/xml',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp'
      ];

      if (!allowedMimeTypes.includes(mimeType)) {
        result.error = 'Unsafe MIME type';
        return result;
      }

      // Decode base64 data
      const data = atob(base64Data);
      
      result.isValid = true;
      result.mimeType = mimeType;
      result.data = data;
      
      return result;
    } catch (e) {
      result.error = `Failed to parse data URL: ${e.message}`;
      return result;
    }
  }

  /**
   * Escape HTML entities in URL parameters
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  static escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Unescape HTML entities from URL parameters
   * @param {string} text - Text to unescape
   * @returns {string} - Unescaped text
   */
  static unescapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  }

  /**
   * Create a safe hash from URL parameters
   * @param {Object} params - Parameters to hash
   * @returns {string} - Safe hash
   */
  static createParamHash(params) {
    if (typeof params !== 'object' || params === null) {
      return '';
    }

    try {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      // Simple hash function (for non-cryptographic use)
      let hash = 0;
      for (let i = 0; i < sortedParams.length; i++) {
        const char = sortedParams.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36);
    } catch (e) {
      console.warn('Failed to create parameter hash:', e);
      return '';
    }
  }
}

export default UrlEncoding;
