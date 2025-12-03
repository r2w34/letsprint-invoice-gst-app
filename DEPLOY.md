# 🚀 Production Deployment Guide

## Quick Deploy (Copy-Paste on Production Server)

```bash
# SSH to production
ssh vai_indigen@35.193.163.86

# Navigate to app directory (adjust path if needed)
cd ~/letsprint-invoice-gst-app

# Pull latest code
git fetch origin
git checkout fix-navigation-and-cleanup-branding
git pull origin fix-navigation-and-cleanup-branding

# Install dependencies and build
npm install
cd frontend && npm install && npm run build && cd ..

# Restart app
pm2 restart all

# Check logs
pm2 logs
```

## What's New

This deployment includes:
- ✨ **Installation Landing Page** - Beautiful page at https://shopconnect.mygstbill.com
- 🔐 **Fixed OAuth Flow** - Proper app installation process
- 🛡️ **Security Checks** - Shop domain validation
- 📋 **Logo Upload Fix** - Working file upload functionality

## Verification

After deployment, visit: https://shopconnect.mygstbill.com

**Expected Result:**
- Should show a professional installation page with:
  - Purple gradient background
  - Shop domain input form
  - "Install LetsPrint GST Invoice" heading
  - Feature highlights

**If you see the old page:**
- Clear browser cache (Ctrl+Shift+R)
- Check PM2 logs: `pm2 logs letsprint-app`
- Verify correct branch: `git branch` (should be on fix-navigation-and-cleanup-branding)

## Rollback (If Needed)

```bash
cd ~/letsprint-invoice-gst-app
git checkout main
git pull origin main
npm install
cd frontend && npm install && npm run build && cd ..
pm2 restart all
```

## Support

- **GitHub**: https://github.com/r2w34/letsprint-invoice-gst-app
- **Latest Commit**: bad2618
- **Branch**: fix-navigation-and-cleanup-branding
