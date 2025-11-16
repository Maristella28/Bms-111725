<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UrlSanitizationService;

class SanitizationTestController extends Controller
{
    /**
     * Test URL sanitization endpoint
     */
    public function testUrlSanitization(Request $request)
    {
        $testData = $request->validate([
            'url' => 'required|string',
            'path' => 'nullable|string',
            'filename' => 'nullable|string',
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'text' => 'nullable|string',
        ]);

        $results = [];

        // Test URL sanitization
        if (isset($testData['url'])) {
            $results['url'] = [
                'original' => $testData['url'],
                'sanitized' => UrlSanitizationService::sanitizeUrl($testData['url']),
                'was_modified' => $testData['url'] !== UrlSanitizationService::sanitizeUrl($testData['url'])
            ];
        }

        // Test path sanitization
        if (isset($testData['path'])) {
            $results['path'] = [
                'original' => $testData['path'],
                'sanitized' => UrlSanitizationService::sanitizePath($testData['path']),
                'was_modified' => $testData['path'] !== UrlSanitizationService::sanitizePath($testData['path'])
            ];
        }

        // Test filename sanitization
        if (isset($testData['filename'])) {
            $results['filename'] = [
                'original' => $testData['filename'],
                'sanitized' => UrlSanitizationService::sanitizeFilename($testData['filename']),
                'was_modified' => $testData['filename'] !== UrlSanitizationService::sanitizeFilename($testData['filename'])
            ];
        }

        // Test email sanitization
        if (isset($testData['email'])) {
            try {
                $sanitizedEmail = UrlSanitizationService::sanitizeEmail($testData['email']);
                $results['email'] = [
                    'original' => $testData['email'],
                    'sanitized' => $sanitizedEmail,
                    'was_modified' => $testData['email'] !== $sanitizedEmail,
                    'is_valid' => true
                ];
            } catch (\Exception $e) {
                $results['email'] = [
                    'original' => $testData['email'],
                    'error' => $e->getMessage(),
                    'is_valid' => false
                ];
            }
        }

        // Test phone sanitization
        if (isset($testData['phone'])) {
            $results['phone'] = [
                'original' => $testData['phone'],
                'sanitized' => UrlSanitizationService::sanitizePhoneNumber($testData['phone']),
                'was_modified' => $testData['phone'] !== UrlSanitizationService::sanitizePhoneNumber($testData['phone'])
            ];
        }

        // Test slug generation
        if (isset($testData['text'])) {
            $results['slug'] = [
                'original' => $testData['text'],
                'slug' => UrlSanitizationService::generateSlug($testData['text']),
                'was_modified' => $testData['text'] !== UrlSanitizationService::generateSlug($testData['text'])
            ];
        }

        return response()->json([
            'message' => 'Sanitization test completed',
            'results' => $results,
            'timestamp' => now()
        ]);
    }

    /**
     * Test middleware sanitization
     */
    public function testMiddlewareSanitization(Request $request)
    {
        return response()->json([
            'message' => 'Middleware sanitization test',
            'received_data' => $request->all(),
            'query_params' => $request->query(),
            'headers' => $request->headers->all(),
            'timestamp' => now()
        ]);
    }

    /**
     * Test malicious input detection
     */
    public function testMaliciousInput(Request $request)
    {
        $maliciousInputs = [
            'xss_script' => '<script>alert("xss")</script>',
            'javascript_protocol' => 'javascript:alert("xss")',
            'sql_injection' => "'; DROP TABLE users; --",
            'directory_traversal' => '../../../etc/passwd',
            'null_bytes' => "file\x00name.txt",
            'control_chars' => "text\x01\x02\x03text",
            'data_protocol' => 'data:text/html,<script>alert("xss")</script>',
            'file_protocol' => 'file:///etc/passwd',
        ];

        $results = [];
        foreach ($maliciousInputs as $type => $input) {
            $results[$type] = [
                'original' => $input,
                'sanitized' => UrlSanitizationService::sanitizeString($input),
                'was_modified' => $input !== UrlSanitizationService::sanitizeString($input)
            ];
        }

        return response()->json([
            'message' => 'Malicious input test completed',
            'results' => $results,
            'timestamp' => now()
        ]);
    }

    /**
     * Test query parameter sanitization
     */
    public function testQueryParams(Request $request)
    {
        return response()->json([
            'message' => 'Query parameter sanitization test',
            'original_query' => $request->getQueryString(),
            'parsed_params' => $request->query(),
            'sanitized_params' => UrlSanitizationService::sanitizeQueryParams($request->query()),
            'timestamp' => now()
        ]);
    }

    /**
     * Test file upload sanitization
     */
    public function testFileUpload(Request $request)
    {
        $results = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            
            $results['file'] = [
                'original_name' => $originalName,
                'sanitized_name' => UrlSanitizationService::sanitizeFilename($originalName),
                'was_modified' => $originalName !== UrlSanitizationService::sanitizeFilename($originalName),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ];
        }

        return response()->json([
            'message' => 'File upload sanitization test',
            'results' => $results,
            'timestamp' => now()
        ]);
    }
}
