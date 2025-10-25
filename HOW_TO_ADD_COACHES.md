# 📖 Complete Guide: How to Add Coaches from Admin Panel

## ✅ FEATURE NOW LIVE!

**Status**: ✅ Deployed and Working  
**URL**: https://psanashik.in/coaches  

---

## 🚀 Quick Start Guide for Admin

### Step 1: Login as Admin
1. Go to https://psanashik.in
2. Login with admin credentials:
   - Email: `admin@psa.com`
   - Password: `admin123`

### Step 2: Navigate to Coaches Page
1. Click **"Coaches"** in the left sidebar menu
2. You'll see the coaches management page

### Step 3: Add New Coach
1. Click the **"+ Add Coach"** button (top right)
2. Fill in the coach details:
   - **Name**: Full name of the coach
   - **Email**: Email address (will be used for login)
   - **Phone**: Mobile number
   - **Specialization**: Select sport (Cricket, Football, etc.)
   - **Experience**: Years of experience
   - **Salary**: Monthly salary (optional)
   - **Status**: Active/Inactive

3. Click **"Create Coach"** button

### Step 4: Get Login Credentials
**After creating the coach, you'll see a popup with:**

```
✅ Coach Created Successfully!

Login Credentials:
Email: newcoach@example.com
Password: Coach@123

⚠️ IMPORTANT: Save these credentials securely!
Share them with the coach. The password cannot be retrieved later.

The coach can login at: https://psanashik.in
```

### Step 5: Share Credentials with Coach
- **Copy the credentials** from the popup
- Share them with the coach via:
  - WhatsApp message
  - Email
  - SMS
  - Or print them

---

## 🔐 Default Credentials

### For New Coaches:
- **Email**: The email you entered during creation
- **Password**: `Coach@123` (default)

### Coach Must Change Password:
⚠️ **Recommend coaches change their password after first login!**
(Note: Password change feature can be added if needed)

---

## 👥 What Coaches Can Do After Login

### 1. View Dashboard
- See their stats (students, attendance)
- Today's summary

### 2. View My Batches
- See all batches assigned to them

### 3. Mark Attendance
- Select batch
- Select date
- Mark students as Present/Absent/Late
- See fee status (Paid/Unpaid)
- Submit attendance

### What Coaches CANNOT Do:
- ❌ Access admin features
- ❌ View all students
- ❌ View payments/amounts
- ❌ Access reports
- ❌ Modify settings

---

## 🎓 Step-by-Step Example

### Example: Adding Coach "Rahul Sharma"

**1. Click "Add Coach"**

**2. Fill Form:**
```
Name: Rahul Sharma
Email: rahul.sharma@example.com
Phone: 9876543210
Specialization: Cricket
Experience: 5 Years
Salary: 25000 (optional)
Status: ✓ Active
```

**3. Click "Create Coach"**

**4. Popup Shows:**
```
Coach Created Successfully!

Login Credentials:
Email: rahul.sharma@example.com
Password: Coach@123

The coach can login at: https://psanashik.in
```

**5. Share with Coach:**
```
Hi Rahul,

Your login credentials for PSA Nashik:
Email: rahul.sharma@example.com
Password: Coach@123

Login at: https://psanashik.in

Please keep these credentials secure!
```

**6. Assign Batches to Coach:**
- Go to **Batches** page
- Edit any batch
- Select "Rahul Sharma" from coach dropdown
- Save

**7. Coach Can Now:**
- Login at https://psanashik.in
- See their dashboard
- View their batches
- Mark attendance for students

---

## 🔧 Advanced: Database Method

### If You Need to Create Login for Existing Coach:

```sql
-- SSH to server
ssh root@194.238.23.217
psql -U postgres psa_nashik

-- Run this SQL (replace email with coach email)
DO $$
DECLARE
  v_coach_email VARCHAR := 'existing.coach@example.com';
  v_password VARCHAR := 'Coach@123';
  v_coach RECORD;
  v_user_id INTEGER;
  v_user_exists BOOLEAN;
BEGIN
  -- Check if coach exists
  SELECT * INTO v_coach FROM coaches WHERE email = v_coach_email;
  
  IF v_coach.id IS NULL THEN
    RAISE EXCEPTION 'Coach with email % not found', v_coach_email;
  END IF;
  
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM users WHERE email = v_coach_email) INTO v_user_exists;
  
  IF v_user_exists THEN
    RAISE NOTICE 'User already exists for email: %', v_coach_email;
  ELSE
    -- Create user account
    INSERT INTO users (email, password, name, role, phone, is_active, email_verified)
    VALUES (
      v_coach.email,
      '$2b$12$9YmOAGjgk4ulV.jaG1FLRuEy9yVyCQNkq6Yvg3mBeVWHFFGwKm4HG',
      v_coach.name,
      'coach',
      v_coach.phone,
      true,
      true
    )
    RETURNING id INTO v_user_id;
    
    -- Link coach to user
    UPDATE coaches SET user_id = v_user_id WHERE id = v_coach.id;
    
    RAISE NOTICE 'Login created for: % - Email: % - Password: %', 
      v_coach.name, v_coach.email, v_password;
  END IF;
END $$;
```

---

## 📊 Check Coach Login Status

### View All Coaches with Their Login Status:

```sql
-- SSH to server
ssh root@194.238.23.217
psql -U postgres psa_nashik

-- Query
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.specialization,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Has Login'
    ELSE '❌ No Login'
  END as login_status,
  u.role as user_role
FROM coaches c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY c.name;
```

---

## 🔄 Reset Coach Password

### If Coach Forgets Password:

```sql
-- SSH to server
ssh root@194.238.23.217
psql -U postgres psa_nashik

-- Reset password to 'Coach@123'
UPDATE users 
SET password = '$2b$12$9YmOAGjgk4ulV.jaG1FLRuEy9yVyCQNkq6Yvg3mBeVWHFFGwKm4HG'
WHERE email = 'coach@example.com' AND role = 'coach';

-- Confirm
SELECT email, name, role FROM users WHERE email = 'coach@example.com';
```

Then inform the coach: "Your password has been reset to: **Coach@123**"

---

## 🎨 Screenshots Guide

### 1. Coaches Page
![Coaches List](coaches-list.png)
- Shows all coaches
- Stats at top
- Add Coach button

### 2. Add Coach Form
![Add Coach Form](add-coach-form.png)
- Name, Email, Phone
- Specialization dropdown
- Experience selector
- Salary field (optional)

### 3. Success Message
![Credentials Popup](credentials-popup.png)
- Email and Password shown
- Warning to save credentials
- Login URL provided

---

## ⚠️ Important Notes

### Security:
1. **Save credentials immediately** - They're shown only once
2. **Share securely** - Use secure channels (WhatsApp, Email)
3. **Don't share in plain text** - Avoid SMS if possible
4. **Coach should change password** - After first login (if feature available)

### Email Uniqueness:
- Each email can only be used once
- If email already exists, you'll get an error
- Use unique email for each coach

### Login URL:
- Always **https://psanashik.in**
- Coaches login with same page as admin
- System automatically redirects them to coach dashboard

---

## 📱 Coach Login Flow

### Coach's First Login:
1. Go to https://psanashik.in
2. Enter email and password
3. Click "Login"
4. **Automatically redirected to Coach Dashboard**
5. Sees only 3 menu items:
   - Dashboard
   - My Batches
   - Mark Attendance

### If Coach Sees Admin Dashboard:
- **This should NOT happen** (it's fixed)
- If it does, logout and login again
- Contact tech support

---

## 🆘 Troubleshooting

### Problem: Coach Can't Login
**Solution:**
1. Verify email is correct
2. Check password (case-sensitive)
3. Try resetting password (see above)
4. Check if user account was created:
   ```sql
   SELECT * FROM users WHERE email = 'coach@example.com';
   ```

### Problem: Credentials Popup Not Showing
**Solution:**
- Check browser popup blocker
- Look in browser console for errors
- Credentials are also in toast notification
- Contact admin if needed

### Problem: Email Already Exists
**Solution:**
- Use different email address
- Or check if coach already exists
- May need to update existing coach instead

### Problem: Coach Sees Admin Features
**Solution:**
- This shouldn't happen (it's fixed)
- Check user role in database:
  ```sql
  SELECT role FROM users WHERE email = 'coach@example.com';
  ```
- Should be 'coach', not 'admin'

---

## 🎯 Best Practices

### 1. Create Coach Profile First
- Fill all details accurately
- Use professional email
- Add correct phone number

### 2. Immediately Save Credentials
- Copy from popup
- Paste in secure document
- Or share immediately with coach

### 3. Assign Batches
- After creating coach
- Go to Batches page
- Assign relevant batches to coach

### 4. Inform Coach
- Send credentials securely
- Explain how to login
- Share what they can do

### 5. Test Coach Login
- Ask coach to login
- Verify they see coach dashboard only
- Confirm they can mark attendance

---

## 📞 Support

### For Admin Help:
- Check this guide first
- Try database method if UI fails
- Contact technical support if issues persist

### For Coach Help:
- Provide this guide to coaches
- Show them the coach dashboard
- Explain how to mark attendance

---

## ✅ Summary Checklist

When adding a new coach:

- [ ] Go to Coaches page
- [ ] Click "Add Coach"
- [ ] Fill all details (Name, Email, Phone, etc.)
- [ ] Click "Create Coach"
- [ ] **SAVE THE CREDENTIALS** from popup
- [ ] Share credentials with coach securely
- [ ] Assign batches to the coach
- [ ] Test coach login
- [ ] Verify coach can mark attendance

---

**Feature Status**: ✅ LIVE and WORKING  
**Last Updated**: October 14, 2025  
**Version**: 1.0  

🎉 **Coaches can now be added with automatic login creation!**
