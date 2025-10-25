# ActiveCollab Self-Hosted Installation Guide

## Overview
This guide will help you install ActiveCollab 7.4.759 on your shared hosting server (77.37.45.67) on a custom port.

## Server Requirements

### System Requirements
- **PHP**: 7.4 or higher (CLI and web)
- **MySQL**: 5.7 or higher (with TRIGGER permissions)
- **Web Server**: Apache with mod_rewrite or Nginx
- **Memory**: At least 256MB PHP memory limit
- **Storage**: At least 500MB free space

### Required PHP Extensions
- mysqli or pdo_mysql
- gd or imagick
- curl
- mbstring
- openssl
- zip
- xml
- json
- iconv

### Optional but Recommended
- memcached (for better performance)
- opcache (enabled)

## Pre-Installation Steps

### 1. Check Server Environment
First, connect to your server and check the current environment:

```bash
ssh root@77.37.45.67
```

### 2. Check PHP Version and Extensions
```bash
php -v
php -m | grep -E "(mysqli|gd|curl|mbstring|openssl|zip|xml|json)"
```

### 3. Check Available Ports
```bash
netstat -tlnp | grep LISTEN
ss -tlnp | grep LISTEN
```

### 4. Find Available Port
Look for an unused port between 8000-9999:
```bash
for port in {8000..8100}; do
    if ! netstat -tlnp | grep ":$port "; then
        echo "Port $port is available"
        break
    fi
done
```

## Installation Process

### Step 1: Download ActiveCollab
Since you need the official ActiveCollab package (not just source code), you'll need to:

1. **Get a License**: Visit [ActiveCollab Accounts](https://accounts.activecollab.com/login)
2. **Download Package**: Download the self-hosted installation package
3. **Upload to Server**: Upload the package to your server

### Step 2: Prepare Installation Directory
```bash
# Create installation directory
mkdir -p /var/www/activecollab
cd /var/www/activecollab

# Extract the downloaded package
unzip activecollab-*.zip
```

### Step 3: Set Permissions
```bash
# Set proper permissions for ActiveCollab directories
chmod -R 755 /var/www/activecollab
chown -R www-data:www-data /var/www/activecollab

# Make specific directories writable
chmod -R 777 /var/www/activecollab/cache
chmod -R 777 /var/www/activecollab/compile
chmod -R 777 /var/www/activecollab/config
chmod -R 777 /var/www/activecollab/logs
chmod -R 777 /var/www/activecollab/thumbnails
chmod -R 777 /var/www/activecollab/upload
chmod -R 777 /var/www/activecollab/work
chmod -R 777 /var/www/activecollab/public/assets
```

### Step 4: Create Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE activecollab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'activecollab_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON activecollab_db.* TO 'activecollab_user'@'localhost';
GRANT CREATE, ALTER, DROP, INDEX, TRIGGER ON activecollab_db.* TO 'activecollab_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Web Server Configuration

### Option 1: Apache with Custom Port

Create a new virtual host configuration:

```bash
# Create new site configuration
nano /etc/apache2/sites-available/activecollab.conf
```

Add the following configuration:

```apache
<VirtualHost *:8080>
    ServerName your-domain.com
    DocumentRoot /var/www/activecollab/public
    
    <Directory /var/www/activecollab/public>
        AllowOverride All
        Require all granted
        
        # URL Rewriting
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^assets/(.*)$ assets/$1 [L]
        RewriteRule ^avatars/(.*)$ avatars/$1 [L]
        RewriteRule ^wallpapers/(.*)$ wallpapers/$1 [L]
        RewriteRule ^verify-existence$ verify.php [L]
        RewriteRule ^proxy\.php$ proxy.php [L]
        RewriteRule ^api/v([0-9]*)/(.*)$ api.php?path_info=$2&api_version=$1 [L]
        RewriteRule ^$ router.php [L]
        RewriteRule ^(.*)$ router.php?path_info=$1 [L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/activecollab_error.log
    CustomLog ${APACHE_LOG_DIR}/activecollab_access.log combined
</VirtualHost>
```

Enable the site and port:

```bash
# Add port to Apache configuration
echo "Listen 8080" >> /etc/apache2/ports.conf

# Enable site and restart Apache
a2ensite activecollab.conf
systemctl restart apache2
```

### Option 2: Nginx with Custom Port

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/activecollab
```

Add the following configuration:

```nginx
server {
    listen 8080;
    server_name your-domain.com;
    
    root /var/www/activecollab/public;
    index index.php router.php;
    
    access_log /var/log/nginx/activecollab.access.log;
    error_log /var/log/nginx/activecollab.error.log;
    
    # URL Rewriting
    location / {
        try_files $uri $uri/ @rewrite;
    }
    
    location @rewrite {
        rewrite ^/assets/(.*)$ /assets/$1 last;
        rewrite ^/avatars/(.*)$ /avatars/$1 last;
        rewrite ^/wallpapers/(.*)$ /wallpapers/$1 last;
        rewrite ^/verify-existence$ /verify.php last;
        rewrite ^/proxy\.php$ /proxy.php last;
        rewrite ^/api/v([0-9]*)/(.*)$ /api.php?path_info=$2&api_version=$1 last;
        rewrite ^$ /router.php last;
        rewrite ^(.*)$ /router.php?path_info=$1 last;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\. {
        deny all;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/activecollab /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Running the Installation

### Step 1: Access the Installer
Open your browser and navigate to:
```
http://77.37.45.67:8080
```

### Step 2: System Requirements Check
The installer will check if your server meets all requirements. Fix any issues that appear in red.

### Step 3: Database Configuration
Enter your database details:
- **Host**: localhost
- **Database Name**: activecollab_db
- **Username**: activecollab_user
- **Password**: secure_password_here

### Step 4: License Information
Enter your ActiveCollab license details and admin user information.

### Step 5: Complete Installation
Follow the remaining installation steps as guided by the installer.

## Post-Installation Configuration

### 1. Set Up Cron Jobs
Add the following cron job for maintenance tasks:

```bash
crontab -e
```

Add this line:
```
*/5 * * * * /usr/bin/php /var/www/activecollab/tasks/activecollab-cli.php hourly
```

### 2. Configure Email (Optional)
Edit the configuration file to set up email sending:

```bash
nano /var/www/activecollab/config/config.php
```

### 3. Set Up SSL (Recommended)
If you have SSL certificates, configure HTTPS for better security.

## Firewall Configuration

Make sure your custom port is accessible:

```bash
# For UFW
ufw allow 8080

# For iptables
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure all directories have proper permissions
2. **Database Connection**: Verify MySQL credentials and permissions
3. **PHP Extensions**: Install missing PHP extensions
4. **Memory Limits**: Increase PHP memory_limit if needed

### Useful Commands

```bash
# Check PHP configuration
php -i | grep -E "(memory_limit|max_execution_time|upload_max_filesize)"

# Check Apache/Nginx error logs
tail -f /var/log/apache2/activecollab_error.log
tail -f /var/log/nginx/activecollab.error.log

# Check ActiveCollab logs
tail -f /var/www/activecollab/logs/error.log
```

## Security Considerations

1. **Change Default Passwords**: Use strong passwords for database and admin accounts
2. **Regular Updates**: Keep ActiveCollab and server software updated
3. **Backup Strategy**: Implement regular backups of database and files
4. **SSL Certificate**: Use HTTPS in production
5. **Firewall Rules**: Restrict access to necessary ports only

## Next Steps

After successful installation:

1. **Configure User Accounts**: Set up user accounts and permissions
2. **Import Data**: If migrating from trial, import your data
3. **Customize Settings**: Configure company settings, themes, etc.
4. **Set Up Integrations**: Configure any third-party integrations
5. **Training**: Train your team on using ActiveCollab

## Support

If you encounter issues:
- Check ActiveCollab documentation: https://activecollab.com/help
- Contact ActiveCollab support: support@activecollab.com
- Check server logs for specific error messages

---

**Note**: This guide assumes you have the official ActiveCollab installation package. The repository you provided appears to contain only source code components, not the complete web application needed for installation.