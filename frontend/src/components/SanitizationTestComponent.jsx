import React, { useState } from 'react';
import { useUrlSanitization } from '../hooks/useUrlSanitization';
import UrlSanitizedInput from './UrlSanitizedInput';
import UrlValidation from '../utils/urlValidation';
import UrlEncoding from '../utils/urlEncoding';

const SanitizationTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    sanitizeUrl,
    sanitizePath,
    sanitizeFilename,
    sanitizeString,
    sanitizeEmail,
    sanitizePhoneNumber,
    generateSlug,
    buildSafeUrl,
    isUrlSafe
  } = useUrlSanitization();

  // Test data
  const testCases = {
    urls: [
      'https://example.com/safe-path',
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'file:///etc/passwd',
      'https://example.com/../../../etc/passwd',
      'https://example.com/path with spaces',
      'https://example.com/path%00with%00nulls'
    ],
    paths: [
      '/safe/path/file.txt',
      '../../../etc/passwd',
      'path\\with\\backslashes',
      'path with spaces',
      'path%00with%00nulls',
      'path/with//multiple//slashes'
    ],
    filenames: [
      'safe_file.txt',
      'file<>:"/\\|?*.txt',
      '../../../etc/passwd',
      'file with spaces.txt',
      'file%00with%00nulls.txt',
      'a'.repeat(300) + '.txt'
    ],
    emails: [
      'user@example.com',
      'USER@EXAMPLE.COM',
      'user+tag@example.com',
      'invalid-email',
      'user@',
      '@example.com'
    ],
    phones: [
      '+1-555-123-4567',
      '(555) 123-4567',
      '555.123.4567',
      '555 123 4567',
      '+1 (555) 123-4567 ext. 123',
      '555-123-4567 x123'
    ],
    texts: [
      'Hello World',
      'Hello, World!',
      'Café & Restaurant',
      'Multiple   Spaces',
      'Special@#$%Characters',
      'Very Long Text That Should Be Truncated Because It Exceeds The Maximum Length Limit For Slugs'
    ]
  };

  const runSanitizationTests = () => {
    setIsLoading(true);
    const results = [];

    // Test URL sanitization
    testCases.urls.forEach((url, index) => {
      const sanitized = sanitizeUrl(url);
      const validation = UrlValidation.validateUrl(url);
      
      results.push({
        type: 'URL',
        original: url,
        sanitized: sanitized,
        wasModified: url !== sanitized,
        isValid: validation.isValid,
        isSafe: validation.isSafe,
        errors: validation.errors,
        warnings: validation.warnings
      });
    });

    // Test path sanitization
    testCases.paths.forEach((path, index) => {
      const sanitized = sanitizePath(path);
      
      results.push({
        type: 'Path',
        original: path,
        sanitized: sanitized,
        wasModified: path !== sanitized
      });
    });

    // Test filename sanitization
    testCases.filenames.forEach((filename, index) => {
      const sanitized = sanitizeFilename(filename);
      
      results.push({
        type: 'Filename',
        original: filename,
        sanitized: sanitized,
        wasModified: filename !== sanitized
      });
    });

    // Test email sanitization
    testCases.emails.forEach((email, index) => {
      try {
        const sanitized = sanitizeEmail(email);
        results.push({
          type: 'Email',
          original: email,
          sanitized: sanitized,
          wasModified: email !== sanitized,
          isValid: true
        });
      } catch (error) {
        results.push({
          type: 'Email',
          original: email,
          error: error.message,
          isValid: false
        });
      }
    });

    // Test phone sanitization
    testCases.phones.forEach((phone, index) => {
      const sanitized = sanitizePhoneNumber(phone);
      
      results.push({
        type: 'Phone',
        original: phone,
        sanitized: sanitized,
        wasModified: phone !== sanitized
      });
    });

    // Test slug generation
    testCases.texts.forEach((text, index) => {
      const slug = generateSlug(text);
      
      results.push({
        type: 'Slug',
        original: text,
        slug: slug,
        wasModified: text !== slug
      });
    });

    setTestResults(results);
    setIsLoading(false);
  };

  const testBackendAPI = async () => {
    setIsLoading(true);
    
    try {
      const testData = {
        url: 'javascript:alert("xss")',
        path: '../../../etc/passwd',
        filename: 'file<>:"/\\|?*.txt',
        email: 'user@example.com',
        phone: '+1-555-123-4567',
        text: 'Hello, World!'
      };

      const response = await fetch('/api/test/sanitization/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      setTestResults(prev => [...prev, {
        type: 'Backend API Test',
        result: result,
        timestamp: new Date().toISOString()
      }]);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'Backend API Test',
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    
    setIsLoading(false);
  };

  const testMaliciousInput = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/test/sanitization/malicious');
      const result = await response.json();
      
      setTestResults(prev => [...prev, {
        type: 'Malicious Input Test',
        result: result,
        timestamp: new Date().toISOString()
      }]);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'Malicious Input Test',
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    
    setIsLoading(false);
  };

  const testQueryParams = async () => {
    setIsLoading(true);
    
    try {
      const maliciousParams = '?param1=<script>alert("xss")</script>&param2=../../../etc/passwd&param3=javascript:alert("xss")';
      const response = await fetch(`/api/test/sanitization/query-params${maliciousParams}`);
      const result = await response.json();
      
      setTestResults(prev => [...prev, {
        type: 'Query Params Test',
        result: result,
        timestamp: new Date().toISOString()
      }]);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'Query Params Test',
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">URL Sanitization Test Suite</h1>
      
      {/* Test Controls */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={runSanitizationTests}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Running...' : 'Run Frontend Tests'}
          </button>
          
          <button
            onClick={testBackendAPI}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Backend API'}
          </button>
          
          <button
            onClick={testMaliciousInput}
            disabled={isLoading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Malicious Input'}
          </button>
          
          <button
            onClick={testQueryParams}
            disabled={isLoading}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Query Params'}
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Interactive Test Inputs */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Interactive Tests</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Test URL Input:</label>
            <UrlSanitizedInput
              type="url"
              sanitizationType="url"
              placeholder="Enter a URL to test..."
              showSanitizationInfo={true}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Test Email Input:</label>
            <UrlSanitizedInput
              type="email"
              sanitizationType="email"
              placeholder="Enter an email to test..."
              showSanitizationInfo={true}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Test Filename Input:</label>
            <UrlSanitizedInput
              type="text"
              sanitizationType="filename"
              placeholder="Enter a filename to test..."
              showSanitizationInfo={true}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Test Path Input:</label>
            <UrlSanitizedInput
              type="text"
              sanitizationType="path"
              placeholder="Enter a path to test..."
              showSanitizationInfo={true}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Run some tests to see results.</p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{result.type}</h3>
                  {result.timestamp && (
                    <span className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleString()}</span>
                  )}
                </div>
                
                {result.error ? (
                  <div className="text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                ) : result.result ? (
                  <div className="bg-gray-50 p-3 rounded">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <strong>Original:</strong> 
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                        {result.original}
                      </code>
                    </div>
                    
                    {result.sanitized && (
                      <div>
                        <strong>Sanitized:</strong> 
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                          {result.sanitized}
                        </code>
                      </div>
                    )}
                    
                    {result.slug && (
                      <div>
                        <strong>Slug:</strong> 
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                          {result.slug}
                        </code>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      {result.wasModified !== undefined && (
                        <span className={`px-2 py-1 rounded text-sm ${
                          result.wasModified ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {result.wasModified ? 'Modified' : 'No changes'}
                        </span>
                      )}
                      
                      {result.isValid !== undefined && (
                        <span className={`px-2 py-1 rounded text-sm ${
                          result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.isValid ? 'Valid' : 'Invalid'}
                        </span>
                      )}
                      
                      {result.isSafe !== undefined && (
                        <span className={`px-2 py-1 rounded text-sm ${
                          result.isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.isSafe ? 'Safe' : 'Unsafe'}
                        </span>
                      )}
                    </div>
                    
                    {result.errors && result.errors.length > 0 && (
                      <div>
                        <strong>Errors:</strong>
                        <ul className="list-disc list-inside ml-4 text-red-600">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.warnings && result.warnings.length > 0 && (
                      <div>
                        <strong>Warnings:</strong>
                        <ul className="list-disc list-inside ml-4 text-yellow-600">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SanitizationTestComponent;
