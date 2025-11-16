# Document Request 500 Error Fix

## 🐛 **Issue Identified**
The document request submission was failing with a 500 Internal Server Error due to **"Invalid JSON in fields parameter"**.

## 🔍 **Root Cause**
The frontend was sending the `fields` parameter as a JSON string via FormData:
```javascript
formData.append('fields', JSON.stringify(submitFields));
```

However, when FormData is sent to the server, the JSON string gets **HTML-encoded** by the browser:
- `"` becomes `&quot;`
- `'` becomes `&#039;`
- etc.

Example of the problematic data:
```
Original: {"purpose":"postal","name":"Juan Santos Dela Cruz"}
Sent: {&quot;purpose&quot;:&quot;postal&quot;,&quot;name&quot;:&quot;Juan Santos Dela Cruz&quot;}
```

## ✅ **Solution Implemented**

### **Backend Fix (DocumentRequestController.php)**
Enhanced the fields parameter handling to:

1. **Accept both string and array formats**:
   ```php
   'fields' => 'nullable', // Accept JSON string or array from FormData
   ```

2. **Decode HTML entities before JSON parsing**:
   ```php
   if (is_string($validated['fields'])) {
       // Decode HTML entities first (handle &quot; etc.)
       $decodedFields = html_entity_decode($validated['fields'], ENT_QUOTES, 'UTF-8');
       
       // Try to parse as JSON
       $parsedFields = json_decode($decodedFields, true);
       
       if (json_last_error() !== JSON_ERROR_NONE) {
           throw new \InvalidArgumentException('Invalid JSON in fields parameter: ' . json_last_error_msg());
       }
       
       $validated['fields'] = $parsedFields;
   }
   ```

3. **Handle array format directly**:
   ```php
   elseif (is_array($validated['fields'])) {
       // Already an array, no processing needed
   }
   ```

4. **Provide detailed error logging**:
   ```php
   \Log::error('Invalid JSON in fields parameter', [
       'original_fields' => $validated['fields'],
       'decoded_fields' => $decodedFields,
       'json_error' => json_last_error_msg()
   ]);
   ```

## 🧪 **Testing**
Created and ran a test script that confirmed the fix works:

```php
// Test the problematic JSON string
$problematicJson = '{&quot;purpose&quot;:&quot;postal&quot;,&quot;name&quot;:&quot;Juan Santos Dela Cruz&quot;...}';

// Apply the fix
$decodedFields = html_entity_decode($problematicJson, ENT_QUOTES, 'UTF-8');
$parsedFields = json_decode($decodedFields, true);

// Result: Successfully parsed JSON array
```

## 📋 **Files Modified**
- `backend/app/Http/Controllers/DocumentRequestController.php` - Enhanced fields parameter handling

## 🚀 **Expected Result**
Document requests should now submit successfully without the 500 error. The system will:

1. ✅ Accept HTML-encoded JSON strings from FormData
2. ✅ Decode HTML entities properly
3. ✅ Parse JSON successfully
4. ✅ Handle both string and array field formats
5. ✅ Provide detailed error logging for debugging

## 🔄 **Next Steps**
1. Test the document request submission in the frontend
2. Verify that all document types work correctly
3. Monitor logs for any remaining issues
4. Consider adding frontend validation to prevent HTML encoding if needed

The fix is backward compatible and handles both the current HTML-encoded format and any future direct array submissions.
