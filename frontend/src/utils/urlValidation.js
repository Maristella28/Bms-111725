/**
 * URL Validation Utilities
 * Provides comprehensive URL validation and security checks
 */

class UrlValidation {
  /**
   * Validate if a URL is safe and properly formatted
   * @param {string} url - The URL to validate
   * @returns {Object} - Validation result with details
   */
  static validateUrl(url) {
    const result = {
      isValid: false,
      isSafe: false,
      errors: [],
      warnings: [],
      sanitizedUrl: null
    };

    if (typeof url !== 'string') {
      result.errors.push('URL must be a string');
      return result;
    }

    if (!url.trim()) {
      result.errors.push('URL cannot be empty');
      return result;
    }

    // Check for null bytes and control characters
    if (url.includes('\0')) {
      result.errors.push('URL contains null bytes');
    }

    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(url)) {
      result.errors.push('URL contains control characters');
    }

    // Check for dangerous protocols
    const dangerousProtocols = [
      'javascript:',
      'vbscript:',
      'data:',
      'file:',
      'ftp:',
      'gopher:',
      'news:',
      'nntp:',
      'telnet:',
      'ldap:'
    ];

    const lowerUrl = url.toLowerCase();
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        result.errors.push(`Dangerous protocol detected: ${protocol}`);
      }
    }

    // Check for directory traversal
    if (/\.\.\//.test(url) || /\.\.\\/.test(url)) {
      result.errors.push('Directory traversal detected');
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<applet/i,
      /on\w+\s*=/i,
      /javascript:/i,
      /vbscript:/i
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(url)) {
        result.errors.push('Potential XSS pattern detected');
        break;
      }
    }

    // Try to parse as URL
    try {
      const urlObj = new URL(url);
      result.sanitizedUrl = urlObj.toString();
      result.isValid = true;

      // Additional validations for valid URLs
      if (urlObj.protocol === 'http:' && !urlObj.hostname.includes('localhost')) {
        result.warnings.push('HTTP protocol is not secure');
      }

      if (urlObj.hostname.includes('..')) {
        result.errors.push('Hostname contains directory traversal');
        result.isValid = false;
      }

      // Check for suspicious characters in hostname
      if (/[<>:"/\\|?*]/.test(urlObj.hostname)) {
        result.errors.push('Hostname contains invalid characters');
        result.isValid = false;
      }

    } catch (e) {
      result.errors.push(`Invalid URL format: ${e.message}`);
    }

    // Determine if URL is safe
    result.isSafe = result.isValid && result.errors.length === 0;

    return result;
  }

  /**
   * Validate if a URL is allowed based on domain whitelist
   * @param {string} url - The URL to validate
   * @param {Array} allowedDomains - Array of allowed domains
   * @returns {Object} - Validation result
   */
  static validateUrlAgainstWhitelist(url, allowedDomains = []) {
    const validation = this.validateUrl(url);
    
    if (!validation.isValid) {
      return validation;
    }

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check if hostname is in whitelist
      const isAllowed = allowedDomains.some(domain => {
        const allowedDomain = domain.toLowerCase();
        return hostname === allowedDomain || hostname.endsWith('.' + allowedDomain);
      });

      if (!isAllowed) {
        validation.errors.push(`Domain ${hostname} is not in the allowed list`);
        validation.isSafe = false;
      }

    } catch (e) {
      validation.errors.push(`Error parsing URL: ${e.message}`);
      validation.isValid = false;
      validation.isSafe = false;
    }

    return validation;
  }

  /**
   * Validate if a URL is safe for redirect
   * @param {string} url - The URL to validate
   * @param {string} currentDomain - Current domain for relative URL validation
   * @returns {Object} - Validation result
   */
  static validateRedirectUrl(url, currentDomain = '') {
    const validation = this.validateUrl(url);
    
    if (!validation.isValid) {
      return validation;
    }

    try {
      const urlObj = new URL(url);
      
      // Check if it's a relative URL
      if (!urlObj.protocol) {
        // Relative URLs are generally safe for redirects
        return validation;
      }

      // Check if it's the same domain
      if (currentDomain && urlObj.hostname === currentDomain) {
        return validation;
      }

      // Check for open redirect vulnerabilities
      const suspiciousPatterns = [
        /^https?:\/\/[^\/]*\/\?/,
        /^https?:\/\/[^\/]*\/#/,
        /^https?:\/\/[^\/]*\/\?.*redirect/i,
        /^https?:\/\/[^\/]*\/\?.*url/i,
        /^https?:\/\/[^\/]*\/\?.*return/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
          validation.warnings.push('Potential open redirect detected');
        }
      }

    } catch (e) {
      validation.errors.push(`Error parsing redirect URL: ${e.message}`);
      validation.isValid = false;
      validation.isSafe = false;
    }

    return validation;
  }

  /**
   * Validate file upload URL
   * @param {string} url - The URL to validate
   * @param {Array} allowedExtensions - Array of allowed file extensions
   * @returns {Object} - Validation result
   */
  static validateFileUrl(url, allowedExtensions = []) {
    const validation = this.validateUrl(url);
    
    if (!validation.isValid) {
      return validation;
    }

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      
      // Extract file extension
      const extension = pathname.split('.').pop();
      
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        validation.errors.push(`File extension .${extension} is not allowed`);
        validation.isSafe = false;
      }

      // Check for executable file extensions
      const dangerousExtensions = [
        'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
        'php', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl', 'sh'
      ];

      if (dangerousExtensions.includes(extension)) {
        validation.warnings.push(`Potentially dangerous file extension: .${extension}`);
      }

    } catch (e) {
      validation.errors.push(`Error parsing file URL: ${e.message}`);
      validation.isValid = false;
      validation.isSafe = false;
    }

    return validation;
  }

  /**
   * Validate email URL (mailto:)
   * @param {string} url - The mailto URL to validate
   * @returns {Object} - Validation result
   */
  static validateEmailUrl(url) {
    const validation = this.validateUrl(url);
    
    if (!validation.isValid) {
      return validation;
    }

    try {
      const urlObj = new URL(url);
      
      if (urlObj.protocol !== 'mailto:') {
        validation.errors.push('URL must be a mailto link');
        validation.isValid = false;
        validation.isSafe = false;
        return validation;
      }

      // Validate email address
      const email = urlObj.pathname;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        validation.errors.push('Invalid email address in mailto link');
        validation.isValid = false;
        validation.isSafe = false;
      }

      // Check for suspicious parameters
      const suspiciousParams = ['subject', 'body', 'cc', 'bcc'];
      for (const param of suspiciousParams) {
        if (urlObj.searchParams.has(param)) {
          const value = urlObj.searchParams.get(param);
          if (value && (value.includes('<') || value.includes('>'))) {
            validation.warnings.push(`Parameter ${param} may contain HTML`);
          }
        }
      }

    } catch (e) {
      validation.errors.push(`Error parsing email URL: ${e.message}`);
      validation.isValid = false;
      validation.isSafe = false;
    }

    return validation;
  }

  /**
   * Get URL validation summary
   * @param {string} url - The URL to validate
   * @returns {string} - Human-readable validation summary
   */
  static getValidationSummary(url) {
    const validation = this.validateUrl(url);
    
    if (!validation.isValid) {
      return `❌ Invalid URL: ${validation.errors.join(', ')}`;
    }
    
    if (!validation.isSafe) {
      return `⚠️ Unsafe URL: ${validation.errors.join(', ')}`;
    }
    
    if (validation.warnings.length > 0) {
      return `✅ Valid URL with warnings: ${validation.warnings.join(', ')}`;
    }
    
    return '✅ Valid and safe URL';
  }
}

export default UrlValidation;
