<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Sanitize all input data
        $this->sanitizeInput($request);
        
        // Sanitize URL parameters
        $this->sanitizeUrlParameters($request);
        
        // Sanitize headers
        $this->sanitizeHeaders($request);
        
        return $next($request);
    }

    /**
     * Sanitize all input data (GET, POST, JSON)
     */
    private function sanitizeInput(Request $request)
    {
        // Sanitize query parameters
        $query = $request->query();
        $sanitizedQuery = $this->sanitizeArray($query);
        $request->merge($sanitizedQuery);

        // Sanitize request body
        $input = $request->all();
        $sanitizedInput = $this->sanitizeArray($input);
        
        // Replace the input data
        $request->replace($sanitizedInput);
    }

    /**
     * Sanitize URL parameters
     */
    private function sanitizeUrlParameters(Request $request)
    {
        $route = $request->route();
        if ($route) {
            $parameters = $route->parameters();
            $sanitizedParameters = $this->sanitizeArray($parameters);
            
            // Update route parameters
            foreach ($sanitizedParameters as $key => $value) {
                $route->setParameter($key, $value);
            }
        }
    }

    /**
     * Sanitize request headers
     */
    private function sanitizeHeaders(Request $request)
    {
        $headers = $request->headers->all();
        $sanitizedHeaders = [];
        
        foreach ($headers as $key => $values) {
            $sanitizedKey = $this->sanitizeString($key);
            $sanitizedValues = [];
            
            foreach ($values as $value) {
                $sanitizedValues[] = $this->sanitizeString($value);
            }
            
            $sanitizedHeaders[$sanitizedKey] = $sanitizedValues;
        }
        
        // Update headers
        $request->headers->replace($sanitizedHeaders);
    }

    /**
     * Recursively sanitize arrays
     */
    private function sanitizeArray(array $data): array
    {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            $sanitizedKey = $this->sanitizeString($key);
            
            if (is_array($value)) {
                $sanitized[$sanitizedKey] = $this->sanitizeArray($value);
            } else {
                $sanitized[$sanitizedKey] = $this->sanitizeString($value);
            }
        }
        
        return $sanitized;
    }

    /**
     * Sanitize individual string values
     */
    private function sanitizeString($value): string
    {
        if (!is_string($value)) {
            if ($value === null) {
                return '';
            }
            if (is_array($value) || is_object($value)) {
                return '';
            }
            return (string) $value;
        }

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
        
        // Remove potential SQL injection patterns
        $value = $this->removeSqlInjectionPatterns($value);
        
        // Remove potential XSS patterns
        $value = $this->removeXssPatterns($value);
        
        return $value;
    }

    /**
     * Remove common SQL injection patterns
     */
    private function removeSqlInjectionPatterns(string $value): string
    {
        $patterns = [
            '/(\bUNION\b.*\bSELECT\b)/i',
            '/(\bSELECT\b.*\bFROM\b)/i',
            '/(\bINSERT\b.*\bINTO\b)/i',
            '/(\bUPDATE\b.*\bSET\b)/i',
            '/(\bDELETE\b.*\bFROM\b)/i',
            '/(\bDROP\b.*\bTABLE\b)/i',
            '/(\bCREATE\b.*\bTABLE\b)/i',
            '/(\bALTER\b.*\bTABLE\b)/i',
            '/(\bEXEC\b.*\b\()/i',
            '/(\bEXECUTE\b.*\b\()/i',
            '/(\bSCRIPT\b.*\b\()/i',
            '/(\bDECLARE\b.*\b\()/i',
            '/(\bCAST\b.*\b\()/i',
            '/(\bCONVERT\b.*\b\()/i',
            '/(\bEXTRACTVALUE\b.*\b\()/i',
            '/(\bUPDATEXML\b.*\b\()/i',
            '/(\bLOAD_FILE\b.*\b\()/i',
            '/(\bINTO\b.*\bOUTFILE\b)/i',
            '/(\bINTO\b.*\bDUMPFILE\b)/i',
            '/(\bBENCHMARK\b.*\b\()/i',
            '/(\bSLEEP\b.*\b\()/i',
            '/(\bWAITFOR\b.*\bDELAY\b)/i',
            '/(\bPG_SLEEP\b.*\b\()/i',
            '/(\bOR\b.*\b1\b.*\b=\b.*\b1\b)/i',
            '/(\bAND\b.*\b1\b.*\b=\b.*\b1\b)/i',
            '/(\bOR\b.*\b\'1\'=\'1\')/i',
            '/(\bAND\b.*\b\'1\'=\'1\')/i',
            '/(\bOR\b.*\b\"1\"=\"1\")/i',
            '/(\bAND\b.*\b\"1\"=\"1\")/i',
        ];
        
        foreach ($patterns as $pattern) {
            $value = preg_replace($pattern, '[FILTERED]', $value);
        }
        
        return $value;
    }

    /**
     * Remove common XSS patterns
     */
    private function removeXssPatterns(string $value): string
    {
        $patterns = [
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi',
            '/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/mi',
            '/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/mi',
            '/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/mi',
            '/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/mi',
            '/<meta\b[^>]*>/i',
            '/<link\b[^>]*>/i',
            '/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/mi',
            '/javascript:/i',
            '/vbscript:/i',
            '/data:text\/html/i',
            '/on\w+\s*=/i',
            '/<img[^>]+src[^>]*>/i',
            '/<svg[^>]*>/i',
            '/<math[^>]*>/i',
        ];
        
        foreach ($patterns as $pattern) {
            $value = preg_replace($pattern, '[FILTERED]', $value);
        }
        
        return $value;
    }
}
