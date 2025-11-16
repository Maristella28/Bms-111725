# 📅 Household Survey Scheduler - Complete Guide

## 🎯 Overview

The Survey Scheduler enables **automated, recurring household surveys** with full administrative control. Both admins and staff can create, manage, and modify schedules to automate periodic household verifications.

---

## ✨ New Features Added

### 1. **Survey Scheduler Modal**
A comprehensive interface for creating and managing automated survey schedules.

**Features:**
- Create recurring surveys (daily, weekly, monthly, quarterly, annually)
- Target all households or specific ones
- Set custom timing and delivery methods
- Pause/resume schedules
- Track execution history
- Run schedules on-demand

### 2. **Trigger Button Component**
Flexible button component with multiple variants:
- **Button** - Standard "Send Survey" button
- **Icon** - Compact icon button
- **Dropdown** - Menu with "Send Now" and "Manage Schedules" options

### 3. **Automated Execution**
Background task that runs every 15 minutes to check and execute due surveys.

---

## 📦 Files Created

### Frontend (2 files)
```
✅ HouseholdSurveyScheduler.jsx (500+ lines)
   - Schedule creation/editing interface
   - Schedule list with statistics
   - Pause/resume/delete controls
   - Run now functionality

✅ HouseholdSurveyTriggerButton.jsx (120 lines)
   - Trigger button component
   - Multiple display variants
   - Integrated with scheduler
```

### Backend (4 files)
```
✅ HouseholdSurveySchedule Model (320 lines)
   - Schedule management logic
   - Next run date calculation
   - Auto-execution

✅ HouseholdSurveyScheduleController (180 lines)
   - CRUD operations
   - Toggle active status
   - Run now functionality
   - Statistics

✅ Migration (45 lines)
   - household_survey_schedules table
   - Updates household_surveys table

✅ RunScheduledSurveys Command (50 lines)
   - Console command to run due schedules
   - Automated execution
```

### Updated Files (3)
```
✅ api.php routes - Added 7 schedule endpoints
✅ Kernel.php - Registered cron schedule
✅ HouseholdSurvey Model - Added schedule relationship
```

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Migration
```bash
cd backend
php artisan migrate
```

This creates the `household_survey_schedules` table and adds `schedule_id` to `household_surveys`.

### Step 2: Test the Command
```bash
php artisan surveys:run-scheduled
```

You should see: "No schedules due at this time." (until you create one)

### Step 3: Integrate Trigger Button

**Option A: Single household trigger (for HouseholdRecords.jsx)**
```jsx
import HouseholdSurveyTriggerButton from './modules/household-record/components/HouseholdSurveyTriggerButton';

// In your household actions area:
<HouseholdSurveyTriggerButton 
  household={household} 
  variant="icon"
  onSuccess={(survey) => {
    console.log('Survey sent!', survey);
    // Optional: Refresh data
  }}
/>
```

**Option B: Dropdown with scheduler access**
```jsx
<HouseholdSurveyTriggerButton 
  household={household} 
  variant="dropdown"
/>
```

**Option C: Schedule manager button (in header/toolbar)**
```jsx
import { useState } from 'react';
import HouseholdSurveyScheduler from './modules/household-record/components/HouseholdSurveyScheduler';

const [showScheduler, setShowScheduler] = useState(false);

// Button
<button onClick={() => setShowScheduler(true)}>
  <CalendarIcon className="w-5 h-5" />
  Survey Schedules
</button>

// Modal
{showScheduler && (
  <HouseholdSurveyScheduler onClose={() => setShowScheduler(false)} />
)}
```

---

## 🎨 User Interface

### Schedule List View
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Survey Scheduler                                      │
│ Automate periodic household surveys                     │
├─────────────────────────────────────────────────────────┤
│ 📅 3 Schedules                    [➕ New Schedule]     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Monthly Verification [Active]          [⏸️ Pause]   │ │
│ │ Comprehensive Household Verification                │ │
│ │                                                     │ │
│ │ 🕐 Day 1 of every month at 09:00                   │ │
│ │ 👥 All households                                   │ │
│ │ 📅 Next run: November 1, 2024                      │ │
│ │ 📧 Email                                            │ │
│ │                                                     │ │
│ │ Total Runs: 12  |  Surveys Sent: 1,440            │ │
│ │ Last Run: October 1, 2024                          │ │
│ │                                                     │ │
│ │ [▶️ Run Now]  [✏️ Edit]  [🗑️ Delete]              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Weekly Relocation Check [Active]   [⏸️ Pause]      │ │
│ │ Relocation & Address Verification                  │ │
│ │                                                     │ │
│ │ 🕐 Every Monday at 10:00                           │ │
│ │ 👥 50 specific households                          │ │
│ │ 📅 Next run: October 28, 2024                     │ │
│ │ 📱 SMS                                              │ │
│ │                                                     │ │
│ │ Total Runs: 48  |  Surveys Sent: 2,400            │ │
│ │ Last Run: October 21, 2024                         │ │
│ │                                                     │ │
│ │ [▶️ Run Now]  [✏️ Edit]  [🗑️ Delete]              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Create/Edit Schedule Form
```
┌─────────────────────────────────────────────────────────┐
│ Create New Schedule                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Schedule Name *                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ e.g., Monthly Household Verification                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Survey Type *                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Comprehensive Verification ▼]                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Frequency *                                             │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │
│ │ 📅    │ │ 📆    │ │ 🗓️    │ │ 📊    │ │ 📈    │   │
│ │Daily  │ │Weekly │ │Monthly│ │Quarter│ │Annual │   │
│ │       │ │  ✓    │ │       │ │       │ │       │   │
│ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘   │
│                                                         │
│ Day of Week                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Monday ▼]                                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Start Date        Time                                  │
│ ┌──────────────┐  ┌──────────────┐                    │
│ │ 2024-10-24   │  │ 09:00        │                    │
│ └──────────────┘  └──────────────┘                    │
│                                                         │
│ Target Households                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [All Households ▼]                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Notification Method                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Email ▼]                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Custom Message (Optional)                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Add a custom message for recipients...              │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ☑️ Activate schedule immediately                        │
│                                                         │
│ [Cancel]  [Create Schedule]                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints

### Schedule Management (Admin/Staff)
```
GET    /api/admin/household-survey-schedules
       List all schedules

GET    /api/admin/household-survey-schedules/statistics
       Get schedule statistics

POST   /api/admin/household-survey-schedules
       Create new schedule

PUT    /api/admin/household-survey-schedules/{id}
       Update schedule

PATCH  /api/admin/household-survey-schedules/{id}/toggle
       Pause/resume schedule

POST   /api/admin/household-survey-schedules/{id}/run
       Run schedule immediately

DELETE /api/admin/household-survey-schedules/{id}
       Delete schedule
```

---

## 📊 Database Schema

### household_survey_schedules Table
```sql
CREATE TABLE household_survey_schedules (
    id                    BIGINT PRIMARY KEY,
    name                  VARCHAR(255),
    survey_type           VARCHAR(50),
    notification_method   VARCHAR(50),
    frequency             VARCHAR(50),
    target_households     VARCHAR(50),
    specific_household_ids JSON,
    custom_message        TEXT,
    is_active             BOOLEAN DEFAULT TRUE,
    start_date            DATE,
    scheduled_time        TIME,
    day_of_week           INTEGER,
    day_of_month          INTEGER,
    last_run_date         TIMESTAMP,
    next_run_date         TIMESTAMP,
    total_runs            INTEGER DEFAULT 0,
    surveys_sent          INTEGER DEFAULT 0,
    created_by_user_id    BIGINT,
    created_at            TIMESTAMP,
    updated_at            TIMESTAMP
);
```

### Updates to household_surveys Table
```sql
ALTER TABLE household_surveys
ADD COLUMN schedule_id BIGINT REFERENCES household_survey_schedules(id);
```

---

## ⚙️ How It Works

### 1. Schedule Creation Flow
```
Admin/Staff Creates Schedule
    ↓
Sets frequency & timing
    ↓
Chooses target households
    ↓
System calculates next_run_date
    ↓
Schedule saved & activated
```

### 2. Automated Execution Flow
```
Cron runs every 15 minutes
    ↓
Command: surveys:run-scheduled
    ↓
Finds schedules where next_run_date <= now()
    ↓
For each schedule:
    - Get target households
    - Create & send surveys
    - Update statistics
    - Calculate next run date
    ↓
Surveys delivered via email/SMS
```

### 3. Manual Trigger Flow
```
Admin clicks "Run Now"
    ↓
API: POST /household-survey-schedules/{id}/run
    ↓
Schedule executes immediately
    ↓
Surveys sent
    ↓
Statistics updated
    ↓
Next run date recalculated
```

---

## 📅 Frequency Options

### Daily
- **Runs**: Every day at specified time
- **Example**: "Daily status check at 9:00 AM"
- **Use case**: High-priority monitoring

### Weekly
- **Runs**: Specific day of week at specified time
- **Example**: "Every Monday at 10:00 AM"
- **Use case**: Regular weekly updates

### Monthly
- **Runs**: Specific day of month at specified time
- **Example**: "Day 1 of every month at 9:00 AM"
- **Use case**: Monthly verifications

### Quarterly
- **Runs**: Every 3 months from start date
- **Example**: "Every 3 months starting January 1"
- **Use case**: Comprehensive reviews

### Annually
- **Runs**: Once per year from start date
- **Example**: "Every year on October 24"
- **Use case**: Annual household census

---

## 🎯 Use Cases

### Use Case 1: Monthly Household Verification
```
Schedule Name: Monthly Comprehensive Check
Survey Type: Comprehensive
Frequency: Monthly (Day 1)
Time: 09:00
Target: All households
Method: Email
Result: Automated monthly verification of all households
```

### Use Case 2: Weekly High-Risk Monitoring
```
Schedule Name: Weekly High-Risk Check
Survey Type: Quick Status Check
Frequency: Weekly (Monday)
Time: 08:00
Target: Specific (high-risk households)
Method: SMS
Result: Quick weekly check on vulnerable households
```

### Use Case 3: Quarterly Relocation Survey
```
Schedule Name: Quarterly Relocation Check
Survey Type: Relocation
Frequency: Quarterly
Time: 10:00
Target: All households
Method: Both (Email & SMS)
Result: Track household movements every 3 months
```

### Use Case 4: Annual Census
```
Schedule Name: Annual Household Census
Survey Type: Comprehensive
Frequency: Annually
Time: 09:00
Target: All households
Method: Email
Result: Complete household verification once per year
```

---

## 🔐 Permissions

### Admin Access
- ✅ Create schedules
- ✅ Edit schedules
- ✅ Delete schedules
- ✅ Pause/resume schedules
- ✅ Run schedules manually
- ✅ View all schedules
- ✅ View statistics

### Staff Access
- ✅ Create schedules
- ✅ Edit schedules
- ✅ Pause/resume schedules
- ✅ Run schedules manually
- ✅ View all schedules
- ✅ View statistics
- ⚠️ Cannot delete schedules (optional restriction)

---

## 🛠️ Advanced Configuration

### Cron Schedule
The system runs checks every 15 minutes by default. To change frequency:

**File:** `backend/app/Console/Kernel.php`
```php
// Current (every 15 minutes)
$schedule->command('surveys:run-scheduled')->everyFifteenMinutes();

// Change to every hour
$schedule->command('surveys:run-scheduled')->hourly();

// Change to every 30 minutes
$schedule->command('surveys:run-scheduled')->everyThirtyMinutes();

// Change to every 5 minutes (more responsive)
$schedule->command('surveys:run-scheduled')->everyFiveMinutes();
```

### Manual Execution
You can run the command manually anytime:
```bash
php artisan surveys:run-scheduled
```

### Testing Schedules
Create a test schedule with a near-future date:
```
Start Date: Today
Time: Current time + 5 minutes
Frequency: Daily
Target: Specific household (1 test household)
```

Then run manually:
```bash
php artisan surveys:run-scheduled
```

---

## 📈 Statistics & Monitoring

### Schedule Statistics
- Total schedules created
- Active vs inactive schedules
- Total execution runs
- Total surveys sent
- Schedules due in next 24 hours

### Per-Schedule Metrics
- Total runs
- Surveys sent
- Last run date
- Next run date
- Success rate

---

## 🎨 Integration Examples

### Example 1: Add to HouseholdRecords Header
```jsx
import { CalendarIcon } from '@heroicons/react/24/solid';
import HouseholdSurveyScheduler from './modules/household-record/components/HouseholdSurveyScheduler';

// In your component
const [showScheduler, setShowScheduler] = useState(false);

// In header actions area
<button
  onClick={() => setShowScheduler(true)}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
>
  <CalendarIcon className="w-5 h-5" />
  Survey Schedules
</button>

{showScheduler && (
  <HouseholdSurveyScheduler onClose={() => setShowScheduler(false)} />
)}
```

### Example 2: Add Trigger Button to Each Household Row
```jsx
import HouseholdSurveyTriggerButton from './modules/household-record/components/HouseholdSurveyTriggerButton';

// In your household list/table
{households.map(household => (
  <div key={household.id}>
    {/* ... household info ... */}
    
    <HouseholdSurveyTriggerButton 
      household={household}
      variant="icon"
      onSuccess={() => {
        // Refresh surveys for this household
        fetchHouseholdSurveys(household.id);
      }}
    />
  </div>
))}
```

### Example 3: Dropdown Menu in Actions Column
```jsx
<HouseholdSurveyTriggerButton 
  household={household}
  variant="dropdown"
/>
```

---

## 🐛 Troubleshooting

### Schedule Not Running
**Check:**
1. Is the schedule active? (Green "Active" badge)
2. Is `next_run_date` in the past?
3. Is Laravel cron scheduler running?

**Solution:**
```bash
# Test manually
php artisan surveys:run-scheduled

# Check schedule status
php artisan schedule:list

# Ensure cron is set up (on server)
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

### Surveys Not Sending
**Check:**
1. Mail configuration in `.env`
2. Household has valid email/phone
3. Check logs: `backend/storage/logs/laravel.log`

**Solution:**
```bash
# Test email configuration
php artisan tinker
Mail::raw('Test', function($msg) {
    $msg->to('test@example.com')->subject('Test');
});
```

### Next Run Date Not Calculating
**Check:**
1. Schedule has `start_date` set
2. Schedule has `scheduled_time` set
3. Frequency-specific fields set (day_of_week, day_of_month)

**Solution:**
Run migration again or manually set next_run_date in database.

---

## 🎉 Success Checklist

- ✅ Migration run successfully
- ✅ Command registered and tested
- ✅ Trigger button integrated
- ✅ Scheduler modal accessible
- ✅ Test schedule created
- ✅ Manual execution works
- ✅ Cron scheduler configured
- ✅ Email delivery tested
- ✅ Staff trained on usage

---

## 💡 Best Practices

### DO:
✅ Start with monthly schedules
✅ Test with small household groups first
✅ Use descriptive schedule names
✅ Set appropriate expiration dates (30 days)
✅ Monitor response rates
✅ Pause unused schedules
✅ Review schedule statistics regularly

### DON'T:
❌ Create too many daily schedules (can overwhelm recipients)
❌ Set unrealistic target households without testing
❌ Forget to pause schedules during system maintenance
❌ Delete schedules with historical data (pause instead)
❌ Use same schedule for different purposes

---

## 🚀 You're Ready!

The Survey Scheduler is now fully integrated and ready to automate your household verifications! 

**Start by:**
1. Creating a test schedule
2. Running it manually
3. Monitoring the results
4. Rolling out to production

**Happy Scheduling! 📅**

