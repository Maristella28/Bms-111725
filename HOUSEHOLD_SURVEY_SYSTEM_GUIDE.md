# 📋 Household Survey System - Complete Implementation Guide

## 🎯 Overview

The Household Survey System is a comprehensive solution for maintaining accurate household records through automated verification surveys. This system enables barangay administrators to send surveys to household heads to verify and update information about relocations, deceased members, new members, and other household changes.

---

## ✨ Key Features

### 1. **Multi-Type Survey Templates**
- ✅ **Comprehensive Household Verification** - Full household status check
- ✅ **Relocation & Address Verification** - Track member relocations
- ✅ **Vital Status Update** - Report deceased family members
- ✅ **Contact Information Update** - Update phone/email
- ✅ **Quick Status Check** - Fast basic verification

### 2. **Multi-Channel Notifications**
- 📧 **Email** - Automated email with survey link
- 📱 **SMS** - Text message notifications (integration ready)
- 🖨️ **Print** - Generate printable survey forms

### 3. **Smart Response Handling**
- Auto-creates change logs for admin review
- Tracks relocations with new addresses
- Records deceased members with dates
- Captures new household members
- Maintains complete audit trail

### 4. **Admin Dashboard**
- Real-time survey statistics
- Response rate tracking
- Pending verifications list
- Expiring surveys alerts
- Comprehensive filtering

### 5. **Security & Privacy**
- Unique tokenized survey links
- Expiration dates (default 30 days)
- One-time response submission
- Data privacy compliance
- Secure transmission

---

## 📦 Installation & Setup

### Step 1: Run Database Migration

```bash
cd backend
php artisan migrate
```

This creates two new tables:
- `household_surveys` - Stores survey information
- `household_change_logs` - Tracks reported changes

### Step 2: Configure Mail Settings

Update your `.env` file with mail configuration:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Frontend URL for survey links
FRONTEND_URL=http://localhost:5173
```

### Step 3: Update Household Model

Add the survey relationship to `backend/app/Models/Household.php`:

```php
public function surveys()
{
    return $this->hasMany(HouseholdSurvey::class);
}

public function changeLogs()
{
    return $this->hasMany(HouseholdChangeLog::class);
}
```

### Step 4: Frontend Route Configuration

Add the public survey route to your frontend router:

```jsx
// In your main router file (e.g., App.jsx or routes.jsx)
import HouseholdSurveyResponse from './pages/admin/modules/household-record/components/HouseholdSurveyResponse';

// Add public route (no authentication required)
<Route path="/survey/:token" element={<HouseholdSurveyResponse />} />
```

---

## 🚀 Usage Guide

### For Administrators

#### 1. Sending a Survey

**From Household Records Page:**

1. Navigate to Household Records
2. Find the household you want to survey
3. Click the "Send Survey" button
4. Select survey type (comprehensive, relocation, deceased, etc.)
5. Choose notification method (email, SMS, print)
6. Add custom message (optional)
7. Click "Send Survey"

**From Dashboard:**

1. Go to Household Survey Dashboard
2. Click "Send New Survey"
3. Select household and configure survey
4. Send

#### 2. Monitoring Survey Responses

**Dashboard View:**
- Total surveys sent
- Completion rate
- Pending responses
- Expired surveys
- Response statistics

**Filters Available:**
- Status (all, pending, completed, expired)
- Time period (today, week, month, quarter)
- Search by household number or name

#### 3. Reviewing Survey Responses

1. Go to Survey Dashboard
2. Click "View" on any completed survey
3. Review responses and additional information
4. Check reported changes:
   - Relocations
   - Deceased members
   - New members
   - Contact updates

#### 4. Processing Change Logs

1. Navigate to Household Change Logs (to be implemented)
2. Review pending changes
3. Approve or reject changes
4. Changes automatically update household records when approved

### For Household Heads (Survey Recipients)

#### 1. Receiving the Survey

**Via Email:**
- Check email inbox
- Open "Household Verification Survey" email
- Click "Complete Survey Now" button

**Via SMS:**
- Check text message
- Click the survey link

**Via Print:**
- Receive printed form from barangay office
- Fill out manually
- Submit to office

#### 2. Completing the Survey

1. **Answer Survey Questions**
   - Read each question carefully
   - Select Yes/No/Not Applicable
   - Provide details when answering "Yes"

2. **Report Relocations** (if applicable)
   - Click "Add Relocation"
   - Enter member name
   - Provide new address
   - Specify relocation date and reason

3. **Report Deceased Members** (if applicable)
   - Click "Add Deceased"
   - Enter member name
   - Provide date of death
   - Add cause and certificate number (if available)

4. **Report New Members** (if applicable)
   - Click "Add Member"
   - Enter full name
   - Specify relationship to household head
   - Provide birth date
   - Note reason (birth, marriage, etc.)

5. **Submit Survey**
   - Review all information
   - Click "Submit Survey"
   - Wait for confirmation message

---

## 🔧 API Endpoints

### Admin Routes (Authenticated)

```
GET    /api/admin/household-surveys
       Get all surveys with filters

GET    /api/admin/household-surveys/statistics
       Get survey statistics

GET    /api/admin/households/{id}/surveys
       Get surveys for specific household

POST   /api/admin/household-surveys/send
       Send a new survey

GET    /api/admin/household-surveys/{id}
       Get survey details
```

### Public Routes (No Authentication)

```
GET    /api/public/household-survey/{token}
       Get survey by token (for respondents)

POST   /api/public/household-survey/submit
       Submit survey response
```

---

## 📊 Database Schema

### household_surveys Table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| household_id | bigint | Foreign key to households |
| survey_type | string | Type of survey |
| survey_token | string | Unique survey access token |
| notification_method | string | email, sms, or print |
| questions | json | Array of survey questions |
| responses | json | Survey responses (nullable) |
| additional_info | json | Detailed change information |
| custom_message | text | Personalized message |
| status | string | pending, sent, opened, completed, expired |
| sent_at | timestamp | When survey was sent |
| opened_at | timestamp | When survey was opened |
| completed_at | timestamp | When survey was completed |
| expires_at | timestamp | Survey expiration date |
| sent_by_user_id | bigint | Admin who sent survey |

### household_change_logs Table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| household_id | bigint | Foreign key to households |
| change_type | string | relocation, deceased, new_member, etc. |
| description | text | Human-readable description |
| old_value | text | Previous value |
| new_value | text | New value |
| change_date | timestamp | When change occurred |
| reported_by | string | Source of report (survey, admin, system) |
| status | string | pending_review, approved, rejected |
| reviewed_by_user_id | bigint | Admin who reviewed |
| reviewed_at | timestamp | Review timestamp |
| review_notes | text | Review comments |

---

## 🎨 Frontend Components

### 1. HouseholdSurveySystem.jsx
Main component for sending surveys from admin panel.

**Props:**
- `household` - Household object
- `onClose` - Close modal callback
- `onSurveySent` - Success callback

**Features:**
- Survey type selection
- Notification method selection
- Custom message input
- Survey history display
- Real-time validation

### 2. HouseholdSurveyDashboard.jsx
Dashboard for monitoring all surveys.

**Features:**
- Statistics cards
- Survey list with filters
- Search functionality
- Time period filtering
- Status filtering
- Quick actions

### 3. HouseholdSurveyResponse.jsx
Public component for survey respondents.

**Features:**
- Survey question display
- Dynamic response forms
- Relocation reporting
- Deceased member reporting
- New member reporting
- Form validation
- Success confirmation

---

## 🔄 Workflow

```
1. Admin sends survey
   ↓
2. System generates unique token
   ↓
3. Notification sent (email/SMS/print)
   ↓
4. Household head receives survey
   ↓
5. Opens survey link (marked as "opened")
   ↓
6. Completes survey questions
   ↓
7. Reports any changes (relocations, deceased, new members)
   ↓
8. Submits survey (marked as "completed")
   ↓
9. System creates change logs
   ↓
10. Admin reviews change logs
    ↓
11. Admin approves/rejects changes
    ↓
12. Approved changes update household records
    ↓
13. Audit trail maintained
```

---

## 🎯 Best Practices

### For Administrators

1. **Regular Surveys**
   - Send comprehensive surveys quarterly
   - Send quick status checks monthly
   - Follow up on non-responses

2. **Targeted Surveys**
   - Use specific survey types for known issues
   - Send deceased surveys when suspecting unreported deaths
   - Send relocation surveys for mobile households

3. **Response Management**
   - Review completed surveys within 7 days
   - Act on urgent changes (deceased, relocations) immediately
   - Keep household heads informed of actions taken

4. **Communication**
   - Use custom messages for context
   - Explain why survey is needed
   - Thank respondents for cooperation

### For Survey Recipients

1. **Timely Response**
   - Complete surveys before expiration
   - Respond within 7 days if possible
   - Contact office if unable to complete

2. **Accurate Information**
   - Provide truthful information
   - Include all relevant details
   - Attach documentation if requested

3. **Complete Reporting**
   - Report all changes, not just asked items
   - Update contact information
   - Mention upcoming changes

---

## 🔐 Security Considerations

1. **Token Security**
   - Tokens are unique and random (32 characters)
   - Tokens expire after set period
   - One-time use only (after completion)
   - Not guessable or enumerable

2. **Data Privacy**
   - Survey responses encrypted in transit
   - Access logged for audit
   - Only authorized admins can view
   - Compliant with data protection laws

3. **Validation**
   - Server-side validation for all inputs
   - XSS protection
   - CSRF protection
   - Rate limiting on submission

---

## 📈 Future Enhancements

### Planned Features

1. **Automated Scheduling**
   - Cron jobs for periodic surveys
   - Smart scheduling based on last update
   - Reminder emails for non-responses

2. **SMS Integration**
   - Twilio integration
   - Semaphore SMS service
   - Custom SMS gateway support

3. **Advanced Analytics**
   - Response time analytics
   - Change trend analysis
   - Predictive insights
   - Data quality scoring

4. **Mobile App**
   - Native mobile survey app
   - Offline survey capability
   - Push notifications

5. **AI Assistance**
   - Smart question generation
   - Anomaly detection
   - Auto-categorization of changes
   - Response validation

6. **Multi-Language Support**
   - Tagalog translation
   - Cebuano translation
   - Other local dialects

7. **Document Attachment**
   - Upload death certificates
   - Attach proof of relocation
   - Birth certificates for new members

---

## 🐛 Troubleshooting

### Survey Not Sending

**Check:**
- Mail configuration in `.env`
- Email address validity
- Mail server connectivity
- Log files for errors

**Solution:**
```bash
php artisan config:clear
php artisan queue:work  # If using queues
```

### Survey Link Not Working

**Check:**
- Token validity
- Survey expiration date
- Frontend URL configuration
- CORS settings

### Responses Not Saving

**Check:**
- Database connectivity
- Table existence
- Validation errors
- Error logs

---

## 📞 Support

For technical support or questions:
- Check system logs: `backend/storage/logs/laravel.log`
- Review API responses in browser console
- Contact system administrator
- Refer to Laravel and React documentation

---

## 📝 License

This Household Survey System is part of the Barangay Management System.
All rights reserved © 2024

---

## 🎉 Conclusion

The Household Survey System provides a powerful, user-friendly solution for maintaining accurate household records. By leveraging automated surveys, multi-channel notifications, and smart change tracking, barangays can ensure their data remains current and actionable.

**Key Benefits:**
- ✅ Improved data accuracy
- ✅ Reduced manual verification work
- ✅ Better community engagement
- ✅ Timely updates for critical changes
- ✅ Complete audit trail
- ✅ Scalable and maintainable

Start using the Household Survey System today to transform your household record management!

