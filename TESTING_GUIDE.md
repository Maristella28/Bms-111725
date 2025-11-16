# URL Sanitization Testing Guide

## 🧪 How to Test URL Sanitization

This guide provides multiple ways to test the URL sanitization system to ensure it's working properly.

## Method 1: Backend API Testing

### Test Endpoints Available

The following test endpoints are available at `/api/test/sanitization/`:

1. **POST `/api/test/sanitization/url`** - Test URL sanitization
2. **POST `/api/test/sanitization/middleware`** - Test middleware sanitization
3. **GET `/api/test/sanitization/malicious`** - Test malicious input detection
4. **GET `/api/test/sanitization/query-params`** - Test query parameter sanitization
5. **POST `/api/test/sanitization/file-upload`** - Test file upload sanitization

### Using cURL Commands

#### Test URL Sanitization
```bash
curl -X POST http://localhost:8000/api/test/sanitization/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "javascript:alert(\"xss\")",
    "path": "../../../etc/passwd",
    "filename": "file<>:\"/\\|?*.txt",
    "email": "user@example.com",
    "phone": "+1-555-123-4567",
    "text": "Hello, World!"
  }'
```

#### Test Malicious Input Detection
```bash
curl -X GET "http://localhost:8000/api/test/sanitization/malicious"
```

#### Test Query Parameter Sanitization
```bash
curl -X GET "http://localhost:8000/api/test/sanitization/query-params?param1=<script>alert('xss')</script>&param2=../../../etc/passwd"
```

#### Test Middleware Sanitization
```bash
curl -X POST http://localhost:8000/api/test/sanitization/middleware \
  -H "Content-Type: application/json" \
  -d '{
    "malicious_input": "<script>alert(\"xss\")</script>",
    "sql_injection": "'; DROP TABLE users; --",
    "directory_traversal": "../../../etc/passwd"
  }'
```

### Using Postman

1. **Create a new request**
2. **Set method to POST**
3. **Set URL to** `http://localhost:8000/api/test/sanitization/url`
4. **Add headers:**
   - `Content-Type: application/json`
   - `Accept: application/json`
5. **Add body (raw JSON):**
```json
{
  "url": "javascript:alert(\"xss\")",
  "path": "../../../etc/passwd",
  "filename": "file<>:\"/\\|?*.txt",
  "email": "user@example.com",
  "phone": "+1-555-123-4567",
  "text": "Hello, World!"
}
```

## Method 2: Frontend Testing

### Using the Test Component

1. **Import the test component** in your React app:
```javascript
import SanitizationTestComponent from './components/SanitizationTestComponent';

function App() {
  return (
    <div>
      <SanitizationTestComponent />
    </div>
  );
}
```

2. **Access the test interface** at `/sanitization-test` (or wherever you place it)

3. **Run tests** using the buttons:
   - **Run Frontend Tests** - Tests all sanitization functions
   - **Test Backend API** - Tests backend endpoints
   - **Test Malicious Input** - Tests malicious input detection
   - **Test Query Params** - Tests query parameter sanitization

### Interactive Testing

Use the interactive input fields to test real-time sanitization:
- **URL Input** - Test URL sanitization with visual feedback
- **Email Input** - Test email validation and sanitization
- **Filename Input** - Test filename sanitization
- **Path Input** - Test path sanitization

## Method 3: Browser Developer Tools

### Test in Console

Open browser developer tools and test in the console:

```javascript
// Test URL sanitization
const testUrl = 'javascript:alert("xss")';
console.log('Original:', testUrl);
console.log('Sanitized:', UrlSanitization.sanitizeUrl(testUrl));

// Test URL validation
const validation = UrlValidation.validateUrl(testUrl);
console.log('Validation:', validation);

// Test malicious patterns
const maliciousInput = '<script>alert("xss")</script>';
console.log('Original:', maliciousInput);
console.log('Sanitized:', UrlSanitization.sanitizeString(maliciousInput));
```

### Test Network Requests

1. **Open Network tab** in developer tools
2. **Make requests** to test endpoints
3. **Check request/response data** for sanitization
4. **Verify** that malicious input is being cleaned

## Method 4: Automated Testing

### Create Test Script

Create a test file `test_sanitization.php`:

```php
<?php
require_once 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\UrlSanitizationService;

echo "=== URL Sanitization Test ===\n\n";

$testCases = [
    'javascript:alert("xss")',
    'data:text/html,<script>alert("xss")</script>',
    'file:///etc/passwd',
    '../../../etc/passwd',
    '<script>alert("xss")</script>',
    "'; DROP TABLE users; --"
];

foreach ($testCases as $testCase) {
    $sanitized = UrlSanitizationService::sanitizeString($testCase);
    echo "Original: {$testCase}\n";
    echo "Sanitized: {$sanitized}\n";
    echo "Modified: " . ($testCase !== $sanitized ? 'YES' : 'NO') . "\n";
    echo "---\n";
}
?>
```

Run the test:
```bash
php test_sanitization.php
```

## Method 5: Integration Testing

### Test with Real Forms

1. **Create a test form** with various input types
2. **Submit malicious data** through the form
3. **Check the backend** to see if data is sanitized
4. **Verify** that sanitized data is stored/processed correctly

### Test File Uploads

1. **Upload files** with malicious names:
   - `file<>:"/\\|?*.txt`
   - `../../../etc/passwd`
   - `file with spaces.txt`
2. **Check** that filenames are sanitized
3. **Verify** that files are saved with clean names

## Method 6: Security Testing

### Test XSS Prevention

Try these XSS payloads:
```html
<script>alert("xss")</script>
<img src="x" onerror="alert('xss')">
<iframe src="javascript:alert('xss')"></iframe>
<object data="javascript:alert('xss')"></object>
<embed src="javascript:alert('xss')"></embed>
```

### Test SQL Injection Prevention

Try these SQL injection payloads:
```sql
'; DROP TABLE users; --
' OR '1'='1
' UNION SELECT * FROM users --
'; INSERT INTO users VALUES ('hacker', 'password'); --
```

### Test Directory Traversal Prevention

Try these directory traversal payloads:
```
../../../etc/passwd
..\\..\\..\\windows\\system32\\drivers\\etc\\hosts
....//....//....//etc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
```

## Expected Results

### ✅ What Should Happen

1. **Malicious URLs** should be cleaned or blocked
2. **XSS patterns** should be removed or encoded
3. **SQL injection** patterns should be filtered
4. **Directory traversal** should be prevented
5. **Control characters** should be removed
6. **Invalid data** should be rejected with proper error messages

### ❌ What Should NOT Happen

1. **Scripts should not execute** in the browser
2. **Database should not be compromised** by SQL injection
3. **System files should not be accessible** via directory traversal
4. **Malicious protocols** should not be allowed
5. **Control characters** should not cause issues

## Troubleshooting

### Common Issues

1. **Middleware not working**: Check if `sanitize` middleware is registered
2. **Sanitization too aggressive**: Adjust patterns in the service
3. **Performance issues**: Use caching for frequently sanitized data
4. **False positives**: Review and adjust validation patterns

### Debug Mode

Enable debug logging:
```php
// In middleware
\Log::debug('Sanitization applied', [
    'original' => $originalValue,
    'sanitized' => $sanitizedValue,
    'was_modified' => $originalValue !== $sanitizedValue
]);
```

### Check Logs

Monitor Laravel logs for sanitization activity:
```bash
tail -f backend/storage/logs/laravel.log
```

## Performance Testing

### Load Testing

1. **Send multiple requests** with malicious input
2. **Monitor response times** to ensure performance
3. **Check memory usage** during sanitization
4. **Verify** that sanitization doesn't cause timeouts

### Stress Testing

1. **Send large payloads** with malicious content
2. **Test with many concurrent requests**
3. **Monitor system resources**
4. **Verify** that sanitization scales properly

## Security Audit

### Regular Testing Schedule

- **Daily**: Automated tests for basic functionality
- **Weekly**: Manual testing of new attack vectors
- **Monthly**: Comprehensive security review
- **Quarterly**: Penetration testing

### Monitoring

- **Set up alerts** for suspicious input patterns
- **Monitor logs** for sanitization events
- **Track performance** metrics
- **Review** sanitization effectiveness

## Conclusion

Regular testing ensures that the URL sanitization system is working correctly and protecting against various security threats. Use multiple testing methods to get comprehensive coverage and confidence in the system's effectiveness.
