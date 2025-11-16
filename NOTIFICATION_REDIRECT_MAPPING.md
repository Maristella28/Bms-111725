# Notification Redirect Mapping - Final Implementation

## ✅ Module-Specific Redirect Mapping

| Notification Type | Example Notification | Redirect Target | Path | Status |
|------------------|---------------------|-----------------|------|--------|
| **Document Request** | "Your Brgy Clearance request is now being processed by our office." | My Document Requests | `/residents/statusDocumentRequests?id={id}&status={status}#request-{id}` | ✅ Implemented |
| **Asset Request** | "Your Asset Request is now being processed. Request #112" | Request Assets | `/residents/statusassetrequests?id={id}#request-{id}` | ✅ Implemented |
| **Dashboard Announcement** | "A new announcement has been posted by the Barangay." | Dashboard → Latest Announcements | `/residents/dashboard?tab=announcements&id={id}#announcement-{id}` | ✅ Implemented |
| **Project Post** | "A new Barangay project has been posted." | Projects | `/residents/projects?id={id}#project-{id}` | ✅ Implemented |
| **My Benefits Update** | "Your benefit claim status has been updated." | My Benefits | `/residents/myBenefits?submission={id}#submission-{id}` | ✅ Implemented |
| **Blotter Appointment** | "You have a scheduled blotter appointment tomorrow." | Blotter Appointment | `/residents/statusBlotterRequests?id={id}#request-{id}` | ✅ Implemented |

## 🔧 Implementation Details

### Backend (`UnifiedNotificationController.php`)

The `getRedirectPath()` method automatically generates redirect paths based on notification data:

```php
// Document Request notifications
if (isset($data['document_request_id']) || $notificationTypeValue === 'document_request_status') {
    $documentRequestId = $data['document_request_id'] ?? null;
    $status = $data['status'] ?? null;
    $path = '/residents/statusDocumentRequests';
    if ($documentRequestId) {
        $path .= '?id=' . $documentRequestId;
        if ($status) {
            $path .= '&status=' . urlencode(strtolower($status));
        }
        $path .= '#request-' . $documentRequestId;
    } elseif ($status) {
        $path .= '?status=' . urlencode(strtolower($status));
    }
    return $path;
}
```

### Frontend (`NotificationBell.jsx` & `Notification.jsx`)

Both components handle notification clicks with:
1. **Mark as read** - Updates notification status
2. **Smooth transition** - Fade-out animation
3. **Navigate** - Redirects to target page
4. **Auto-scroll** - Scrolls to target element using hash fragment
5. **Highlight** - Applies visual highlight animation

## 📋 Example Scenarios

### Scenario 1: Document Request Notification

**Notification:**
```
Your Brgy Clearance request is now being processed by our office.
Brgy Clearance
Status: Processing
```

**Backend Data:**
```json
{
  "type": "document_request_status",
  "document_request_id": 123,
  "status": "processing",
  "document_type": "Brgy Clearance"
}
```

**Redirect Path:**
```
/residents/statusDocumentRequests?id=123&status=processing#request-123
```

**Behavior:**
1. User clicks notification
2. Notification marked as read
3. Navigates to Document Status page
4. Filters to show request #123
5. Scrolls to element with `id="request-123"`
6. Highlights the request for 2 seconds

### Scenario 2: Asset Request Notification

**Notification:**
```
Your Asset Request is now being processed.
Request #112
Status: Processing
```

**Backend Data:**
```json
{
  "type": "asset_request",
  "asset_request_id": 112,
  "status": "processing"
}
```

**Redirect Path:**
```
/residents/statusassetrequests?id=112#request-112
```

**Behavior:**
1. User clicks notification
2. Notification marked as read
3. Navigates to Asset Requests status page
4. Highlights request #112

### Scenario 3: Dashboard Announcement

**Notification:**
```
A new announcement has been posted by the Barangay.
```

**Backend Data:**
```json
{
  "type": "announcement",
  "announcement_id": 456
}
```

**Redirect Path:**
```
/residents/dashboard?tab=announcements&id=456#announcement-456
```

**Behavior:**
1. User clicks notification
2. Notification marked as read
3. Navigates to Dashboard
4. Opens announcements tab
5. Scrolls to specific announcement

## 🎯 Key Features

1. **Automatic Path Generation** - Backend generates redirect paths based on notification type
2. **Query Parameters** - Includes ID and status for filtering
3. **Hash Fragments** - Enables auto-scrolling to specific elements
4. **Smooth Transitions** - Visual feedback during navigation
5. **Element Highlighting** - Draws attention to relevant content
6. **Status Filtering** - Supports filtering by status (processing, approved, etc.)

## 📝 Frontend Page Requirements

For the redirect system to work optimally, target pages should:

1. **Handle Query Parameters:**
   ```javascript
   const { searchParams } = useSearchParams();
   const requestId = searchParams.get('id');
   const status = searchParams.get('status');
   ```

2. **Add ID Attributes:**
   ```jsx
   <div id={`request-${request.id}`} className="request-item">
     {/* Request details */}
   </div>
   ```

3. **Support Hash Navigation:**
   ```javascript
   useEffect(() => {
     const hash = window.location.hash;
     if (hash) {
       const element = document.getElementById(hash.substring(1));
       if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
       }
     }
   }, []);
   ```

4. **Filter by Status (if applicable):**
   ```javascript
   const filteredRequests = requests.filter(req => {
     if (status) return req.status.toLowerCase() === status.toLowerCase();
     return true;
   });
   ```

## ✅ Testing Checklist

- [x] Document request notifications redirect correctly
- [x] Asset request notifications redirect correctly
- [x] Dashboard announcements redirect correctly
- [x] Project notifications redirect correctly
- [x] Benefit update notifications redirect correctly
- [x] Blotter appointment notifications redirect correctly
- [x] Query parameters are included in redirects
- [x] Hash fragments work for element targeting
- [x] Auto-scroll functionality works
- [x] Highlight animation appears correctly
- [x] Notifications are marked as read on click

