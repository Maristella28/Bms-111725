# URL Sanitization System Guide

## Overview

This system provides comprehensive URL sanitization and validation for both frontend (React) and backend (Laravel) components. It protects against XSS attacks, SQL injection, directory traversal, and other security vulnerabilities.

## Backend Implementation (Laravel)

### 1. Middleware Registration

The sanitization middleware is automatically registered in `app/Http/Kernel.php`:

```php
'sanitize' => \App\Http\Middleware\SanitizeInput::class,
```

### 2. Route Protection

Add sanitization middleware to your routes:

```php
// Protect specific routes
Route::middleware(['auth:sanctum', 'sanitize'])->group(function () {
    Route::post('/api/data', [Controller::class, 'store']);
});

// Protect route groups
Route::prefix('admin')->middleware(['auth:sanctum', 'admin', 'sanitize'])->group(function () {
    // Admin routes
});
```

### 3. Service Usage

Use the `UrlSanitizationService` for manual sanitization:

```php
use App\Services\UrlSanitizationService;

// Sanitize URLs
$cleanUrl = UrlSanitizationService::sanitizeUrl($userInput);

// Sanitize file paths
$cleanPath = UrlSanitizationService::sanitizePath($userPath);

// Sanitize filenames
$cleanFilename = UrlSanitizationService::sanitizeFilename($userFilename);

// Sanitize emails
$cleanEmail = UrlSanitizationService::sanitizeEmail($userEmail);

// Generate slugs
$slug = UrlSanitizationService::generateSlug($title);
```

## Frontend Implementation (React)

### 1. Basic Usage

```javascript
import UrlSanitization from './utils/urlSanitization';

// Sanitize URLs
const cleanUrl = UrlSanitization.sanitizeUrl(userInput);

// Sanitize paths
const cleanPath = UrlSanitization.sanitizePath(userPath);

// Build safe URLs
const safeUrl = UrlSanitization.buildSafeUrl('https://example.com', {
    param1: 'value1',
    param2: 'value with spaces'
});
```

### 2. React Hook Usage

```javascript
import { useUrlSanitization } from './hooks/useUrlSanitization';

function MyComponent() {
    const { sanitizeUrl, sanitizeString, buildSafeUrl } = useUrlSanitization();
    
    const handleSubmit = (data) => {
        const sanitizedData = {
            url: sanitizeUrl(data.url),
            description: sanitizeString(data.description)
        };
        
        // Submit sanitized data
    };
}
```

### 3. Sanitized Input Component

```javascript
import UrlSanitizedInput from './components/UrlSanitizedInput';

function MyForm() {
    const [formData, setFormData] = useState({});
    
    return (
        <form>
            <UrlSanitizedInput
                type="url"
                sanitizationType="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                onSanitizedChange={(e) => {
                    // e.target.value contains the sanitized value
                    console.log('Sanitized URL:', e.target.value);
                }}
                placeholder="Enter website URL"
                showSanitizationInfo={true}
            />
            
            <UrlSanitizedInput
                type="email"
                sanitizationType="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
            />
        </form>
    );
}
```

### 4. URL Validation

```javascript
import UrlValidation from './utils/urlValidation';

// Validate URLs
const validation = UrlValidation.validateUrl(userUrl);
if (!validation.isSafe) {
    console.error('Unsafe URL:', validation.errors);
}

// Validate against domain whitelist
const allowedDomains = ['example.com', 'trusted-site.com'];
const validation = UrlValidation.validateUrlAgainstWhitelist(userUrl, allowedDomains);

// Validate redirect URLs
const validation = UrlValidation.validateRedirectUrl(redirectUrl, 'example.com');
```

### 5. URL Encoding/Decoding

```javascript
import UrlEncoding from './utils/urlEncoding';

// Encode/decode components
const encoded = UrlEncoding.encodeComponent('Hello World!');
const decoded = UrlEncoding.decodeComponent(encoded);

// Build URLs with parameters
const url = UrlEncoding.buildUrlWithParams('https://example.com', {
    search: 'hello world',
    page: 1
});

// Parse URL parameters
const params = UrlEncoding.parseUrlParams('https://example.com?search=hello&page=1');
```

## Security Features

### 1. XSS Protection
- Removes `<script>`, `<iframe>`, and other dangerous HTML tags
- Strips `javascript:`, `vbscript:`, and `data:` protocols
- HTML entity encodes user input

### 2. SQL Injection Protection
- Removes common SQL injection patterns
- Strips UNION, SELECT, INSERT, UPDATE, DELETE keywords
- Removes comment patterns (`--`, `/*`, `*/`)

### 3. Directory Traversal Protection
- Removes `../`, `..\\`, `./`, `.\\` patterns
- Normalizes path separators
- Prevents access to system files

### 4. Control Character Removal
- Strips null bytes (`\0`)
- Removes control characters (0x00-0x1F, 0x7F)
- Preserves newlines and tabs for readability

### 5. Protocol Validation
- Blocks dangerous protocols (file:, ftp:, gopher:, etc.)
- Validates URL format
- Checks for suspicious patterns

## Configuration Options

### Backend Configuration

You can customize the sanitization behavior by modifying the middleware:

```php
// In SanitizeInput middleware
private function sanitizeString($value): string
{
    // Add custom sanitization logic here
    $value = $this->removeCustomPatterns($value);
    
    return $value;
}
```

### Frontend Configuration

Customize validation rules in the validation utilities:

```javascript
// In urlValidation.js
static validateUrl(url) {
    // Add custom validation logic
    const customValidation = this.checkCustomRules(url);
    
    return {
        ...baseValidation,
        customCheck: customValidation
    };
}
```

## Testing

The system includes comprehensive tests for:

- URL sanitization
- Path sanitization
- Filename sanitization
- Email validation
- Phone number formatting
- Slug generation
- IP address validation
- Query parameter sanitization

## Best Practices

### 1. Always Sanitize User Input
```javascript
// ❌ Don't do this
const url = userInput;

// ✅ Do this
const url = UrlSanitization.sanitizeUrl(userInput);
```

### 2. Validate Before Processing
```javascript
// ✅ Validate first
const validation = UrlValidation.validateUrl(url);
if (!validation.isSafe) {
    throw new Error('Unsafe URL detected');
}
```

### 3. Use Appropriate Sanitization Types
```javascript
// ✅ Use specific sanitization
<UrlSanitizedInput sanitizationType="email" />
<UrlSanitizedInput sanitizationType="url" />
<UrlSanitizedInput sanitizationType="filename" />
```

### 4. Handle Sanitization Errors
```javascript
// ✅ Handle errors gracefully
try {
    const cleanEmail = UrlSanitization.sanitizeEmail(userEmail);
} catch (error) {
    console.error('Invalid email format:', error.message);
    // Show user-friendly error message
}
```

### 5. Log Security Events
```php
// ✅ Log sanitization events
\Log::info('URL sanitized', [
    'original' => $originalUrl,
    'sanitized' => $sanitizedUrl,
    'user_id' => auth()->id()
]);
```

## Troubleshooting

### Common Issues

1. **Middleware not applying**: Ensure middleware is registered in `Kernel.php`
2. **Sanitization too aggressive**: Adjust patterns in the sanitization service
3. **Performance issues**: Use caching for frequently sanitized data
4. **False positives**: Review and adjust validation patterns

### Debug Mode

Enable debug logging to see sanitization details:

```php
// In middleware
\Log::debug('Sanitization applied', [
    'original' => $originalValue,
    'sanitized' => $sanitizedValue,
    'was_modified' => $originalValue !== $sanitizedValue
]);
```

## Updates and Maintenance

- Regularly update sanitization patterns
- Monitor security advisories for new attack vectors
- Test with new input patterns
- Review and update validation rules

## Support

For issues or questions about the URL sanitization system:

1. Check the test results for expected behavior
2. Review the sanitization patterns
3. Check middleware registration
4. Verify route protection is applied
