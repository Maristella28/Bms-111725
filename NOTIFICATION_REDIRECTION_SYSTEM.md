# Notification Redirection System

## Overview

This system automatically redirects residents to relevant pages when they click on notifications, with support for auto-scrolling and highlighting specific items.

## Implementation Details

### Backend (`UnifiedNotificationController.php`)

The `getRedirectPath()` method maps notification types to their corresponding pages:

| Notification Type | Redirect Target | Query Parameters | Hash Fragment |
|-----------------|----------------|------------------|---------------|
| **Document Requests** | `/residents/statusDocumentRequests` | `?id={document_request_id}` | `#request-{id}` |
| **Asset Requests** | `/residents/statusassetrequests` | `?id={asset_request_id}` | `#request-{id}` |
| **Asset Payments** | `/residents/statusassetrequests` | `?id={asset_request_id}` | `#request-{id}` |
| **Blotter Requests** | `/residents/statusBlotterRequests` | `?id={blotter_request_id}` | `#request-{id}` |
| **Blotter Appointments** | `/residents/blotterAppointment` | `?id={appointment_id}` | `#appointment-{id}` |
| **Dashboard Announcements** | `/residents/dashboard` | `?section=announcements&id={announcement_id}` | `#announcement-{id}` |
| **Program Announcements** | `/residents/dashboard` | `?section=programs&announcement={id}` | `#announcement-{id}` |
| **Available Programs** | `/residents/dashboard` | `?section=programs&program={program_id}` | `#program-{id}` |
| **Projects** | `/residents/projects` | `?id={project_id}` | `#project-{id}` |
| **My Benefits** | `/residents/myBenefits` | `?submission={submission_id}` or `?benefit={benefit_id}` | `#submission-{id}` or `#benefit-{id}` |

### Frontend Components

#### `NotificationBell.jsx` & `Notification.jsx`

Both components now:
1. **Mark notifications as read** when clicked
2. **Navigate to the redirect path** from the backend
3. **Auto-scroll to the target element** using hash fragments
4. **Apply highlight animation** to draw attention to the relevant item

### Highlight Effect

The system includes a CSS animation (`notification-highlight`) that:
- Adds a green outline around the target element
- Applies a subtle background color
- Pulses for 2 seconds before fading out
- Provides smooth visual feedback

## Notification Data Structure

Notifications should include the following fields:

```json
{
  "id": "notification-id",
  "type": "document_request_status",
  "title": "Document Request Update",
  "message": "Your Barangay Clearance request is now being processed.",
  "data": {
    "document_request_id": 123,
    "document_type": "Barangay Clearance",
    "status": "processing"
  },
  "redirect_path": "/residents/statusDocumentRequests?id=123#request-123",
  "is_read": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Usage Examples

### Example 1: Document Request Notification
```php
// Backend notification data
$data = [
    'type' => 'document_request_status',
    'document_request_id' => 123,
    'status' => 'processing',
    'message' => 'Your Barangay Clearance request is now being processed.'
];

// Auto-generated redirect_path: 
// /residents/statusDocumentRequests?id=123#request-123
```

### Example 2: Dashboard Announcement
```php
// Backend notification data
$data = [
    'type' => 'announcement',
    'announcement_id' => 456,
    'message' => 'A new announcement has been posted by the Barangay.'
];

// Auto-generated redirect_path:
// /residents/dashboard?section=announcements&id=456#announcement-456
```

### Example 3: Program Announcement
```php
// Backend notification data
$data = [
    'type' => 'program_announcement',
    'program_announcement_id' => 789,
    'program_id' => 10,
    'message' => 'New livelihood program is now open for registration.'
];

// Auto-generated redirect_path:
// /residents/dashboard?section=programs&announcement=789#announcement-789
```

## Frontend Page Requirements

For the auto-scroll and highlight features to work, target pages should:

1. **Add ID attributes** to elements that need to be highlighted:
   ```jsx
   <div id={`request-${requestId}`} className="request-item">
     {/* Request details */}
   </div>
   ```

2. **Handle query parameters** to filter/highlight specific items:
   ```jsx
   const { searchParams } = useSearchParams();
   const requestId = searchParams.get('id');
   ```

3. **Support hash fragments** for direct navigation:
   ```jsx
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

## Testing Checklist

- [ ] Document request notifications redirect correctly
- [ ] Asset request notifications redirect correctly
- [ ] Blotter request notifications redirect correctly
- [ ] Dashboard announcements redirect correctly
- [ ] Program announcements redirect correctly
- [ ] Project notifications redirect correctly
- [ ] Benefit update notifications redirect correctly
- [ ] Auto-scroll works on all target pages
- [ ] Highlight animation appears and fades correctly
- [ ] Notifications are marked as read on click
- [ ] Query parameters are preserved in redirects
- [ ] Hash fragments work for element targeting

## Future Enhancements

1. Add support for deep linking to specific sections within pages
2. Implement notification grouping by type
3. Add notification preferences for redirect behavior
4. Support for custom redirect actions per notification type
5. Analytics tracking for notification click-through rates

