# LetsPrint Invoice GST App - Setup Guide

## Current Deployment Information

### Production Server
- **Server IP**: 72.60.99.154
- **Domain**: https://letsprint.indigenservices.com
- **Port**: 3003
- **Process Manager**: PM2

### Shopify App Configuration

#### App Credentials
- **Client ID (API Key)**: `5a5fa193e345adea3497281c7f8d7c5f`
- **Client Secret**: (Contact admin for credentials - stored securely)

#### Shopify Partner Dashboard URLs
1. Go to: https://partners.shopify.com/
2. Navigate to your app
3. Set the following URLs:
   - **App URL**: `https://letsprint.indigenservices.com`
   - **Allowed redirection URL(s)**:
     ```
     https://letsprint.indigenservices.com/api/auth/callback
     ```

#### Required Scopes
```
read_customers,write_files,read_locations,read_orders,read_products,write_products,read_product_listings,read_inventory,write_inventory,read_themes,write_themes,read_content,write_content
```

## Quick Setup on Your Server

### 1. SSH into your server
```bash
ssh root@72.60.99.154
# Password: Kalilinux@2812
```

### 2. Clone the repository
```bash
cd /var/www
rm -rf letsprint  # Remove old installation if exists
git clone https://github.com/r2w34/letsprint-invoice-gst-app.git letsprint
cd letsprint
```

### 3. Create .env file
```bash
# Copy the .env.example and fill in your credentials
cp web/.env.example web/.env

# Then edit with your actual credentials
nano web/.env
```

Your `.env` file should contain:
```bash
# Shopify App Configuration
SHOPIFY_API_KEY=5a5fa193e345adea3497281c7f8d7c5f
SHOPIFY_API_SECRET=your_shopify_client_secret_here
HOST=letsprint.indigenservices.com
SHOPIFY_APP_URL=https://letsprint.indigenservices.com
PORT=3003

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/letsprint

# Node Environment
NODE_ENV=production

# Shopify Scopes
SCOPES=read_customers,write_files,read_locations,read_orders,read_products,write_products,read_product_listings,read_inventory,write_inventory,read_themes,write_themes,read_content,write_content

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name

# RazorPay Configuration
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EOF
```

### 4. Install dependencies
```bash
# Install backend dependencies
cd /var/www/letsprint/web
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 5. Build frontend
```bash
cd /var/www/letsprint/web/frontend
SHOPIFY_API_KEY=5a5fa193e345adea3497281c7f8d7c5f npm run build
cd ..
```

### 6. Start with PM2
```bash
# Stop existing process if running
pm2 stop letsprint
pm2 delete letsprint

# Start new process
cd /var/www/letsprint/web
pm2 start index.js --name letsprint --update-env

# Save PM2 configuration
pm2 save

# View logs
pm2 logs letsprint
```

## Nginx Configuration

Ensure your Nginx configuration at `/etc/nginx/sites-available/letsprint` looks like this:

```nginx
server {
    listen 80;
    server_name letsprint.indigenservices.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name letsprint.indigenservices.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

## MongoDB Setup

Ensure MongoDB is running:
```bash
# Check status
systemctl status mongod

# Start if not running
systemctl start mongod

# Enable on boot
systemctl enable mongod
```

## Troubleshooting

### App doesn't load in Shopify Admin

1. **Check PM2 status**:
   ```bash
   pm2 status
   pm2 logs letsprint --lines 50
   ```

2. **Verify environment variables**:
   ```bash
   pm2 env letsprint
   ```

3. **Check Shopify Partners Dashboard**:
   - Verify App URL: `https://letsprint.indigenservices.com`
   - Verify redirect URL: `https://letsprint.indigenservices.com/api/auth/callback`
   - Ensure API key matches: `5a5fa193e345adea3497281c7f8d7c5f`

4. **Test the server**:
   ```bash
   curl -I https://letsprint.indigenservices.com
   # Should return 200 OK
   ```

### OAuth Errors

1. **Clear browser cookies** for your Shopify store
2. **Reinstall the app** from Shopify Partners Dashboard
3. **Check server logs**:
   ```bash
   pm2 logs letsprint --nostream --lines 100
   ```

### Database Issues

1. **Check MongoDB connection**:
   ```bash
   mongo
   show dbs
   use letsprint
   db.stores.find()
   ```

2. **Restart MongoDB**:
   ```bash
   systemctl restart mongod
   ```

## Updating the App

To pull latest changes from GitHub:

```bash
cd /var/www/letsprint/web

# Pull latest code
git pull origin main

# Install any new dependencies
npm install
cd frontend && npm install && cd ..

# Rebuild frontend
cd frontend
SHOPIFY_API_KEY=5a5fa193e345adea3497281c7f8d7c5f npm run build
cd ..

# Restart PM2
pm2 restart letsprint --update-env
```

## PM2 Useful Commands

```bash
# View status
pm2 status

# View logs
pm2 logs letsprint

# View live logs
pm2 logs letsprint --lines 100

# Restart app
pm2 restart letsprint

# Restart with updated env vars
pm2 restart letsprint --update-env

# Stop app
pm2 stop letsprint

# Delete app
pm2 delete letsprint

# Monitor
pm2 monit

# Clear logs
pm2 flush letsprint
```

## Important Notes

⚠️ **Security**: Never commit the `.env` file to Git. It contains sensitive credentials.

⚠️ **SSL Certificate**: Ensure your SSL certificate is valid and up to date. Shopify requires HTTPS for embedded apps.

⚠️ **Database Backups**: Regularly backup your MongoDB database:
```bash
mongodump --db letsprint --out /backup/mongodb/$(date +%Y%m%d)
```

## Support

For issues or questions:
1. Check PM2 logs: `pm2 logs letsprint`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`

## Repository

GitHub: https://github.com/r2w34/letsprint-invoice-gst-app
