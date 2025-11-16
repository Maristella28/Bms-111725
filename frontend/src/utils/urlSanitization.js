/**
 * URL Sanitization Utilities for Frontend
 * Provides comprehensive URL sanitization and validation functions
 */

class UrlSanitization {
  /**
   * Sanitize a URL string
   * @param {string} url - The URL to sanitize
   * @returns {string} - Sanitized URL
   */
  static sanitizeUrl(url) {
    if (typeof url !== 'string') {
      return '';
    }

    // Remove null bytes and control characters
    let sanitized = url.replace(/\0/g, '');
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Remove malicious patterns
    sanitized = this.removeMaliciousPatterns(sanitized);
    
    // Validate URL format
    try {
      new URL(sanitized);
      return sanitized;
    } catch (e) {
      // If not a valid URL, treat as a path and sanitize
      return this.sanitizePath(sanitized);
    }
  }

  /**
   * Sanitize a file path
   * @param {string} path - The path to sanitize
   * @returns {string} - Sanitized path
   */
  static sanitizePath(path) {
    if (typeof path !== 'string') {
      return '';
    }

    // Remove null bytes
    let sanitized = path.replace(/\0/g, '');
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Normalize path separators
    sanitized = sanitized.replace(/\\/g, '/');
    
    // Remove directory traversal attempts
    sanitized = sanitized.replace(/\.\.\//g, '');
    sanitized = sanitized.replace(/\.\.\\/g, '');
    sanitized = sanitized.replace(/\.\//g, '');
    sanitized = sanitized.replace(/\.\\/g, '');
    
    // Remove multiple consecutive separators
    sanitized = sanitized.replace(/\/+/g, '/');
    
    // Trim separators from start and end
    sanitized = sanitized.replace(/^\/+|\/+$/g, '');
    
    return sanitized;
  }

  /**
   * Sanitize a filename
   * @param {string} filename - The filename to sanitize
   * @returns {string} - Sanitized filename
   */
  static sanitizeFilename(filename) {
    if (typeof filename !== 'string') {
      return 'unnamed_file';
    }

    // Remove null bytes
    let sanitized = filename.replace(/\0/g, '');
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Remove invalid filename characters
    sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');
    
    // Remove directory traversal
    sanitized = sanitized.replace(/\.\.\//g, '');
    sanitized = sanitized.replace(/\.\.\\/g, '');
    sanitized = sanitized.replace(/\.\//g, '');
    sanitized = sanitized.replace(/\.\\/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Ensure filename is not empty
    if (!sanitized) {
      sanitized = 'unnamed_file';
    }
    
    // Limit filename length
    if (sanitized.length > 255) {
      const lastDotIndex = sanitized.lastIndexOf('.');
      if (lastDotIndex > 0) {
        const extension = sanitized.substring(lastDotIndex);
        const name = sanitized.substring(0, lastDotIndex);
        sanitized = name.substring(0, 255 - extension.length - 1) + extension;
      } else {
        sanitized = sanitized.substring(0, 255);
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitize query parameters
   * @param {Object} params - The query parameters to sanitize
   * @returns {Object} - Sanitized query parameters
   */
  static sanitizeQueryParams(params) {
    if (typeof params !== 'object' || params === null) {
      return {};
    }

    const sanitized = {};
    
    for (const [key, value] of Object.entries(params)) {
      const sanitizedKey = this.sanitizeString(key);
      
      if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(v => this.sanitizeString(v));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeQueryParams(value);
      } else {
        sanitized[sanitizedKey] = this.sanitizeString(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitize a string value
   * @param {string} value - The string to sanitize
   * @returns {string} - Sanitized string
   */
  static sanitizeString(value) {
    if (typeof value !== 'string') {
      return String(value);
    }

    // Remove null bytes
    let sanitized = value.replace(/\0/g, '');
    
    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // HTML entity encode to prevent XSS
    const div = document.createElement('div');
    div.textContent = sanitized;
    sanitized = div.innerHTML;
    
    return sanitized;
  }

  /**
   * Remove malicious patterns from URL
   * @param {string} url - The URL to clean
   * @returns {string} - Cleaned URL
   */
  static removeMaliciousPatterns(url) {
    const patterns = [
      // JavaScript protocols
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:application\/javascript/gi,
      
      // File protocols
      /file:\/\//gi,
      /ftp:\/\//gi,
      
      // Other dangerous protocols
      /gopher:\/\//gi,
      /news:\/\//gi,
      /nntp:\/\//gi,
      /telnet:\/\//gi,
      /ldap:\/\//gi,
      
      // Directory traversal
      /\.\.\//g,
      /\.\.\\/g,
      /\.\//g,
      /\.\\/g,
      
      // Null bytes
      /%00/g,
      /\0/g,
      
      // Control characters
      /%[\x00-\x1F\x7F]/g,
    ];
    
    let cleaned = url;
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned;
  }

  /**
   * Validate and sanitize email addresses
   * @param {string} email - The email to sanitize
   * @returns {string} - Sanitized email
   * @throws {Error} - If email format is invalid
   */
  static sanitizeEmail(email) {
    if (typeof email !== 'string') {
      throw new Error('Email must be a string');
    }

    // Remove null bytes and control characters
    let sanitized = email.replace(/\0/g, '');
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Convert to lowercase
    sanitized = sanitized.toLowerCase();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }

  /**
   * Sanitize phone numbers
   * @param {string} phone - The phone number to sanitize
   * @returns {string} - Sanitized phone number
   */
  static sanitizePhoneNumber(phone) {
    if (typeof phone !== 'string') {
      return '';
    }

    // Remove all non-numeric characters except +, -, (, ), and spaces
    let sanitized = phone.replace(/[^\d\+\-\(\)\s]/g, '');
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    return sanitized;
  }

  /**
   * Generate a safe slug from a string
   * @param {string} text - The text to convert to slug
   * @returns {string} - Generated slug
   */
  static generateSlug(text) {
    if (typeof text !== 'string') {
      return 'untitled';
    }

    // Convert to lowercase
    let slug = text.toLowerCase();
    
    // Remove accents (basic implementation)
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Replace non-alphanumeric characters with hyphens
    slug = slug.replace(/[^a-z0-9]+/g, '-');
    
    // Remove leading and trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    
    // Remove multiple consecutive hyphens
    slug = slug.replace(/-+/g, '-');
    
    // Ensure slug is not empty
    if (!slug) {
      slug = 'untitled';
    }
    
    // Limit length
    if (slug.length > 100) {
      slug = slug.substring(0, 100);
      slug = slug.replace(/-+$/, '');
    }
    
    return slug;
  }

  /**
   * Validate and sanitize IP addresses
   * @param {string} ip - The IP address to sanitize
   * @returns {string} - Sanitized IP address
   * @throws {Error} - If IP format is invalid
   */
  static sanitizeIpAddress(ip) {
    if (typeof ip !== 'string') {
      throw new Error('IP address must be a string');
    }

    // Remove null bytes and control characters
    let sanitized = ip.replace(/\0/g, '');
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Validate IP format (IPv4 and IPv6)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (!ipv4Regex.test(sanitized) && !ipv6Regex.test(sanitized)) {
      throw new Error('Invalid IP address format');
    }
    
    return sanitized;
  }

  /**
   * Build a safe URL with sanitized parameters
   * @param {string} baseUrl - The base URL
   * @param {Object} params - Query parameters
   * @returns {string} - Safe URL with sanitized parameters
   */
  static buildSafeUrl(baseUrl, params = {}) {
    const sanitizedBase = this.sanitizeUrl(baseUrl);
    const sanitizedParams = this.sanitizeQueryParams(params);
    
    const url = new URL(sanitizedBase);
    
    Object.entries(sanitizedParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  }

  /**
   * Parse and sanitize URL parameters
   * @param {string} url - The URL to parse
   * @returns {Object} - Sanitized URL parameters
   */
  static parseAndSanitizeUrlParams(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = this.sanitizeString(value);
      });
      
      return params;
    } catch (e) {
      return {};
    }
  }

  /**
   * Check if a URL is safe to navigate to
   * @param {string} url - The URL to check
   * @returns {boolean} - True if URL is safe
   */
  static isUrlSafe(url) {
    try {
      const sanitized = this.sanitizeUrl(url);
      const urlObj = new URL(sanitized);
      
      // Check for dangerous protocols
      const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:', 'ftp:'];
      const protocol = urlObj.protocol.toLowerCase();
      
      return !dangerousProtocols.includes(protocol);
    } catch (e) {
      return false;
    }
  }
}

export default UrlSanitization;
