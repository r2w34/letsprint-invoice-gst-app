# ActiveCollab Manual Installation Guide

## Step 1: Connect to Your Server
```bash
ssh root@77.37.45.67
```

## Step 2: Run the Installation Script

### Option A: Copy and Run the Script
1. Copy the entire content of `install_activecollab.sh`
2. On your server, create the file:
```bash
nano /tmp/install_activecollab.sh
```
3. Paste the content and save (Ctrl+X, Y, Enter)
4. Make it executable and run:
```bash
chmod +x /tmp/install_activecollab.sh
bash /tmp/install_activecollab.sh
```

### Option B: Quick One-Liner Setup
Run these commands one by one:

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install required packages
apt-get install -y apache2 mysql-server php8.1 php8.1-cli php8.1-common php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-mbstring php8.1-zip php8.1-intl libapache2-mod-php8.1 unzip wget

# Enable Apache modules
a2enmod rewrite
a2enmod php8.1

# Create database (replace 'your_password' with a strong password)
mysql -e "CREATE DATABASE activecollab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER 'activecollab_user'@'localhost' IDENTIFIED BY 'your_password';"
mysql -e "GRANT ALL PRIVILEGES ON activecollab_db.* TO 'activecollab_user'@'localhost';"
mysql -e "GRANT TRIGGER ON activecollab_db.* TO 'activecollab_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Set MySQL thread_stack
echo "thread_stack = 256K" >> /etc/mysql/mysql.conf.d/mysqld.cnf
systemctl restart mysql

# Create directory
mkdir -p /var/www/activecollab
cd /var/www/activecollab

# Download probe
wget https://raw.githubusercontent.com/activecollab/activecollab-probe/master/probe.php
```

## Step 3: Configure Apache for a Specific Port

Choose an available port (e.g., 8080, 8081, 8082) and create the configuration:

```bash
# Check which ports are in use
netstat -tlnp | grep LISTEN

# Create Apache config (replace 8080 with your chosen port)
cat > /etc/apache2/sites-available/activecollab.conf << 'EOF'
Listen 8080
<VirtualHost *:8080>
    ServerName 77.37.45.67
    DocumentRoot /var/www/activecollab
    
    <Directory /var/www/activecollab>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    php_value memory_limit 256M
    php_value upload_max_filesize 100M
    php_value post_max_size 100M
</VirtualHost>
EOF

# Enable site and reload Apache
a2ensite activecollab.conf
systemctl reload apache2

# Set permissions
chown -R www-data:www-data /var/www/activecollab
chmod -R 755 /var/www/activecollab
```

## Step 4: Test Your Environment

1. Edit the probe.php file:
```bash
nano /var/www/activecollab/probe.php
```

2. Update these lines with your database info:
```php
const DB_HOST = 'localhost';
const DB_USER = 'activecollab_user';
const DB_PASS = 'your_password';
const DB_NAME = 'activecollab_db';
```

3. Visit: `http://77.37.45.67:8080/probe.php`

## Step 5: Download and Install ActiveCollab

1. Go to https://accounts.activecollab.com/login
2. Log in with your license email
3. Download the ActiveCollab package
4. Upload it to your server:
```bash
# From your local machine
scp activecollab-*.zip root@77.37.45.67:/var/www/activecollab/
```

5. On the server, extract it:
```bash
cd /var/www/activecollab
unzip activecollab-*.zip
rm activecollab-*.zip
chown -R www-data:www-data .
```

## Step 6: Run the Web Installer

Visit: `http://77.37.45.67:8080/`

Follow the installation wizard with:
- Database Host: localhost
- Database Name: activecollab_db
- Database User: activecollab_user
- Database Password: (the password you set)

## Step 7: Set Up Cron Jobs (CRITICAL!)

After installation, run:
```bash
# Add cron jobs
(crontab -l 2>/dev/null; echo "* * * * * /usr/bin/php /var/www/activecollab/tasks/cron_jobs/run_every_minute.php") | crontab -
(crontab -l 2>/dev/null; echo "*/3 * * * * /usr/bin/php /var/www/activecollab/tasks/cron_jobs/check_imap_every_3_minutes.php") | crontab -
(crontab -l 2>/dev/null; echo "0 * * * * /usr/bin/php /var/www/activecollab/tasks/cron_jobs/run_every_hour.php") | crontab -

# Verify cron jobs
crontab -l
```

## Step 8: Security Cleanup

```bash
# Remove probe.php
rm /var/www/activecollab/probe.php

# CHANGE YOUR ROOT PASSWORD!
passwd root
```

## Troubleshooting

If you encounter issues:

1. Check Apache error logs:
```bash
tail -f /var/log/apache2/error.log
```

2. Check PHP version:
```bash
php -v
```

3. Verify MySQL is running:
```bash
systemctl status mysql
```

4. Check available ports:
```bash
netstat -tlnp | grep LISTEN
```

## Important Notes

- ActiveCollab requires cron jobs to function properly
- Make sure to change your root password after installation
- Consider setting up SSL/HTTPS for production use
- Regular backups are recommended