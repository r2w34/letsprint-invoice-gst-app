# LetsPrint - Quick Start Testing Guide

## 🚀 How to Start Testing in 5 Minutes

### Step 1: Access Your App in Shopify

1. **Go to Shopify Partners Dashboard**
   - URL: https://partners.shopify.com/
   - Login with your credentials

2. **Find Your App**
   - Click on "Apps" in the left sidebar
   - Look for "LetsPrint" app
   - Note the App URL: `https://letsprint.indigenservices.com`

3. **Install on Test Store**
   - Click on your app
   - Click "Select store"
   - Choose your development/test store
   - Click "Install app"
   - Authorize the app permissions

### Step 2: First-Time Setup (5 minutes)

1. **Configure Business Details**
   - Navigate to Settings
   - Fill in:
     ```
     Business Name: Your Business Name
     Address: Complete address
     GSTIN: 22AAAAA0000A1Z5 (example format)
     State: Your State
     PIN: 123456
     ```
   - Click "Save Business Details"

2. **Configure Bank Details** (Optional)
   ```
   Bank Name: State Bank of India
   Account Number: 1234567890
   IFSC Code: SBIN0001234
   Branch: Main Branch
   ```

3. **Set Invoice Preferences**
   ```
   Invoice Prefix: INV-
   Starting Number: 1001
   Footer Text: Thank you for your business!
   ```

### Step 3: Create Test Orders

You need test orders to test invoice generation:

1. **Go to Your Test Store Admin**
   - URL: `https://your-store.myshopify.com/admin`

2. **Create Draft Order**
   - Products → Create draft order
   - Add customer details:
     - Name, Email, Phone
     - Billing address
     - Shipping address
   - Add 2-3 products
   - Add taxes (make sure to configure GST)
   - Create order

3. **Create Multiple Scenarios**
   - Order 1: Same state (CGST + SGST)
   - Order 2: Different state (IGST)
   - Order 3: Multiple products
   - Order 4: With discount
   - Order 5: International (if applicable)

### Step 4: Start Testing

#### Test 1: Generate Single Invoice (2 minutes)
1. Open LetsPrint app
2. Click "Orders"
3. Click on any order
4. Click "Generate Invoice"
5. Wait for success message
6. Click "Download Invoice"
7. Open PDF and verify it looks correct

✅ **Expected:** PDF downloads with all details correct

#### Test 2: Email Invoice (1 minute)
1. On the same order
2. Click "Email Invoice"
3. Enter your email
4. Click "Send"
5. Check your email inbox

✅ **Expected:** Email received with PDF attachment

#### Test 3: HSN Code Mapping (3 minutes)
1. Navigate to "HSN Codes"
2. Search for "8471" (computers)
3. Click "Map Products"
4. Select products
5. Save mapping
6. Generate invoice for order with mapped product
7. Verify HSN code appears on invoice

✅ **Expected:** HSN code shows on invoice

#### Test 4: Template Selection (2 minutes)
1. Navigate to "Templates"
2. Preview different templates
3. Select "Professional" template
4. Set as default
5. Generate invoice
6. Verify new template is used

✅ **Expected:** Invoice uses selected template

#### Test 5: Bulk Generation (5 minutes)
1. Navigate to "Bulk Print"
2. Select date range with 3-5 orders
3. Click "Generate All"
4. Watch progress bar
5. Download all invoices
6. Verify all PDFs correct

✅ **Expected:** All invoices generate successfully

### Step 5: Quick Health Check

Run this command to check server health:

```bash
ssh root@72.60.99.154 "pm2 status letsprint && pm2 logs letsprint --lines 20 --nostream"
```

✅ **Expected:** App status "online", no errors in logs

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: "Business details required"
**Fix:** Go to Settings → Complete all business details → Save

### Issue 2: Invoice not generating
**Check:**
```bash
ssh root@72.60.99.154 "pm2 logs letsprint --err --lines 50"
```
Look for errors related to AWS S3 or database

### Issue 3: Email not sending
**Fix:** Check Settings → Email Configuration → Test connection

### Issue 4: HSN codes not showing
**Fix:** Map products to HSN codes first in HSN Codes page

### Issue 5: Slow performance
**Check:**
```bash
ssh root@72.60.99.154 "pm2 monit"
```
Look for high CPU/memory usage

---

## 📊 Testing Priority Matrix

| Priority | Feature | Time | Critical? |
|----------|---------|------|-----------|
| P0 | Single Invoice Generation | 5 min | ✅ YES |
| P0 | Download Invoice | 2 min | ✅ YES |
| P0 | Settings/Business Details | 5 min | ✅ YES |
| P1 | Email Invoice | 3 min | 🟡 IMPORTANT |
| P1 | HSN Code Mapping | 5 min | 🟡 IMPORTANT |
| P1 | Bulk Generation | 10 min | 🟡 IMPORTANT |
| P2 | Template Selection | 3 min | ⚪ NICE TO HAVE |
| P2 | CSV Export | 2 min | ⚪ NICE TO HAVE |
| P3 | Invoice History | 3 min | ⚪ NICE TO HAVE |

**Total Critical Testing Time:** ~30-40 minutes

---

## 🎯 Pass/Fail Criteria

### ✅ PASS Criteria:
- [ ] All P0 tests pass
- [ ] No critical bugs
- [ ] Invoice PDF generates correctly
- [ ] GST calculations accurate
- [ ] App loads within 3 seconds
- [ ] No console errors

### ❌ FAIL Criteria (Stop & Fix):
- Invoice not generating at all
- Wrong GST calculations
- Data loss
- Security vulnerabilities
- App crashes frequently

---

## 📸 Screenshot Checklist

Take screenshots of:
1. [ ] App dashboard (homepage)
2. [ ] Settings page with filled details
3. [ ] Orders list
4. [ ] Single order detail page
5. [ ] Generated invoice PDF
6. [ ] Email received
7. [ ] HSN codes page
8. [ ] Bulk print in progress
9. [ ] Queue status
10. [ ] Any errors encountered

Save in: `/workspace/testing-screenshots/`

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Mark testing complete in TESTING_CHECKLIST.md
2. 📝 Document any issues found
3. 🔧 Fix critical bugs
4. 📋 Create issue tickets for minor bugs
5. 📢 Notify team testing is complete
6. 🎉 Ready for production use!

If tests fail:
1. 📊 Document failures in detail
2. 🔍 Check server logs
3. 🐛 Debug and fix issues
4. 🔄 Re-test after fixes
5. 📋 Update tracking document

---

## 📞 Need Help?

**Server Access:**
```bash
ssh root@72.60.99.154
Password: Kalilinux@2812
```

**Check Logs:**
```bash
# Application logs
pm2 logs letsprint

# Error logs only
pm2 logs letsprint --err

# Follow logs live
pm2 logs letsprint --lines 100
```

**Restart App:**
```bash
pm2 restart letsprint
```

**Check Status:**
```bash
pm2 status
pm2 monit
```

---

## ✅ Quick Verification Commands

Run these commands to verify everything is working:

```bash
# 1. Check app is running
ssh root@72.60.99.154 "pm2 list | grep letsprint"

# 2. Check recent logs
ssh root@72.60.99.154 "pm2 logs letsprint --lines 10 --nostream"

# 3. Check database
ssh root@72.60.99.154 "cd /var/www/letsprint && npx prisma db pull"

# 4. Check disk space
ssh root@72.60.99.154 "df -h"

# 5. Test app responds
curl -I https://letsprint.indigenservices.com
```

---

**Happy Testing! 🎉**

For detailed testing, refer to: `TESTING_CHECKLIST.md`
