# 🚀 Shopify App Setup Guide - Fix "Example Domain" Issue

## 🎯 **Problem**: App showing "Example Domain" instead of Analytics Dashboard

Your app is installed but pointing to the wrong URL. Here's the complete fix:

## 📋 **Method 1: Update Existing App (Recommended)**

### **Step 1: Access Partners Dashboard**
1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Sign in with your account
3. Navigate to **Apps** → Find **"Sales & Order Analytic"**

### **Step 2: Update App URLs**
In the app settings, update:
```
App URL: https://ayt.trustclouds.in
Allowed redirection URLs: https://ayt.trustclouds.in/auth/callback
```

### **Step 3: Verify Scopes**
Ensure these scopes are enabled:
- ✅ `read_orders`
- ✅ `read_products`
- ✅ `read_customers`
- ✅ `read_analytics`
- ✅ `read_reports`

---

## 📋 **Method 2: Create New App (If you don't have Partners access)**

### **Step 1: Create Shopify Partners Account**
1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Sign up for a Partners account
3. Complete the verification process

### **Step 2: Create New App**
1. Click **"Create app"**
2. Choose **"Public app"** or **"Custom app"**
3. Fill in app details:

```
App Name: Sales & Order Analytics Dashboard
App URL: https://ayt.trustclouds.in
Allowed redirection URLs: https://ayt.trustclouds.in/auth/callback
```

### **Step 3: Configure App Settings**
```
App type: Embedded app
Distribution: Public app (or Custom for single store)
Scopes: read_orders,read_products,read_customers,read_analytics,read_reports
```

### **Step 4: Get App Credentials**
After creating the app, you'll get:
- **Client ID**: (use this in your .env file)
- **Client Secret**: (use this in your .env file)

---

## 🔧 **Update Server Configuration**

If you get new credentials, update the server:

### **Step 1: Update Environment Variables**
```bash
# SSH into your server
ssh root@194.164.149.183

# Update .env file with new credentials
cd /var/www/shopify-analytics/shopify-analytics-dashboard-v2
nano .env
```

Update these values:
```env
SHOPIFY_API_KEY=YOUR_NEW_CLIENT_ID
SHOPIFY_API_SECRET=YOUR_NEW_CLIENT_SECRET
SHOPIFY_APP_URL=https://ayt.trustclouds.in
HOST=ayt.trustclouds.in
```

### **Step 2: Restart the Service**
```bash
systemctl restart shopify-analytics
systemctl status shopify-analytics
```

---

## 📱 **Install App in Your Store**

### **Step 1: Get Installation URL**
From Partners dashboard, get the installation URL or:
1. Go to your app in Partners dashboard
2. Click **"Test on development store"** or **"Get shareable link"**

### **Step 2: Install in Your Store**
1. Open the installation URL
2. Select your store: **ashwin-9597**
3. Review permissions and click **"Install app"**
4. Complete OAuth flow

---

## ✅ **Verification Steps**

After installation, verify:

### **Step 1: Check App in Shopify Admin**
1. Go to your Shopify admin
2. Navigate to **Apps** → **Sales & Order Analytic**
3. Should now show the analytics dashboard instead of "Example Domain"

### **Step 2: Test Dashboard Features**
- ✅ KPIs display (Revenue, Orders, AOV)
- ✅ Order table loads with data
- ✅ Charts render properly
- ✅ Export functionality works
- ✅ Date filters work

---

## 🚨 **Troubleshooting**

### **Issue: Still showing "Example Domain"**
**Solution**: Clear browser cache and cookies, then try again

### **Issue: "App not found" error**
**Solution**: Ensure app URL exactly matches: `https://ayt.trustclouds.in`

### **Issue: Authentication errors**
**Solution**: Verify client ID and secret are correct in .env file

### **Issue: No data showing**
**Solution**: 
1. Check if store has orders
2. Verify API scopes are granted
3. Check server logs: `journalctl -u shopify-analytics -f`

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check server status**: `systemctl status shopify-analytics`
2. **View logs**: `journalctl -u shopify-analytics -f`
3. **Test app directly**: Visit `https://ayt.trustclouds.in`
4. **Verify SSL**: Ensure certificate is valid

---

## 🎉 **Expected Result**

After following these steps, when you click on **"Sales & Order Analytic"** in your Shopify admin, you should see:

✅ **Analytics Dashboard** with:
- Revenue, Orders, AOV, Conversion Rate KPIs
- Interactive charts and graphs
- Order management table
- Export functionality
- Professional Shopify Polaris UI

Instead of the "Example Domain" page.

---

**🔗 Your App URL**: https://ayt.trustclouds.in
**🏪 Your Store**: ashwin-9597.myshopify.com
**📊 Expected Dashboard**: Full analytics with real store data