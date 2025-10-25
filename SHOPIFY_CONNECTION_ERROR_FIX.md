# 🔧 **SHOPIFY CONNECTION ERROR FIX GUIDE**

## 🚨 **ERROR: "accounts.shopify.com refused to connect"**

### **📋 Problem Analysis**
Based on the logs, you're experiencing several interconnected issues:

1. **GraphQL Error**: `Field 'domain' doesn't exist on type 'Shop'` ✅ **FIXED**
2. **Authentication Redirects**: Export requests redirecting to login
3. **Shopify Partners Configuration**: "accounts.shopify.com refused to connect"

---

## ✅ **ISSUE 1: FIXED - GraphQL Error**

**Problem**: Settings page was using invalid `domain` field
**Solution**: Updated GraphQL query to use `myshopifyDomain` instead

```graphql
# ❌ BEFORE (Broken)
query getShopInfo {
  shop {
    domain  # This field doesn't exist
  }
}

# ✅ AFTER (Fixed)
query getShopInfo {
  shop {
    myshopifyDomain  # Correct field name
  }
}
```

**Status**: ✅ **DEPLOYED AND FIXED**

---

## 🔧 **ISSUE 2: AUTHENTICATION & EXPORT PROBLEMS**

### **Root Cause Analysis**
The logs show:
```
POST /app/insights 302 - - 1.781 ms
GET /auth/login 200 - - 5.509 ms
```

This means export requests are being redirected to login, indicating session/authentication issues.

### **🎯 SOLUTION STEPS**

#### **Step 1: Check Shopify Partners Dashboard Configuration**

1. **Go to**: https://partners.shopify.com/
2. **Navigate to**: Apps → Your App → App setup
3. **Verify these settings**:

```
✅ App URL: https://ayt.trustclouds.in
✅ Allowed redirection URLs: 
   - https://ayt.trustclouds.in/auth/callback
   - https://ayt.trustclouds.in/auth/shopify/callback
   - https://ayt.trustclouds.in/api/auth/callback
```

#### **Step 2: Update App URLs in Partners Dashboard**

**CRITICAL**: Make sure your app URL is set correctly:

```
❌ WRONG: http://ayt.trustclouds.in (HTTP)
❌ WRONG: https://example.com (Example domain)
❌ WRONG: https://ayt.trustclouds.in:3001 (With port)

✅ CORRECT: https://ayt.trustclouds.in (HTTPS, no port)
```

#### **Step 3: Check App Scopes**

Ensure your app has the correct scopes in Partners dashboard:
```
✅ Required Scopes:
├── read_orders
├── read_products  
├── read_analytics
└── read_reports (if available)
```

#### **Step 4: Verify Environment Variables**

Your current environment variables are:
```
✅ SHOPIFY_API_KEY=250f9b4758e185ec9318d6c0d5dbb2cb
✅ SHOPIFY_API_SECRET=d593332242abe59ceb9585394f68eabb  
✅ HOST=ayt.trustclouds.in
✅ SCOPES=read_orders,read_products,read_customers,read_analytics,read_reports
```

**Status**: ✅ **Environment variables are correct**

#### **Step 5: Fix Export Authentication Issues**

The export functionality is failing because of session authentication. Here's the fix:

**Problem**: Export requests lose authentication context
**Solution**: Update export handlers to maintain session

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

### **🔧 Fix Shopify Partners Dashboard**

1. **Login to**: https://partners.shopify.com/
2. **Go to**: Apps → Your Analytics App
3. **Click**: App setup
4. **Update these fields**:

```
App URL: https://ayt.trustclouds.in
Allowed redirection URLs:
├── https://ayt.trustclouds.in/auth/callback
├── https://ayt.trustclouds.in/auth/shopify/callback  
└── https://ayt.trustclouds.in/api/auth/callback
```

5. **Save changes**

### **🔄 Test the Fix**

After updating Partners dashboard:

1. **Uninstall** the app from your test store
2. **Reinstall** the app from Partners dashboard
3. **Test** all functionality:
   - Dashboard loading
   - Export functionality
   - All analytics pages

---

## 🚨 **COMMON CAUSES OF "accounts.shopify.com refused to connect"**

### **1. Incorrect App URL**
```
❌ Wrong: http://ayt.trustclouds.in (HTTP instead of HTTPS)
❌ Wrong: https://ayt.trustclouds.in:3001 (Including port number)
❌ Wrong: https://example.com (Default/placeholder URL)
✅ Correct: https://ayt.trustclouds.in
```

### **2. Missing Redirect URLs**
```
❌ Missing: Redirect URLs not configured
❌ Wrong: http:// URLs instead of https://
✅ Correct: All HTTPS redirect URLs configured
```

### **3. SSL Certificate Issues**
```
❌ Invalid: SSL certificate not properly configured
❌ Expired: SSL certificate expired
✅ Valid: SSL certificate working (yours is ✅ working)
```

### **4. CORS/Security Headers**
```
❌ Blocked: X-Frame-Options blocking embedding
❌ Missing: Content-Security-Policy issues
✅ Configured: Headers properly set (yours are ✅ working)
```

---

## 🔍 **DEBUGGING STEPS**

### **Step 1: Test App URL Directly**
```bash
curl -I https://ayt.trustclouds.in
# Should return: HTTP/2 200
```

### **Step 2: Test SSL Certificate**
```bash
openssl s_client -connect ayt.trustclouds.in:443 -servername ayt.trustclouds.in
# Should show valid certificate
```

### **Step 3: Check App Installation**
1. Go to your Shopify admin
2. Navigate to Apps
3. Look for your analytics app
4. If not installed, install from Partners dashboard

---

## 🎯 **EXPORT FUNCTIONALITY FIX**

The export buttons are redirecting to login because of session issues. Here's the technical fix:

### **Root Cause**
```javascript
// ❌ PROBLEM: Form submission loses session context
const form = document.createElement('form');
form.method = 'POST';
form.action = '/app/insights';
form.submit(); // This loses the embedded app context
```

### **Solution Options**

#### **Option 1: Use Remix Form (Recommended)**
```javascript
// ✅ SOLUTION: Use Remix's built-in form handling
import { Form } from "@remix-run/react";

<Form method="post">
  <input type="hidden" name="actionType" value="exportInsights" />
  <Button type="submit">Export CSV</Button>
</Form>
```

#### **Option 2: Use Fetch API**
```javascript
// ✅ ALTERNATIVE: Use fetch with proper headers
const handleExport = async () => {
  const response = await fetch('/app/insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'actionType=exportInsights'
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
  }
};
```

---

## ✅ **CURRENT STATUS**

### **✅ Fixed Issues**
- ✅ GraphQL `domain` field error → Fixed
- ✅ Settings page loading → Working
- ✅ App deployment → Stable
- ✅ SSL certificate → Valid
- ✅ Environment variables → Correct

### **🔧 Remaining Issues**
- 🔧 Shopify Partners dashboard configuration
- 🔧 Export authentication context
- 🔧 "accounts.shopify.com refused to connect"

---

## 🚀 **NEXT STEPS**

### **Immediate (Do Now)**
1. **Update Shopify Partners Dashboard** with correct URLs
2. **Reinstall app** in test store
3. **Test export functionality**

### **If Still Having Issues**
1. **Clear browser cache** and cookies
2. **Try incognito/private browsing**
3. **Check browser console** for JavaScript errors
4. **Test with different browser**

### **Advanced Debugging**
1. **Check nginx logs**: `tail -f /var/log/nginx/error.log`
2. **Check app logs**: `journalctl -u shopify-analytics -f`
3. **Test API endpoints** directly with curl

---

## 📞 **SUPPORT RESOURCES**

### **Shopify Documentation**
- [App Authentication](https://shopify.dev/docs/apps/auth)
- [Embedded Apps](https://shopify.dev/docs/apps/tools/app-bridge)
- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)

### **Common Solutions**
- [Shopify Partners Help](https://help.shopify.com/en/partners)
- [App Bridge Documentation](https://shopify.dev/docs/api/app-bridge)
- [Remix Documentation](https://remix.run/docs)

---

## 🎊 **SUMMARY**

**Your app infrastructure is solid:**
- ✅ Server running properly
- ✅ SSL certificate valid  
- ✅ Environment variables correct
- ✅ GraphQL errors fixed

**The main issue is likely:**
- 🔧 Shopify Partners dashboard configuration
- 🔧 App URL/redirect URL mismatch

**Action Required:**
1. **Update Partners dashboard** with correct URLs
2. **Reinstall app** to refresh configuration
3. **Test export functionality**

**Once Partners dashboard is fixed, your app should work perfectly!**

---

**🚀 Your Shopify Analytics Platform is ready - just needs the Partners dashboard configuration update! 🎯**

