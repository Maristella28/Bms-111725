<?php

namespace App\Services;

class UrlSanitizationService
{
    /**
     * Sanitize a URL string
     */
    public static function sanitizeUrl(string $url): string
    {
        // Remove null bytes and control characters
        $url = str_replace("\0", '', $url);
        $url = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $url);
        
        // Trim whitespace
        $url = trim($url);
        
        // Remove excessive whitespace
        $url = preg_replace('/\s+/', ' ', $url);
        
        // Remove potential malicious patterns
        $url = self::removeMaliciousPatterns($url);
        
        // Validate URL format
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            // If not a valid URL, treat as a path and sanitize
            $url = self::sanitizePath($url);
        }
        
        return $url;
    }

    /**
     * Sanitize a file path
     */
    public static function sanitizePath(string $path): string
    {
        // Remove null bytes
        $path = str_replace("\0", '', $path);
        
        // Remove control characters
        $path = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $path);
        
        // Normalize path separators
        $path = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $path);
        
        // Remove directory traversal attempts
        $path = str_replace(['../', '..\\', './', '.\\'], '', $path);
        
        // Remove multiple consecutive separators
        $path = preg_replace('/[' . preg_quote(DIRECTORY_SEPARATOR) . ']+/', DIRECTORY_SEPARATOR, $path);
        
        // Trim separators from start and end
        $path = trim($path, DIRECTORY_SEPARATOR);
        
        return $path;
    }

    /**
     * Sanitize a filename
     */
    public static function sanitizeFilename(string $filename): string
    {
        // Remove null bytes
        $filename = str_replace("\0", '', $filename);
        
        // Remove control characters
        $filename = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $filename);
        
        // Remove invalid filename characters
        $filename = preg_replace('/[<>:"\/\\\\|?*]/', '', $filename);
        
        // Remove directory traversal
        $filename = str_replace(['../', '..\\', './', '.\\'], '', $filename);
        
        // Trim whitespace
        $filename = trim($filename);
        
        // Remove excessive whitespace
        $filename = preg_replace('/\s+/', ' ', $filename);
        
        // Ensure filename is not empty
        if (empty($filename)) {
            $filename = 'unnamed_file';
        }
        
        // Limit filename length
        if (strlen($filename) > 255) {
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $name = pathinfo($filename, PATHINFO_FILENAME);
            $filename = substr($name, 0, 255 - strlen($extension) - 1) . '.' . $extension;
        }
        
        return $filename;
    }

    /**
     * Sanitize query parameters
     */
    public static function sanitizeQueryParams(array $params): array
    {
        $sanitized = [];
        
        foreach ($params as $key => $value) {
            $sanitizedKey = self::sanitizeString($key);
            
            if (is_array($value)) {
                $sanitized[$sanitizedKey] = self::sanitizeQueryParams($value);
            } else {
                $sanitized[$sanitizedKey] = self::sanitizeString($value);
            }
        }
        
        return $sanitized;
    }

    /**
     * Sanitize a string value
     */
    public static function sanitizeString(string $value): string
    {
        // Remove null bytes
        $value = str_replace("\0", '', $value);
        
        // Remove control characters except newlines and tabs
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        
        // Trim whitespace
        $value = trim($value);
        
        // Remove excessive whitespace
        $value = preg_replace('/\s+/', ' ', $value);
        
        // HTML entity encode to prevent XSS
        $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8', false);
        
        return $value;
    }

    /**
     * Remove malicious patterns from URL
     */
    private static function removeMaliciousPatterns(string $url): string
    {
        $patterns = [
            // JavaScript protocols
            '/javascript:/i',
            '/vbscript:/i',
            '/data:text\/html/i',
            '/data:application\/javascript/i',
            
            // File protocols
            '/file:\/\//i',
            '/ftp:\/\//i',
            
            // Other dangerous protocols
            '/gopher:\/\//i',
            '/news:\/\//i',
            '/nntp:\/\//i',
            '/telnet:\/\//i',
            '/ldap:\/\//i',
            
            // Directory traversal
            '/\.\.\//',
            '/\.\.\\\\/',
            '/\.\//',
            '/\.\\\\/',
            
            // Null bytes
            '/%00/',
            '/\0/',
            
            // Control characters
            '/%[\x00-\x1F\x7F]/',
        ];
        
        foreach ($patterns as $pattern) {
            $url = preg_replace($pattern, '', $url);
        }
        
        return $url;
    }

    /**
     * Validate and sanitize email addresses
     */
    public static function sanitizeEmail(string $email): string
    {
        // Remove null bytes and control characters
        $email = str_replace("\0", '', $email);
        $email = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $email);
        
        // Trim whitespace
        $email = trim($email);
        
        // Convert to lowercase
        $email = strtolower($email);
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
        
        return $email;
    }

    /**
     * Sanitize phone numbers
     */
    public static function sanitizePhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters except +, -, (, ), and spaces
        $phone = preg_replace('/[^\d\+\-\(\)\s]/', '', $phone);
        
        // Remove excessive whitespace
        $phone = preg_replace('/\s+/', ' ', $phone);
        
        // Trim whitespace
        $phone = trim($phone);
        
        return $phone;
    }

    /**
     * Generate a safe slug from a string
     */
    public static function generateSlug(string $text): string
    {
        // Convert to lowercase
        $text = strtolower($text);
        
        // Remove accents
        $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        
        // Replace non-alphanumeric characters with hyphens
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        
        // Remove leading and trailing hyphens
        $text = trim($text, '-');
        
        // Remove multiple consecutive hyphens
        $text = preg_replace('/-+/', '-', $text);
        
        // Ensure slug is not empty
        if (empty($text)) {
            $text = 'untitled';
        }
        
        // Limit length
        if (strlen($text) > 100) {
            $text = substr($text, 0, 100);
            $text = rtrim($text, '-');
        }
        
        return $text;
    }

    /**
     * Validate and sanitize IP addresses
     */
    public static function sanitizeIpAddress(string $ip): string
    {
        // Remove null bytes and control characters
        $ip = str_replace("\0", '', $ip);
        $ip = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $ip);
        
        // Trim whitespace
        $ip = trim($ip);
        
        // Validate IP format
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            throw new \InvalidArgumentException('Invalid IP address format');
        }
        
        return $ip;
    }
}
