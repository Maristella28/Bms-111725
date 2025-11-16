import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useUrlSanitization } from '../hooks/useUrlSanitization';

/**
 * URL Sanitized Input Component
 * Automatically sanitizes input values and provides validation feedback
 */
const UrlSanitizedInput = ({
  type = 'text',
  value = '',
  onChange,
  onSanitizedChange,
  placeholder = '',
  className = '',
  disabled = false,
  required = false,
  showSanitizationInfo = false,
  sanitizationType = 'string', // 'string', 'url', 'email', 'phone', 'filename', 'path'
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [sanitizedValue, setSanitizedValue] = useState(value);
  const [isDirty, setIsDirty] = useState(false);
  const [sanitizationInfo, setSanitizationInfo] = useState(null);
  const inputRef = useRef(null);
  
  const {
    sanitizeUrl,
    sanitizePath,
    sanitizeFilename,
    sanitizeString,
    sanitizeEmail,
    sanitizePhoneNumber,
    isUrlSafe
  } = useUrlSanitization();

  // Sanitization function based on type
  const getSanitizationFunction = useCallback(() => {
    switch (sanitizationType) {
      case 'url':
        return sanitizeUrl;
      case 'path':
        return sanitizePath;
      case 'filename':
        return sanitizeFilename;
      case 'email':
        return sanitizeEmail;
      case 'phone':
        return sanitizePhoneNumber;
      default:
        return sanitizeString;
    }
  }, [sanitizationType, sanitizeUrl, sanitizePath, sanitizeFilename, sanitizeString, sanitizeEmail, sanitizePhoneNumber]);

  // Sanitize input value
  const sanitizeInput = useCallback((rawValue) => {
    try {
      const sanitizeFn = getSanitizationFunction();
      const sanitized = sanitizeFn(rawValue);
      
      // Additional validation for URLs
      if (sanitizationType === 'url' && !isUrlSafe(sanitized)) {
        throw new Error('URL contains potentially dangerous content');
      }
      
      return {
        sanitized,
        wasModified: rawValue !== sanitized,
        error: null
      };
    } catch (error) {
      return {
        sanitized: rawValue,
        wasModified: false,
        error: error.message
      };
    }
  }, [getSanitizationFunction, sanitizationType, isUrlSafe]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    setIsDirty(true);
    
    const sanitizationResult = sanitizeInput(rawValue);
    setSanitizedValue(sanitizationResult.sanitized);
    setSanitizationInfo(sanitizationResult);
    
    // Call onChange with raw value
    if (onChange) {
      onChange(e);
    }
    
    // Call onSanitizedChange with sanitized value
    if (onSanitizedChange) {
      const sanitizedEvent = {
        ...e,
        target: {
          ...e.target,
          value: sanitizationResult.sanitized
        }
      };
      onSanitizedChange(sanitizedEvent);
    }
  }, [sanitizeInput, onChange, onSanitizedChange]);

  // Handle blur event
  const handleBlur = useCallback((e) => {
    // Update input value to sanitized value on blur
    if (sanitizationInfo && sanitizationInfo.wasModified) {
      setInputValue(sanitizationInfo.sanitized);
    }
  }, [sanitizationInfo]);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== inputValue && !isDirty) {
      setInputValue(value);
      setSanitizedValue(value);
      setSanitizationInfo(null);
    }
  }, [value, inputValue, isDirty]);

  // Get input styling based on sanitization state
  const getInputClassName = () => {
    let baseClass = className;
    
    if (sanitizationInfo) {
      if (sanitizationInfo.error) {
        baseClass += ' border-red-500 bg-red-50';
      } else if (sanitizationInfo.wasModified) {
        baseClass += ' border-yellow-500 bg-yellow-50';
      }
    }
    
    return baseClass;
  };

  // Get sanitization info display
  const getSanitizationDisplay = () => {
    if (!showSanitizationInfo || !sanitizationInfo) {
      return null;
    }
    
    if (sanitizationInfo.error) {
      return (
        <div className="text-red-600 text-sm mt-1">
          ⚠️ {sanitizationInfo.error}
        </div>
      );
    }
    
    if (sanitizationInfo.wasModified) {
      return (
        <div className="text-yellow-600 text-sm mt-1">
          🔧 Input was sanitized for security
        </div>
      );
    }
    
    return (
      <div className="text-green-600 text-sm mt-1">
        ✅ Input is clean
      </div>
    );
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type={type}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={getInputClassName()}
        disabled={disabled}
        required={required}
        {...props}
      />
      {getSanitizationDisplay()}
    </div>
  );
};

export default UrlSanitizedInput;
