# ⚡ QUICK TEST GUIDE - LetsPrint App

## 🚨 CRITICAL: Access Method

### ✅ CORRECT (Embedded in Shopify):
```
https://admin.shopify.com/store/volter-store/apps/letsprint
```

### ❌ WRONG (Direct/Standalone):
```
https://letsprint.indigenservices.com
https://letsprint.indigenservices.com/api/2024-10/shop.json
```

**Why?** Shopify embedded apps REQUIRE App Bridge authentication, which only works when embedded in Shopify Admin.

---

## 🧪 5-MINUTE TEST

### Step 1: Clear Cache (30 seconds)
```
1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "All time"
3. Check: ☑ Cookies ☑ Cached files
4. Clear data
5. CLOSE browser completely
6. Wait 5 seconds
7. Reopen browser
```

### Step 2: Open App (10 seconds)
```
1. Open: https://admin.shopify.com/store/volter-store/apps/letsprint
2. Press F12 (open Developer Tools)
3. Go to Console tab
4. Clear console (Ctrl+L)
```

### Step 3: Check Authentication (30 seconds)
**Look for these in console:**
```
✅ [AppBridgeProvider] Session token obtained
✅ Session token ready for authenticated requests
✅ ShopID (myshopify_domain): volter-store.myshopify.com
```

**If you see these, STOP and clear cache again:**
```
❌ "a.idToken is not a function"
❌ "401 Unauthorized"
```

### Step 4: Test Save (2 minutes)
```
1. Click "Settings" in sidebar
2. Fill ANY field (e.g., First Name: "Test")
3. Click "Save Changes"
4. Watch console
```

**Expected Console Output:**
```
[handleSave] ========== SAVE START ==========
[handleSave] shopId: volter-store.myshopify.com
[handleSave] Response status: 200
[handleSave] ✅ Settings saved successfully
```

**Expected Toast Message:**
```
✅ "Settings saved successfully!"
```

### Step 5: Verify (1 minute)
```
1. Press F5 (reload page)
2. Check if your data is still there
```

**✅ SUCCESS:** Data persists after reload
**❌ FAIL:** Data disappears

---

## 🐛 Quick Troubleshooting

### Problem: 401 Errors
**Cause:** Not using embedded mode or cache not cleared
**Fix:** 
1. Use Shopify Admin URL (not direct)
2. Clear cache completely
3. Close/reopen browser

### Problem: "idToken is not a function"
**Cause:** Old JavaScript cached
**Fix:**
1. Clear cache (ALL time, not just 1 hour)
2. Close browser COMPLETELY (quit app, not just tab)
3. Reopen and try again

### Problem: shopId is numeric (92847593845)
**Cause:** Old JavaScript cached
**Fix:** Same as above - clear cache completely

### Problem: Save doesn't trigger logs
**Cause:** Frontend not updated
**Fix:**
1. Hard reload: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Or clear cache again

### Problem: Data doesn't persist
**Cause:** shopId mismatch or database error
**Fix:** Check server logs:
```bash
ssh root@72.60.99.154
pm2 logs letsprint --lines 50
```

---

## 📊 What to Share if Issues Persist

1. **How you accessed the app** (URL)
2. **Did you clear cache?** (Yes/No)
3. **Browser console logs** (copy all)
4. **Server logs** (pm2 logs letsprint)
5. **Network tab** (screenshot of API request)

---

## 📞 Contact Info

**Server:** 72.60.99.154  
**App URL:** https://admin.shopify.com/store/volter-store/apps/letsprint  
**GitHub:** https://github.com/r2w34/letsprint-invoice-gst-app  

**PM2 Status:** `pm2 status`  
**Server Logs:** `pm2 logs letsprint`  

---

## ✅ Expected Complete Flow

```
1. Clear cache ✅
2. Open via Shopify Admin ✅
3. Console shows auth success ✅
4. Navigate to Settings ✅
5. Fill form ✅
6. Click Save ✅
7. Console shows [handleSave] logs ✅
8. Response 200 OK ✅
9. Toast: "Settings saved successfully!" ✅
10. Reload (F5) ✅
11. Data persists ✅
```

**Total time:** ~5 minutes

---

## 🚀 Ready to Test!

Remember:
- ✅ Use Shopify Admin (embedded)
- ✅ Clear cache completely
- ✅ Close browser, reopen
- ✅ Check console for logs
- ✅ Share complete logs if issues

Good luck! 🎉
