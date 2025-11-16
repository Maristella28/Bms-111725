# 🚩 Record Flagging System - Implementation Guide

## Overview

The **Record Flagging System** automatically tags resident records as "For Review" when no update or login activity is detected within one year. This helps administrators identify and maintain records that may need verification or updates.

---

## ✨ Features

### 1. **Automatic Flagging**
- **Scheduled Commands**: Runs daily at 01:00 and 02:00 to check resident activity
- **Criteria**: Flags records with no activity (login or update) for 12+ months
- **Smart Detection**: Considers both `last_modified` (resident record) and `last_activity_at` (user login)

### 2. **Manual Flagging**
- Administrators can manually flag/unflag individual residents
- Bulk flagging operations for multiple residents
- Optional notes when flagging records

### 3. **Statistics & Reporting**
- Dashboard showing total flagged records
- Breakdown by inactivity period (1-2 years, 2+ years, never active)
- Percentage of flagged records

### 4. **API Endpoints**
- View all flagged residents
- Get flagging statistics
- Toggle flag status for individual residents
- Bulk flag/unflag operations

---

## 🗂️ Database Structure

### Fields Used

| Model/Table | Field | Type | Description |
|-------------|-------|------|-------------|
| `residents` | `for_review` | boolean | Flag indicating record needs review |
| `residents` | `last_modified` | datetime | Last time resident record was updated |
| `users` | `last_activity_at` | datetime | Last login/activity timestamp |
| `users` | `residency_status` | string | Status: active, for_review, inactive, deceased, relocated |
| `users` | `status_notes` | string | Notes about status changes |
| `users` | `status_updated_by` | integer | User ID who updated the status |

---

## 🔧 Backend Implementation

### 1. Console Commands

#### CheckResidentsForReview
```bash
php artisan residents:check-review [--chunk=100]
```

**What it does:**
- Checks all residents in batches
- Compares `last_modified` and user's `updated_at`
- Flags residents with 12+ months of inactivity
- Runs automatically daily at 01:00

**Location:** `backend/app/Console/Commands/CheckResidentsForReview.php`

#### CheckInactiveUsers
```bash
php artisan users:check-inactive [--dry-run]
```

**What it does:**
- Finds users inactive for 1+ year
- Updates `residency_status` to 'for_review'
- Logs activity changes
- Runs automatically daily at 02:00

**Location:** `backend/app/Console/Commands/CheckInactiveUsers.php`

---

### 2. API Endpoints

#### Get Flagged Residents
```
GET /api/admin/residents/flagged-for-review
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "residents": [
    {
      "id": 123,
      "resident_id": "RES-2024-001",
      "full_name": "John Doe",
      "email": "john@example.com",
      "for_review": true,
      "inactive_days": 450,
      "inactive_months": 15,
      "last_activity_at": "2023-01-15T10:30:00.000000Z",
      "residency_status": "for_review",
      "status_notes": "Automatically flagged due to inactivity"
    }
  ]
}
```

#### Get Review Statistics
```
GET /api/admin/residents/review-statistics
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_residents": 1000,
    "flagged_for_review": 50,
    "active_residents": 950,
    "inactive_1_to_2_years": 20,
    "inactive_over_2_years": 15,
    "never_active": 10,
    "flagged_percentage": 5.0
  }
}
```

#### Toggle Review Flag (Individual)
```
POST /api/admin/residents/{id}/toggle-review-flag
```

**Request Body:**
```json
{
  "for_review": true,
  "notes": "Manual review needed - address verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resident flagged for review successfully",
  "resident": { /* updated resident data */ }
}
```

#### Bulk Flag Residents
```
POST /api/admin/residents/bulk-flag-for-review
```

**Request Body:**
```json
{
  "resident_ids": [1, 2, 3, 4, 5],
  "for_review": true,
  "notes": "Bulk flagged for annual verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated 5 residents",
  "updated_count": 5
}
```

---

### 3. Model Methods

#### User Model
```php
// Check if user is inactive (no activity for 1 year)
$user->isInactive(); // Returns boolean

// Check if user needs review
$user->needsReview(); // Returns boolean

// Update residency status
$user->updateResidencyStatus('for_review', 'Notes here', $adminId);
```

#### Resident Model
```php
// Check for_review flag
$resident->for_review; // boolean

// Get last modification date
$resident->last_modified; // Carbon instance
```

---

## 📊 Test Data Injection

### Running the Seeder

```bash
# Via Artisan
php artisan db:seed --class=InactiveRecordsSeeder

# Via Manual Script
php backend/inject_inactive_records.php
```

### Test Scenarios Created

The seeder creates 12 test scenarios:

| Scenario | Email | Last Activity | Expected Flag |
|----------|-------|---------------|---------------|
| Active User | john.active@test.com | 3 months ago | ❌ No |
| Approaching Threshold | sarah.almost@test.com | 11 months ago | ❌ No |
| At Threshold | mike.threshold@test.com | 12 months ago | ✅ Yes |
| Inactive 13 Months | emma.inactive@test.com | 13 months ago | ✅ Yes |
| Very Inactive | david.longago@test.com | 18 months ago | ✅ Yes |
| No Login, Recent Update | lisa.updated@test.com | Record: 1 month | ❌ No |
| Recent Login, Old Record | tom.logged@test.com | Login: 15 days | ❌ No |
| Never Active | never.active@test.com | null | ✅ Yes |
| Ancient User | robert.ancient@test.com | 3 years ago | ✅ Yes |
| Previously Flagged | maria.flagged@test.com | 15 months ago | ✅ Yes |
| Relocated | carlos.relocated@test.com | 2 years ago | ❌ No (status: relocated) |
| Deceased | anna.deceased@test.com | 2 years ago | ❌ No (status: deceased) |

---

## 🎨 Frontend Implementation

### Display Flagged Records Badge

Add a badge to the residents table:

```jsx
{resident.for_review && (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
    <AlertCircle className="w-3 h-3 mr-1" />
    For Review
  </span>
)}
```

### Filter Flagged Records

Add a filter option:

```jsx
<select onChange={(e) => setReviewFilter(e.target.value)}>
  <option value="all">All Records</option>
  <option value="flagged">For Review</option>
  <option value="active">Active Only</option>
</select>
```

### Statistics Dashboard

```jsx
const [stats, setStats] = useState(null);

useEffect(() => {
  const fetchStats = async () => {
    const response = await api.get('/admin/residents/review-statistics');
    setStats(response.data.statistics);
  };
  fetchStats();
}, []);

return (
  <div className="grid grid-cols-3 gap-4">
    <StatCard 
      title="Flagged for Review"
      value={stats?.flagged_for_review}
      percentage={stats?.flagged_percentage}
      color="orange"
    />
    <StatCard 
      title="Active Residents"
      value={stats?.active_residents}
      color="green"
    />
    <StatCard 
      title="Never Active"
      value={stats?.never_active}
      color="red"
    />
  </div>
);
```

### Manual Flag Toggle

```jsx
const toggleReviewFlag = async (residentId, forReview) => {
  try {
    await api.post(`/admin/residents/${residentId}/toggle-review-flag`, {
      for_review: forReview,
      notes: 'Manual review flag toggle by admin'
    });
    
    toast.success(`Resident ${forReview ? 'flagged' : 'unflagged'} successfully`);
    refreshResidents();
  } catch (error) {
    toast.error('Failed to update review flag');
  }
};
```

---

## 🔄 Scheduled Tasks

The flagging system runs automatically via Laravel's task scheduler.

### Schedule Configuration

**File:** `backend/app/Console/Kernel.php`

```php
protected function schedule(Schedule $schedule)
{
    // Check residents for review - Daily at 01:00
    $schedule->command('residents:check-review')
        ->dailyAt('01:00')
        ->withoutOverlapping();

    // Check inactive users - Daily at 02:00
    $schedule->command('users:check-inactive')
        ->dailyAt('02:00')
        ->withoutOverlapping();
}
```

### Running the Scheduler

**Development:**
```bash
php artisan schedule:work
```

**Production (Cron Job):**
```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🧪 Testing

### Manual Testing

1. **Inject Test Data:**
   ```bash
   php backend/inject_inactive_records.php
   ```

2. **Run Flagging Command:**
   ```bash
   php artisan residents:check-review
   ```

3. **Verify Results:**
   ```bash
   php artisan tinker
   
   # Check flagged count
   \App\Models\Resident::where('for_review', true)->count()
   
   # View flagged residents
   \App\Models\Resident::where('for_review', true)->with('user')->get()
   ```

### API Testing

**Using cURL:**

```bash
# Get flagged residents
curl -X GET http://localhost:8000/api/admin/residents/flagged-for-review \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get statistics
curl -X GET http://localhost:8000/api/admin/residents/review-statistics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Toggle flag
curl -X POST http://localhost:8000/api/admin/residents/1/toggle-review-flag \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"for_review": true, "notes": "Test flag"}'
```

---

## 📈 Performance Considerations

### Optimization Tips

1. **Chunking**: The command processes residents in chunks (default: 100) to avoid memory issues
2. **Indexing**: Ensure database indexes on:
   - `residents.for_review`
   - `residents.last_modified`
   - `users.last_activity_at`
3. **Caching**: Consider caching statistics for dashboard display
4. **Pagination**: Use pagination when displaying flagged residents in UI

### Database Queries

```sql
-- Add indexes for performance
CREATE INDEX idx_residents_for_review ON residents(for_review);
CREATE INDEX idx_residents_last_modified ON residents(last_modified);
CREATE INDEX idx_users_last_activity ON users(last_activity_at);
```

---

## 🔐 Security & Permissions

### Permission Requirements

- All flagging endpoints require `residentsRecords` module permission
- Only admin and authorized staff can access flagging features
- Activity logging tracks all manual flag changes

### Activity Logging

All flag changes are logged:

```php
ActivityLogService::log(
    'resident_review_flag_toggle',
    $resident,
    ['for_review' => $oldStatus],
    ['for_review' => $newStatus],
    "Resident flagged by admin"
);
```

---

## 🎯 Best Practices

### 1. Regular Review
- Review flagged records monthly
- Update or verify resident information
- Remove flags when records are updated

### 2. Communication
- Notify residents when flagged (optional feature)
- Provide clear instructions for verification
- Set up automated email reminders

### 3. Data Quality
- Encourage regular profile updates
- Implement self-service profile updates
- Track update history

### 4. Exclusions
- Deceased residents are not flagged
- Relocated residents are not flagged
- Already flagged residents are skipped

---

## 🐛 Troubleshooting

### Common Issues

**1. Command not running:**
```bash
# Check scheduler status
php artisan schedule:list

# Test command manually
php artisan residents:check-review --chunk=10
```

**2. No residents flagged:**
```bash
# Check test data
SELECT COUNT(*) FROM residents WHERE last_modified < DATE_SUB(NOW(), INTERVAL 12 MONTH);

# Check user activity
SELECT COUNT(*) FROM users WHERE last_activity_at < DATE_SUB(NOW(), INTERVAL 12 MONTH);
```

**3. API returns empty:**
```bash
# Verify database
SELECT * FROM residents WHERE for_review = 1;

# Check API route
php artisan route:list | grep flagged
```

---

## 📚 Related Documentation

- [STAFF_PERMISSIONS_FIX.md](STAFF_PERMISSIONS_FIX.md) - Permission system
- [ACTIVITY_LOGS.md](backend/CERTIFICATION_SYSTEM.md) - Activity logging
- [RESIDENT_VERIFICATION.md](EDIT_FUNCTIONALITY_FIX_SUMMARY.md) - Resident verification

---

## 🎁 Summary

The Flagging System provides:
- ✅ Automatic detection of inactive records
- ✅ Manual flagging capabilities
- ✅ Comprehensive statistics and reporting
- ✅ Bulk operations support
- ✅ Activity logging for audit trails
- ✅ Performance optimized queries
- ✅ Test data for development

**Next Steps:**
1. Run the seeder to inject test data
2. Execute the flagging command
3. View results in the admin dashboard
4. Implement frontend UI enhancements
5. Set up production cron job for scheduler

For questions or issues, refer to the troubleshooting section above.

