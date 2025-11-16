# 🚩 Flagging System - Quick Reference Card

## 🚀 Quick Start (3 Steps)

```bash
# 1. Inject Test Data
php backend/inject_inactive_records.php

# 2. Run Flagging
php artisan residents:check-review

# 3. View Results
# Open browser → Residents Records → Look for orange "For Review" badges
```

---

## 📋 Commands

| Command | Purpose | Schedule |
|---------|---------|----------|
| `php artisan residents:check-review` | Flag inactive residents | Daily 01:00 |
| `php artisan users:check-inactive` | Flag inactive users | Daily 02:00 |
| `php artisan users:check-inactive --dry-run` | Preview changes | Manual |
| `php artisan db:seed --class=InactiveRecordsSeeder` | Inject test data | Manual |

---

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/residents/flagged-for-review` | Get all flagged residents |
| GET | `/api/admin/residents/review-statistics` | Get statistics |
| POST | `/api/admin/residents/{id}/toggle-review-flag` | Toggle flag for one resident |
| POST | `/api/admin/residents/bulk-flag-for-review` | Bulk flag operation |

---

## 📊 Test Data (12 Scenarios)

| Email | Status | Inactive Period |
|-------|--------|----------------|
| john.active@test.com | ❌ Not Flagged | 3 months |
| sarah.almost@test.com | ❌ Not Flagged | 11 months |
| mike.threshold@test.com | ✅ **Flagged** | 12 months |
| emma.inactive@test.com | ✅ **Flagged** | 13 months |
| david.longago@test.com | ✅ **Flagged** | 18 months |
| lisa.updated@test.com | ❌ Not Flagged | Recent update |
| tom.logged@test.com | ❌ Not Flagged | Recent login |
| never.active@test.com | ✅ **Flagged** | Never |
| robert.ancient@test.com | ✅ **Flagged** | 3 years |
| maria.flagged@test.com | ✅ **Flagged** | 15 months |
| carlos.relocated@test.com | ❌ Not Flagged | Relocated |
| anna.deceased@test.com | ❌ Not Flagged | Deceased |

**Password for all test users:** `password123`

---

## 🗄️ Database Queries

```sql
-- Count flagged residents
SELECT COUNT(*) FROM residents WHERE for_review = 1;

-- View flagged residents
SELECT resident_id, first_name, last_name, for_review, last_modified
FROM residents WHERE for_review = 1;

-- Check user status
SELECT name, email, last_activity_at, residency_status
FROM users WHERE residency_status = 'for_review';

-- Inactivity analysis
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN for_review = 1 THEN 1 ELSE 0 END) as flagged,
    ROUND(SUM(CASE WHEN for_review = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as percentage
FROM residents;
```

---

## 📁 Files Created/Modified

### Created (5 files)
- ✅ `backend/database/seeders/InactiveRecordsSeeder.php`
- ✅ `backend/inject_inactive_records.php`
- ✅ `frontend/src/pages/admin/components/ReviewFlagStatistics.jsx`
- ✅ `FLAGGING_SYSTEM_GUIDE.md`
- ✅ `FLAGGING_SYSTEM_IMPLEMENTATION_SUMMARY.md`

### Modified (3 files)
- ✅ `backend/app/Http/Controllers/ResidentController.php` (4 new methods)
- ✅ `backend/routes/api.php` (4 new routes)
- ✅ `frontend/src/pages/admin/components/ResidentsTable.jsx` (enhanced badge)

---

## 🎨 UI Features

### Residents Table
- **Badge Color:** Orange (warning)
- **Icon:** Exclamation triangle
- **Filter:** "For Review" option in status filter
- **Export:** Includes review flag in CSV/Excel

### Statistics Dashboard (Optional Component)
- Total Residents
- Flagged for Review (with %)
- Active Residents
- Never Active
- Inactivity Breakdown

---

## 🔍 Verification Checklist

- [ ] Test data injected (12 users created)
- [ ] Flagging command executed successfully
- [ ] Database shows flagged residents
- [ ] Orange badges visible in UI
- [ ] Status filter works ("For Review" option)
- [ ] Statistics API returns data
- [ ] Export includes review flag

---

## 🐛 Troubleshooting

### No residents flagged?
```bash
# Check if test data exists
php artisan tinker
>>> \App\Models\Resident::count()

# Manually run command
php artisan residents:check-review --chunk=10

# Check database
SELECT COUNT(*) FROM residents WHERE for_review = 1;
```

### API returns empty?
```bash
# Verify routes
php artisan route:list | grep flagged

# Check permissions
# Ensure you're logged in as admin
```

### UI not showing badges?
- Clear browser cache
- Check React console for errors
- Verify API response includes `for_review` field

---

## 📞 Support

**Documentation:**
- Full Guide: `FLAGGING_SYSTEM_GUIDE.md`
- Implementation: `FLAGGING_SYSTEM_IMPLEMENTATION_SUMMARY.md`

**Key Concepts:**
- **Threshold:** 12 months of inactivity
- **Activity:** Login OR record update
- **Exclusions:** Deceased and relocated residents
- **Schedule:** Runs daily at 01:00 and 02:00

---

## 💡 Tips

1. **Development:** Use `--dry-run` flag to preview changes
2. **Production:** Set up cron job for scheduler
3. **Testing:** Use test data emails (@test.com)
4. **Monitoring:** Check statistics regularly
5. **Maintenance:** Review flagged records monthly

---

## 🎯 Common Tasks

### View flagged residents in UI
1. Navigate to **Residents Records**
2. Click status filter dropdown
3. Select **"For Review"**
4. Look for orange badges

### Manually flag a resident
```bash
curl -X POST http://localhost:8000/api/admin/residents/123/toggle-review-flag \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"for_review": true, "notes": "Manual review requested"}'
```

### Get statistics
```bash
curl http://localhost:8000/api/admin/residents/review-statistics \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

### Clear test data
```sql
DELETE FROM residents WHERE email LIKE '%@test.com';
DELETE FROM users WHERE email LIKE '%@test.com';
DELETE FROM profiles WHERE email LIKE '%@test.com';
```

---

**Quick Ref Version:** 1.0  
**Last Updated:** October 24, 2025  
**Status:** ✅ Ready for Production

