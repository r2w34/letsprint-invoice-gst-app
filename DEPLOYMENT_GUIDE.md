# 🚀 Deployment Guide - Local File Storage Migration

## 📋 Overview

This guide covers the deployment of the updated GST Invoice app with local file storage instead of AWS S3.

---

## 🔄 What Changed

### Before (S3 Storage)
- Files uploaded to AWS S3 bucket
- Required AWS credentials in .env
- Files accessed via S3 URLs

### After (Local Storage)
- Files stored locally in `/app/uploads/` directory
- No AWS credentials needed
- Files accessed via `https://shopconnect.mygstbill.com/uploads/`

---

## 📦 Files Modified

1. **controllers/UploadBrandLogoController.js**
   - Removed AWS SDK dependency
   - Implemented local disk storage using multer
   - Files saved to `/app/uploads/logos/` and `/app/uploads/signatures/`

2. **index.js**
   - Added static file serving: `app.use('/uploads', express.static(...))`

3. **routes/routes.js**
   - Updated to use multer middleware from controller

4. **Dockerfile**
   - Creates upload directories automatically
   - Sets proper permissions (755)

5. **README.md**
   - Updated documentation to reflect local storage

6. **.gitignore**
   - Excludes uploads directory from version control

---

## 🛠️ Deployment Steps

### Step 1: Pull Latest Code

```bash
cd /var/www/letsprint-invoice-gst-app
git pull origin main
```

### Step 2: Update Environment Variables

Edit `.env` and **REMOVE** these AWS variables (if present):
```env
# Remove these lines:
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...
```

Make sure `SHOPIFY_APP_URL` is set:
```env
SHOPIFY_APP_URL=https://shopconnect.mygstbill.com
```

### Step 3: Rebuild Docker Container

```bash
# Stop and remove old container
docker stop letsprint-gst-app
docker rm letsprint-gst-app

# Rebuild image
docker build \
  --build-arg SHOPIFY_API_KEY=your_api_key \
  -t letsprint-gst-invoice:latest .

# Run new container with volume mount for uploads
docker run -d \
  --name letsprint-gst-app \
  -p 3000:3000 \
  --env-file .env \
  -v /var/www/letsprint-invoice-gst-app/uploads:/app/uploads \
  --restart unless-stopped \
  letsprint-gst-invoice:latest
```

### Step 4: Verify Upload Directories

```bash
# Check directories exist
docker exec letsprint-gst-app ls -la /app/uploads/

# Should show:
# drwxr-xr-x  logos
# drwxr-xr-x  signatures
```

### Step 5: Test Deployment

1. **Access the app:**
   ```
   https://admin.shopify.com/store/YOUR_STORE/apps/letsprint-gst-invoice
   ```

2. **Navigate to:** Logo & Branding page

3. **Test logo upload:**
   - Select an image file (< 5MB)
   - Click upload
   - Should see success message (not "Upload failed")

4. **Verify file storage:**
   ```bash
   # Check uploaded files
   ls -lh /var/www/letsprint-invoice-gst-app/uploads/logos/
   ```

5. **Verify file access:**
   - Open: `https://shopconnect.mygstbill.com/uploads/logos/[filename]`
   - Should display the uploaded image

---

## 🔧 Nginx Configuration

Ensure nginx is configured to proxy all requests (no changes needed):

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

The Express app now serves `/uploads` as static files automatically.

---

## 📊 Monitoring

### Check Container Status
```bash
docker ps | grep letsprint
docker logs letsprint-gst-app --tail 50
```

### Check Upload Directory
```bash
# List uploaded files
ls -lh /var/www/letsprint-invoice-gst-app/uploads/logos/
ls -lh /var/www/letsprint-invoice-gst-app/uploads/signatures/

# Check disk space
df -h /var/www
```

### Test File Upload API
```bash
# Should return 200 OK
curl -X POST https://shopconnect.mygstbill.com/api/upload-logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@test-image.png"
```

---

## 🐛 Troubleshooting

### Issue: "Upload failed" error

**Check logs:**
```bash
docker logs letsprint-gst-app --tail 100 | grep -i upload
```

**Common causes:**
1. Upload directory doesn't exist
2. Wrong permissions on upload directory
3. Disk space full
4. File size exceeds 5MB limit

**Solutions:**
```bash
# Create directories manually if needed
docker exec letsprint-gst-app mkdir -p /app/uploads/logos /app/uploads/signatures

# Check permissions
docker exec letsprint-gst-app ls -la /app/uploads/

# Check disk space
df -h
```

---

### Issue: Uploaded files not accessible

**Check file exists:**
```bash
docker exec letsprint-gst-app ls -la /app/uploads/logos/
```

**Check nginx:**
```bash
systemctl status nginx
curl -I https://shopconnect.mygstbill.com/uploads/logos/test.png
```

**Check Express static middleware:**
```bash
docker logs letsprint-gst-app | grep -i "uploads"
```

---

### Issue: Old S3 URLs still in database

**Update database records:**
```javascript
// Connect to MongoDB
mongosh YOUR_MONGO_URI

// Check current logo URLs
db.storeprofiles.find({}, { logo: 1, signature: 1 })

// If needed, update old S3 URLs to local URLs
db.storeprofiles.updateMany(
  { logo: /s3.amazonaws.com/ },
  { $set: { logo: "" } }
)
```

---

## 🔒 Security Considerations

### File Upload Limits
- **Max file size:** 5MB (configured in controller)
- **Allowed types:** Images only (jpg, png, gif, etc.)
- **Validation:** Multer checks MIME type

### File Storage
- **Directory permissions:** 755 (readable by all, writable by app)
- **Volume mount:** Persists data outside container
- **Backup:** Include `/uploads` in backup scripts

### Access Control
- **Public access:** Files are publicly accessible via URL
- **Authentication:** Upload endpoints require Shopify session token
- **File naming:** Uses UUID to prevent guessing filenames

---

## 📁 Backup Strategy

### Include uploads in backups:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /backups/uploads-$DATE.tar.gz /var/www/letsprint-invoice-gst-app/uploads/
```

### Restore from backup:

```bash
# Stop container
docker stop letsprint-gst-app

# Restore files
tar -xzf /backups/uploads-20241202.tar.gz -C /

# Start container
docker start letsprint-gst-app
```

---

## 📊 Storage Requirements

### Estimated usage:
- **Average logo size:** 50-200 KB
- **Average signature size:** 20-100 KB
- **Per merchant:** ~300 KB
- **For 1000 merchants:** ~300 MB
- **Recommended free space:** 5+ GB

### Monitor disk usage:
```bash
# Current usage
du -sh /var/www/letsprint-invoice-gst-app/uploads/

# Set up alert for low disk space
df -h / | awk '{print $5}' | grep -o '[0-9]\+' | awk '{if ($1 > 80) print "Warning: Disk usage above 80%"}'
```

---

## ✅ Deployment Checklist

- [ ] Pull latest code from main branch
- [ ] Remove AWS credentials from .env
- [ ] Verify SHOPIFY_APP_URL in .env
- [ ] Stop and remove old Docker container
- [ ] Rebuild Docker image
- [ ] Run new container with volume mount
- [ ] Verify upload directories exist
- [ ] Test logo upload in app
- [ ] Test signature upload in app
- [ ] Verify uploaded files are accessible via URL
- [ ] Check Docker container logs for errors
- [ ] Monitor disk space usage
- [ ] Update backup scripts to include /uploads
- [ ] Document deployment in team wiki

---

## 📞 Support

If issues persist after following this guide:

1. Check container logs: `docker logs letsprint-gst-app --tail 200`
2. Verify nginx status: `systemctl status nginx`
3. Check disk space: `df -h`
4. Test file upload manually using curl
5. Contact development team with logs

---

*Last updated: December 2, 2024*
*Version: 1.1.0 - Local Storage Migration*
