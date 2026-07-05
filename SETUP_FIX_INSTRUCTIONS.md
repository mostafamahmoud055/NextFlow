# Setup Wizard Fix Instructions

## Problem
The frontend is using a wrong tenant UUID that doesn't exist in the database.

## Solution Steps

### Option 1: Clear cookies and start fresh (Recommended)
1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Delete the `nf_tenant` cookie
4. Delete the `nf_session` cookie (or all cookies for localhost:3000 and localhost:8000)
5. Reload the page
6. Login again
7. The system should redirect you to `/select-company` or `/setup`

### Option 2: Manual cookie fix
1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Find `nf_tenant` cookie
4. Edit its value to:
   ```json
   {"id":"1580c43c-d335-42de-b6fc-6ce6877e3019","name":"مصطفى"}
   ```
5. Reload the page

### Option 3: Delete old company and create new one
If you want to start completely fresh:

```bash
cd /Users/mostafamahmoud/Sites/NextFlowBack

# Delete the old tenant and company
php artisan tinker --execute="
DB::table('tenants')->where('id', '1580c43c-d335-42de-b6fc-6ce6877e3019')->delete();
DB::table('companies')->where('uuid', '1580c43c-d335-42de-b6fc-6ce6877e3019')->forceDelete();
"

# Drop the tenant database
php artisan tinker --execute="
DB::statement('DROP DATABASE IF EXISTS tenant_1580c43c_d335_42de_b6fc_6ce6877e3019');
"
```

Then:
1. Clear all cookies in the browser
2. Reload the page
3. Login again
4. Create a new company with a DIFFERENT company_code (not "444")

## Backend Changes Applied

✅ Created `SetupState` model
✅ Created `SetupDraft` model  
✅ Created `SetupStep` enum
✅ Updated `SetupService::getState()` to return:
   - `current_step`
   - `completed_steps`
   - `drafts`
   - `setup_completed`
✅ Updated all `save*()` methods to call `advanceStep()`
✅ Setup wizard will now progress through steps automatically

## Test the Fix

After following Option 1 or 2:
1. Go to http://localhost:3000/setup
2. You should see the Company step
3. Fill in the company form and click "Save & Continue"
4. The wizard should automatically move to the "Branches" step
5. Check the network tab - `/api/tenant/{uuid}/setup/state` should return:
   ```json
   {
     "current_step": "branches",
     "completed_steps": ["company"],
     "drafts": {},
     "setup_completed": false
   }
   ```
