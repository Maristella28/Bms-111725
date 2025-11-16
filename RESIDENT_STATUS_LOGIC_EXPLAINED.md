# 📋 Resident Status Classification Logic

## Overview
The system uses a **time-based classification** to automatically categorize residents based on when their records were last updated. This helps identify which records need attention.

---

## 🏷️ Status Categories

### 1. ✅ **ACTIVE**
**Definition**: Recently updated records that are current and up-to-date.

**Logic**:
```php
if ($months < 6) {
    $updateStatus = 'Active';
}
```

**Criteria**:
- Last updated **less than 6 months ago**
- Record is considered current and reliable
- No immediate action needed

**Example**:
- Today: October 24, 2025
- Last Updated: May 1, 2025 (5 months ago)
- **Status: ACTIVE** ✅

**Filter Query**:
```php
$query->where('last_modified', '>=', now()->subMonths(6));
```

---

### 2. ⏰ **OUTDATED**
**Definition**: Records that are getting old but not yet critical.

**Logic**:
```php
elseif ($months < 12) {
    $updateStatus = 'Outdated';
}
```

**Criteria**:
- Last updated **between 6 and 12 months ago**
- Record is aging and should be updated soon
- Moderate priority for review

**Example**:
- Today: October 24, 2025
- Last Updated: February 1, 2025 (8 months ago)
- **Status: OUTDATED** ⏰

**Filter Query**:
```php
$query->whereBetween('last_modified', [
    now()->subMonths(12),
    now()->subMonths(6)
]);
```

---

### 3. ⚠️ **NEEDS VERIFICATION**
**Definition**: Critical - records that are very old or have never been updated.

**Logic**:
```php
if ($months === null) {
    $updateStatus = 'Needs Verification';
} else if ($months >= 12) {
    $updateStatus = 'Needs Verification';
}
```

**Criteria**:
- **Option A**: Never been updated (`last_modified` is NULL)
- **Option B**: Last updated **12 months ago or more**
- High priority - requires immediate attention
- Data may be unreliable or outdated

**Examples**:

**Case 1 - Never Updated**:
- Last Updated: NULL (never updated)
- **Status: NEEDS VERIFICATION** ⚠️

**Case 2 - Very Old**:
- Today: October 24, 2025
- Last Updated: August 1, 2024 (14 months ago)
- **Status: NEEDS VERIFICATION** ⚠️

**Filter Query**:
```php
$query->where(function($q) use ($now) {
    $q->whereNull('last_modified')
      ->orWhere('last_modified', '<', now()->subMonths(12));
});
```

---

### 4. 👁️ **FOR REVIEW**
**Definition**: Special flag for residents with no activity (independent of update status).

**Logic**:
```php
private function checkAndFlagForReview(Resident $resident)
{
    $now = now();
    $lastModified = $resident->last_modified;
    $lastLogin = $resident->user->has_logged_in 
        ? $resident->user->updated_at 
        : null;

    // Take the most recent activity
    $lastActivity = max($lastModified, $lastLogin) ?? $lastModified ?? $lastLogin;
    
    if (!$lastActivity || $lastActivity->diffInMonths($now) >= 12) {
        $resident->for_review = true;
    } else {
        $resident->for_review = false;
    }
}
```

**Criteria**:
- **No activity (record update OR user login) in the last 12 months**
- This is a DATABASE FIELD, not calculated on-the-fly
- Helps identify potentially inactive or abandoned accounts
- Can overlap with other statuses

**Key Difference**: 
- This checks **both** profile updates AND user login activity
- Other statuses only check when the record was last modified

**Example**:
- Today: October 24, 2025
- Last Record Update: March 1, 2025 (7 months - would be "Active")
- Last User Login: January 1, 2024 (21 months ago)
- Combined Activity: 21 months (uses oldest = no activity)
- **Status: FOR REVIEW** 👁️ (Database flag set to TRUE)

**Filter Query**:
```php
$query->where('for_review', true);
```

---

## 📊 Status Priority & Timeline

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    TIMELINE (Months Since Last Update)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        0          3          6          9          12         15
        ├──────────┼──────────┼──────────┼──────────┼──────────┤
        │                     │                     │
        │    ✅ ACTIVE        │   ⏰ OUTDATED      │  ⚠️ NEEDS
        │   (0-6 months)      │  (6-12 months)     │  VERIFICATION
        │                     │                     │  (12+ months)
        └─────────────────────┴─────────────────────┴──────────────>
        
        👁️ FOR REVIEW: Flagged if no activity (update OR login) >= 12 months
```

---

## 🔄 How Status is Calculated

### During Data Fetch (Real-time Calculation)
```php
// In ResidentController@index()
$processedResidents = $residents->map(function ($resident) use ($now) {
    $lastUpdated = $resident->updated_at;
    $months = $lastUpdated ? $now->diffInMonths($lastUpdated) : null;

    // Calculate status
    if ($months === null) {
        $updateStatus = 'Needs Verification';
    } elseif ($months < 6) {
        $updateStatus = 'Active';
    } elseif ($months < 12) {
        $updateStatus = 'Outdated';
    } else {
        $updateStatus = 'Needs Verification';
    }

    return array_merge($resident->toArray(), [
        'update_status' => $updateStatus,
        'for_review' => (bool) $resident->for_review, // From database
    ]);
});
```

### For Review Flag (Stored in Database)
```php
// Triggered periodically or on-demand
public function batchCheckReviewStatus()
{
    $residents = Resident::with('user')->get();
    
    foreach ($residents as $resident) {
        $this->checkAndFlagForReview($resident);
    }
}
```

---

## 🎯 Business Rules Summary

| Status | Time Range | Priority | Action Needed |
|--------|------------|----------|---------------|
| ✅ **Active** | 0-6 months | Low | None - current data |
| ⏰ **Outdated** | 6-12 months | Medium | Should update soon |
| ⚠️ **Needs Verification** | 12+ months or NULL | High | Urgent - verify data |
| 👁️ **For Review** | No activity 12+ months | Critical | May be inactive/moved |

---

## 💡 Key Insights

### 1. **Automated Classification**
- Statuses are calculated automatically based on timestamps
- No manual classification needed
- Updates in real-time when data is fetched

### 2. **Two-Dimensional System**
- **Update Status** (Active/Outdated/Needs Verification): Based on record modification
- **Review Flag** (For Review): Based on combined user + record activity
- A resident can be "Active" but still flagged "For Review" if user hasn't logged in

### 3. **Smart Activity Tracking**
```php
// For Review considers BOTH:
$lastActivity = max(
    $resident->last_modified,      // When admin updated record
    $resident->user->updated_at    // When user logged in
);
```

### 4. **Database vs Calculated**
- **Active/Outdated/Needs Verification**: Calculated on-the-fly (not stored)
- **For Review**: Stored as boolean in database (`for_review` column)

---

## 🔍 Example Scenarios

### Scenario 1: Recent Active User
```
Last Record Update: 3 months ago
Last User Login: 1 month ago
→ Status: ACTIVE ✅
→ For Review: FALSE (recent activity)
```

### Scenario 2: Updated Record, Inactive User
```
Last Record Update: 4 months ago
Last User Login: 18 months ago
→ Status: ACTIVE ✅ (record is current)
→ For Review: TRUE 👁️ (no user activity)
```

### Scenario 3: Old Everything
```
Last Record Update: 15 months ago
Last User Login: 20 months ago
→ Status: NEEDS VERIFICATION ⚠️
→ For Review: TRUE 👁️
```

### Scenario 4: Never Updated
```
Last Record Update: NULL (never)
Last User Login: NULL (never)
→ Status: NEEDS VERIFICATION ⚠️
→ For Review: TRUE 👁️
```

### Scenario 5: Approaching Outdated
```
Last Record Update: 7 months ago
Last User Login: 5 months ago
→ Status: OUTDATED ⏰
→ For Review: FALSE (logged in recently)
```

---

## 🎨 UI Representation

In the search filter, these are represented as:
- 📋 **All Status Types** - Show everything
- ✅ **Active Records** - Green indicator
- ⏰ **Outdated Records** - Amber indicator
- ⚠️ **Needs Verification** - Red indicator
- 👁️ **For Review** - Purple indicator

---

## 🔧 Technical Implementation

### Field Names
- `last_modified` - Timestamp of last record update
- `updated_at` - Laravel's automatic timestamp
- `for_review` - Boolean flag (stored in database)
- `update_status` - Calculated string (not stored, computed on fetch)

### Carbon Date Calculations
```php
use Carbon\Carbon;

$now = Carbon::now();
$months = $now->diffInMonths($lastUpdate); // Calculate month difference
```

---

## ✅ Benefits of This System

1. **Automatic Data Quality Control** - Flags old/stale records
2. **Proactive Maintenance** - Identifies records needing attention
3. **User Engagement Tracking** - Monitors both admin updates and user activity
4. **Prioritization** - Clear priority levels (Active → Outdated → Needs Verification)
5. **Compliance Ready** - Helps maintain data accuracy requirements
6. **Scalable** - Works automatically as database grows

---

## 📌 Important Notes

- The 6-month and 12-month thresholds can be adjusted based on organizational needs
- The system uses `diffInMonths()` which counts complete months
- NULL values (never updated) are treated as highest priority (Needs Verification)
- The `for_review` flag must be manually triggered via batch update or on individual record changes
- All date comparisons use server time (ensure server timezone is correct)


