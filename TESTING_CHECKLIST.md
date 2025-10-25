# LetsPrint App - Comprehensive Testing Checklist

## 📋 Pre-Testing Requirements

### Access Requirements
- [ ] Shopify Partners Dashboard access
- [ ] Test/Development store with sample orders
- [ ] App installed in test store
- [ ] Admin access to app settings

### Test Data Preparation
- [ ] At least 5 test orders created in test store
- [ ] Orders with different tax scenarios:
  - [ ] Intra-state order (same state as business)
  - [ ] Inter-state order (different state)
  - [ ] Multiple products order
  - [ ] Single product order
  - [ ] Order with discounts

### Environment Verification
- [ ] Production app running: https://letsprint.indigenservices.com
- [ ] Server accessible: `ssh root@72.60.99.154`
- [ ] PM2 status: `pm2 status letsprint`
- [ ] Database accessible
- [ ] AWS S3 bucket configured
- [ ] Email SMTP configured (if applicable)

---

## 🧪 Testing Modules

### 1. APP INSTALLATION & ONBOARDING

#### 1.1 Install App
- [ ] Navigate to Shopify Partners Dashboard
- [ ] Go to Apps section
- [ ] Find "LetsPrint" app
- [ ] Click "Install" on test store
- [ ] Verify app appears in test store admin
- [ ] Check OAuth flow completes successfully
- [ ] Confirm app dashboard loads

**Expected Result:** App installs without errors, redirects to app dashboard

**Screenshot Location:** `/screenshots/01-installation/`

---

### 2. SETTINGS & BUSINESS CONFIGURATION

#### 2.1 Access Settings
- [ ] Click "Settings" in app navigation
- [ ] Verify settings page loads
- [ ] Check all form fields are visible

#### 2.2 Business Details Section
- [ ] Enter/Edit Business Name
- [ ] Enter/Edit Business Address
- [ ] Enter/Edit GSTIN (format: 22AAAAA0000A1Z5)
- [ ] Enter/Edit State
- [ ] Enter/Edit PIN Code
- [ ] Click "Save Business Details"
- [ ] Verify success message appears
- [ ] Refresh page and verify data persists

**Expected Result:** All business details save successfully and persist

#### 2.3 Bank Details Section
- [ ] Enter/Edit Bank Name
- [ ] Enter/Edit Account Number
- [ ] Enter/Edit IFSC Code
- [ ] Enter/Edit Branch Name
- [ ] Click "Save Bank Details"
- [ ] Verify success message
- [ ] Refresh and verify persistence

**Expected Result:** Bank details save and persist correctly

#### 2.4 Invoice Settings
- [ ] Set Invoice Prefix (e.g., "INV-")
- [ ] Set Starting Invoice Number
- [ ] Set Invoice Footer Text
- [ ] Upload Logo (if available)
- [ ] Click "Save Invoice Settings"
- [ ] Verify success message

**Expected Result:** Invoice settings save successfully

#### 2.5 Email Configuration (Optional)
- [ ] Enter SMTP Host
- [ ] Enter SMTP Port
- [ ] Enter SMTP Username
- [ ] Enter SMTP Password
- [ ] Click "Test Email"
- [ ] Verify test email received
- [ ] Save email settings

**Expected Result:** Email configuration saves and test email works

**Screenshot Location:** `/screenshots/02-settings/`

---

### 3. ORDERS PAGE

#### 3.1 Orders List View
- [ ] Navigate to "Orders" page
- [ ] Verify orders list loads
- [ ] Check pagination works (if >10 orders)
- [ ] Verify order details display:
  - [ ] Order number
  - [ ] Customer name
  - [ ] Order date
  - [ ] Total amount
  - [ ] Status

#### 3.2 Order Filtering & Search
- [ ] Test search by order number
- [ ] Test search by customer name
- [ ] Test date range filter
- [ ] Test status filter
- [ ] Clear filters and verify all orders show

**Expected Result:** Orders load correctly with proper filtering

**Screenshot Location:** `/screenshots/03-orders-list/`

---

### 4. SINGLE INVOICE GENERATION

#### 4.1 Order Detail Page
- [ ] Click on an order from list
- [ ] Verify order detail page loads
- [ ] Check all order information displays:
  - [ ] Customer details
  - [ ] Shipping address
  - [ ] Billing address
  - [ ] Product line items
  - [ ] Tax breakdown
  - [ ] Total amount

#### 4.2 Generate Invoice
- [ ] Click "Generate Invoice" button
- [ ] Wait for processing
- [ ] Verify success message
- [ ] Check invoice appears in order details

#### 4.3 Download Invoice
- [ ] Click "Download Invoice" button
- [ ] Verify PDF downloads
- [ ] Open PDF and verify:
  - [ ] Business details correct
  - [ ] Customer details correct
  - [ ] Products listed correctly
  - [ ] GST calculations accurate:
    - [ ] CGST + SGST for intra-state
    - [ ] IGST for inter-state
  - [ ] Total amount matches order
  - [ ] Invoice number generated correctly
  - [ ] HSN codes present (if configured)
  - [ ] Logo displays (if uploaded)
  - [ ] Bank details present

#### 4.4 Email Invoice
- [ ] Click "Email Invoice" button
- [ ] Enter customer email (if not auto-filled)
- [ ] Click "Send"
- [ ] Verify success message
- [ ] Check customer inbox for email
- [ ] Verify email content:
  - [ ] Professional formatting
  - [ ] Invoice attached
  - [ ] Business branding present

#### 4.5 View in Shopify
- [ ] Click "View in Shopify" button
- [ ] Verify redirects to Shopify admin order page
- [ ] Confirm correct order opens

**Expected Result:** Invoice generates, downloads, and emails successfully

**Screenshot Location:** `/screenshots/04-single-invoice/`

---

### 5. HSN CODE MANAGEMENT

#### 5.1 Access HSN Codes Page
- [ ] Navigate to "HSN Codes" page
- [ ] Verify page loads
- [ ] Check HSN code list displays

#### 5.2 Search HSN Codes
- [ ] Use search box to find HSN codes
- [ ] Test search by code number
- [ ] Test search by description
- [ ] Verify results filter correctly

#### 5.3 Product HSN Mapping
- [ ] Click "Map Products" for an HSN code
- [ ] Select products from list
- [ ] Save mapping
- [ ] Verify success message
- [ ] Check mapping persists on refresh

#### 5.4 Add Custom HSN Code
- [ ] Click "Add HSN Code"
- [ ] Enter HSN code (8 digits)
- [ ] Enter description
- [ ] Enter GST rate
- [ ] Save
- [ ] Verify code appears in list

#### 5.5 Edit HSN Code
- [ ] Click "Edit" on existing code
- [ ] Modify description/rate
- [ ] Save changes
- [ ] Verify updates persist

#### 5.6 Delete HSN Code
- [ ] Click "Delete" on custom code
- [ ] Confirm deletion
- [ ] Verify code removed from list

**Expected Result:** HSN codes can be searched, mapped, added, edited, and deleted

**Screenshot Location:** `/screenshots/05-hsn-codes/`

---

### 6. TEMPLATE MANAGEMENT

#### 6.1 View Templates
- [ ] Navigate to "Templates" page
- [ ] Verify available templates display
- [ ] Check template previews load

#### 6.2 Template Preview
- [ ] Click "Preview" on each template:
  - [ ] Template 1 (Basic)
  - [ ] Template 2 (Professional)
  - [ ] Template 3 (Modern)
  - [ ] Template 4 (Minimal)
- [ ] Verify preview shows sample invoice
- [ ] Check branding elements display

#### 6.3 Select Template
- [ ] Select a template
- [ ] Click "Set as Default"
- [ ] Verify success message
- [ ] Generate invoice and verify uses selected template

#### 6.4 Customize Template (if available)
- [ ] Click "Customize"
- [ ] Modify colors/fonts
- [ ] Update header/footer
- [ ] Preview changes
- [ ] Save customization
- [ ] Generate invoice to verify changes

**Expected Result:** Templates can be previewed and selected successfully

**Screenshot Location:** `/screenshots/06-templates/`

---

### 7. BULK INVOICE GENERATION

#### 7.1 Access Bulk Print Page
- [ ] Navigate to "Bulk Print" page
- [ ] Verify page loads
- [ ] Check bulk options display

#### 7.2 Select Orders for Bulk Processing
**Method 1: Date Range**
- [ ] Select start date
- [ ] Select end date
- [ ] Click "Load Orders"
- [ ] Verify matching orders display
- [ ] Check order count is correct

**Method 2: Manual Selection**
- [ ] Go to orders list
- [ ] Select multiple orders via checkboxes
- [ ] Click "Bulk Generate"

#### 7.3 Configure Bulk Settings
- [ ] Select template for all invoices
- [ ] Choose email option:
  - [ ] Generate only
  - [ ] Generate and email
- [ ] Set any additional options

#### 7.4 Start Bulk Generation
- [ ] Click "Generate All Invoices"
- [ ] Verify confirmation dialog
- [ ] Confirm action
- [ ] Watch progress indicator:
  - [ ] Progress bar updates
  - [ ] Current/total count displays
  - [ ] Estimated time shown

#### 7.5 Monitor Queue Status
- [ ] Check queue status updates in real-time
- [ ] Verify individual order statuses:
  - [ ] Pending
  - [ ] Processing
  - [ ] Completed
  - [ ] Failed (if any)
- [ ] Check error messages for failed invoices

#### 7.6 Download Bulk Results
- [ ] Wait for all invoices to complete
- [ ] Click "Download All" (if available)
- [ ] Verify ZIP file downloads
- [ ] Extract and check:
  - [ ] All invoices present
  - [ ] Proper file naming
  - [ ] PDFs valid and correct

#### 7.7 Bulk Email Verification
- [ ] If email option selected, check:
  - [ ] Emails sent to all customers
  - [ ] No duplicate emails
  - [ ] All attachments valid

**Expected Result:** Bulk generation processes all orders successfully with proper progress tracking

**Screenshot Location:** `/screenshots/07-bulk-print/`

---

### 8. CSV EXPORT

#### 8.1 Export Orders
- [ ] Navigate to Orders page
- [ ] Select date range or orders
- [ ] Click "Export CSV"
- [ ] Verify CSV file downloads

#### 8.2 Validate CSV Content
- [ ] Open CSV in Excel/Sheets
- [ ] Verify columns present:
  - [ ] Order Number
  - [ ] Customer Name
  - [ ] Order Date
  - [ ] Total Amount
  - [ ] Tax Amount
  - [ ] GSTIN (if available)
  - [ ] Invoice Number
  - [ ] Status
- [ ] Check data accuracy
- [ ] Verify formatting correct

**Expected Result:** CSV exports with accurate order data

**Screenshot Location:** `/screenshots/08-csv-export/`

---

### 9. INVOICE HISTORY

#### 9.1 View Invoice History
- [ ] Navigate to "Invoices" page (if available)
- [ ] Verify generated invoices list
- [ ] Check sorting options:
  - [ ] By date
  - [ ] By order number
  - [ ] By customer

#### 9.2 Search Invoices
- [ ] Test search by invoice number
- [ ] Test search by customer name
- [ ] Test search by date range

#### 9.3 Regenerate Invoice
- [ ] Select an existing invoice
- [ ] Click "Regenerate"
- [ ] Verify new version created
- [ ] Check version history (if available)

**Expected Result:** Invoice history displays and allows regeneration

**Screenshot Location:** `/screenshots/09-invoice-history/`

---

### 10. ERROR HANDLING & EDGE CASES

#### 10.1 Missing Business Details
- [ ] Clear business details in settings
- [ ] Try to generate invoice
- [ ] Verify error message: "Please complete business details"
- [ ] Check invoice generation blocked

#### 10.2 Invalid GSTIN
- [ ] Enter invalid GSTIN format
- [ ] Try to save
- [ ] Verify validation error
- [ ] Check format guidance shown

#### 10.3 Network Errors
- [ ] Disconnect internet briefly
- [ ] Try to generate invoice
- [ ] Verify error handling
- [ ] Check retry mechanism

#### 10.4 S3 Upload Failure
- [ ] Temporarily break S3 credentials (on server)
- [ ] Generate invoice
- [ ] Verify graceful error
- [ ] Check fallback behavior

#### 10.5 Email Send Failure
- [ ] Use invalid SMTP settings
- [ ] Try to email invoice
- [ ] Verify error message
- [ ] Check invoice still downloadable

#### 10.6 Large Order Testing
- [ ] Create order with 50+ line items
- [ ] Generate invoice
- [ ] Verify pagination/handling
- [ ] Check PDF renders correctly

#### 10.7 Special Characters
- [ ] Create order with:
  - [ ] Special chars in customer name (é, ñ, etc.)
  - [ ] Long product names
  - [ ] Unicode characters
- [ ] Generate invoice
- [ ] Verify proper encoding

**Expected Result:** All errors handled gracefully with helpful messages

**Screenshot Location:** `/screenshots/10-error-handling/`

---

### 11. PERFORMANCE TESTING

#### 11.1 Page Load Times
- [ ] Measure dashboard load time: _______ seconds
- [ ] Measure orders page load time: _______ seconds
- [ ] Measure settings page load time: _______ seconds
- [ ] All should be < 3 seconds

#### 11.2 Invoice Generation Speed
- [ ] Single invoice generation: _______ seconds
- [ ] Should be < 5 seconds
- [ ] Bulk 10 invoices: _______ seconds
- [ ] Bulk 50 invoices: _______ minutes

#### 11.3 Search Performance
- [ ] Search in 100+ orders: _______ seconds
- [ ] Search HSN codes: _______ seconds
- [ ] Should be < 2 seconds

#### 11.4 Concurrent Users (if possible)
- [ ] Test with 2-3 users simultaneously
- [ ] Generate invoices concurrently
- [ ] Verify no conflicts
- [ ] Check queue handles properly

**Expected Result:** All operations complete within acceptable time limits

---

### 12. MOBILE RESPONSIVENESS (Optional)

#### 12.1 Mobile Browser Testing
- [ ] Access app on mobile device
- [ ] Test on different screen sizes:
  - [ ] Phone (< 480px)
  - [ ] Tablet (768px)
  - [ ] Laptop (1024px)

#### 12.2 Mobile Functionality
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Buttons accessible
- [ ] PDF downloads work
- [ ] No horizontal scrolling

**Expected Result:** App is usable on mobile devices

---

### 13. SECURITY TESTING

#### 13.1 Authentication
- [ ] Logout and verify redirect
- [ ] Try accessing app without login
- [ ] Verify redirects to Shopify auth
- [ ] Check session persistence

#### 13.2 Authorization
- [ ] Test with different Shopify permissions
- [ ] Verify app requests correct scopes
- [ ] Check unauthorized actions blocked

#### 13.3 Data Security
- [ ] Verify HTTPS everywhere
- [ ] Check API keys not exposed in frontend
- [ ] Verify database credentials secure
- [ ] Check S3 bucket permissions

**Expected Result:** All security measures in place

---

### 14. INTEGRATION TESTING

#### 14.1 Shopify Integration
- [ ] Order data syncs correctly
- [ ] Customer data fetches properly
- [ ] Product data accurate
- [ ] Tax calculations match Shopify

#### 14.2 AWS S3 Integration
- [ ] Files upload successfully
- [ ] Files retrievable via download
- [ ] Proper file organization
- [ ] No permission errors

#### 14.3 Email Integration
- [ ] Emails send successfully
- [ ] Proper SMTP authentication
- [ ] Attachments work
- [ ] No emails marked as spam

**Expected Result:** All integrations work seamlessly

---

### 15. BROWSER COMPATIBILITY

#### 15.1 Test in Different Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 15.2 Check Functionality
- [ ] All features work in each browser
- [ ] UI renders correctly
- [ ] No console errors
- [ ] PDF generation works

**Expected Result:** App works in all major browsers

---

## 📝 TESTING REPORT TEMPLATE

### Test Session Information
- **Date:** _________________
- **Tester:** _________________
- **Environment:** Production / Staging
- **App Version:** v1.0.0
- **Test Store:** _________________

### Summary
- **Total Tests:** _____
- **Passed:** _____
- **Failed:** _____
- **Blocked:** _____
- **Pass Rate:** _____%

### Critical Issues Found
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Minor Issues Found
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Recommendations
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Overall Assessment
[ ] Ready for Production
[ ] Needs Minor Fixes
[ ] Needs Major Fixes
[ ] Not Ready

---

## 🚀 DEPLOYMENT CHECKLIST (After Testing)

- [ ] All critical tests passed
- [ ] All bugs fixed
- [ ] Documentation updated
- [ ] README.md updated
- [ ] CHANGELOG.md created
- [ ] Version tag created in Git
- [ ] Production backup taken
- [ ] Deploy to production
- [ ] Smoke test in production
- [ ] Monitor for 24 hours
- [ ] Notify users of new features

---

## 📞 SUPPORT & ESCALATION

### If Issues Found:
1. Document with screenshots
2. Check server logs: `ssh root@72.60.99.154 "pm2 logs letsprint"`
3. Check application logs in `/var/www/letsprint/logs/`
4. Report to development team
5. Priority levels:
   - **P0 (Critical):** App not accessible, data loss
   - **P1 (High):** Feature broken, security issue
   - **P2 (Medium):** Minor feature issue, UI bug
   - **P3 (Low):** Enhancement, documentation

### Log Files Location
- **Application Logs:** `/var/www/letsprint/logs/`
- **PM2 Logs:** `pm2 logs letsprint`
- **Nginx Logs:** `/var/log/nginx/`

---

## ✅ SIGN-OFF

**Tested By:** _________________
**Date:** _________________
**Signature:** _________________

**Approved By:** _________________
**Date:** _________________
**Signature:** _________________
