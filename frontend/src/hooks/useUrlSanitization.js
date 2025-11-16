import { useCallback, useMemo } from 'react';
import UrlSanitization from '../utils/urlSanitization';

/**
 * Custom hook for URL sanitization
 * Provides sanitization functions with memoization for performance
 */
export const useUrlSanitization = () => {
  // Memoized sanitization functions
  const sanitizeUrl = useCallback((url) => {
    return UrlSanitization.sanitizeUrl(url);
  }, []);

  const sanitizePath = useCallback((path) => {
    return UrlSanitization.sanitizePath(path);
  }, []);

  const sanitizeFilename = useCallback((filename) => {
    return UrlSanitization.sanitizeFilename(filename);
  }, []);

  const sanitizeQueryParams = useCallback((params) => {
    return UrlSanitization.sanitizeQueryParams(params);
  }, []);

  const sanitizeString = useCallback((value) => {
    return UrlSanitization.sanitizeString(value);
  }, []);

  const sanitizeEmail = useCallback((email) => {
    return UrlSanitization.sanitizeEmail(email);
  }, []);

  const sanitizePhoneNumber = useCallback((phone) => {
    return UrlSanitization.sanitizePhoneNumber(phone);
  }, []);

  const generateSlug = useCallback((text) => {
    return UrlSanitization.generateSlug(text);
  }, []);

  const sanitizeIpAddress = useCallback((ip) => {
    return UrlSanitization.sanitizeIpAddress(ip);
  }, []);

  const buildSafeUrl = useCallback((baseUrl, params) => {
    return UrlSanitization.buildSafeUrl(baseUrl, params);
  }, []);

  const parseAndSanitizeUrlParams = useCallback((url) => {
    return UrlSanitization.parseAndSanitizeUrlParams(url);
  }, []);

  const isUrlSafe = useCallback((url) => {
    return UrlSanitization.isUrlSafe(url);
  }, []);

  // Memoized sanitization utilities object
  const sanitizationUtils = useMemo(() => ({
    sanitizeUrl,
    sanitizePath,
    sanitizeFilename,
    sanitizeQueryParams,
    sanitizeString,
    sanitizeEmail,
    sanitizePhoneNumber,
    generateSlug,
    sanitizeIpAddress,
    buildSafeUrl,
    parseAndSanitizeUrlParams,
    isUrlSafe,
  }), [
    sanitizeUrl,
    sanitizePath,
    sanitizeFilename,
    sanitizeQueryParams,
    sanitizeString,
    sanitizeEmail,
    sanitizePhoneNumber,
    generateSlug,
    sanitizeIpAddress,
    buildSafeUrl,
    parseAndSanitizeUrlParams,
    isUrlSafe,
  ]);

  return sanitizationUtils;
};

export default useUrlSanitization;
