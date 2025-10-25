# PSA Nashik - API Testing & Operations Guide

## 🔧 Server Access

```bash
# SSH into the server
ssh root@194.238.23.217
Password: Kalilinux@2812

# Navigate to application directory
cd /root/PSA-NASHIK

# Check if app is running
ps aux | grep node

# View logs
tail -f server.log

# View recent logs
tail -100 server.log

# Search for errors
grep -i error server.log | tail -20
```

---

## 🗄️ Database Operations

### Access PostgreSQL

```bash
# Switch to postgres user
su - postgres

# Connect to database
psql -d psa_nashik

# Or directly as root
psql -U postgres -d psa_nashik
```

### Common Database Queries

```sql
-- View all tables
\dt

-- Table structure
\d students

-- Count active students
SELECT COUNT(*) FROM students WHERE is_active = true;

-- Recent payments
SELECT 
  s.name as student_name,
  p.amount,
  p.payment_date,
  p.payment_method,
  p.receipt_number
FROM payments p
JOIN students s ON p.student_id = s.id
ORDER BY p.payment_date DESC
LIMIT 10;

-- Revenue by sport
SELECT 
  sp.name as sport_name,
  COUNT(DISTINCT p.student_id) as total_students,
  SUM(p.amount) as total_revenue
FROM payments p
JOIN students s ON p.student_id = s.id
JOIN sports sp ON s.sport_id = sp.id
WHERE p.status = 'completed'
GROUP BY sp.name
ORDER BY total_revenue DESC;

-- Attendance rate by student
SELECT 
  s.name,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
  COUNT(*) as total_records,
  ROUND(
    (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::decimal / 
     COUNT(*)::decimal) * 100, 
    2
  ) as attendance_percentage
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
WHERE a.date >= NOW() - INTERVAL '30 days'
GROUP BY s.id, s.name
ORDER BY attendance_percentage DESC
LIMIT 10;

-- Outstanding payments
SELECT 
  s.name,
  s.phone,
  s.parent_phone,
  s.fee_amount,
  COALESCE(last_payment.payment_date, s.admission_date) as last_payment_date,
  EXTRACT(EPOCH FROM (NOW() - COALESCE(last_payment.payment_date, s.admission_date)))::int / 86400 as days_since_payment
FROM students s
LEFT JOIN LATERAL (
  SELECT payment_date
  FROM payments
  WHERE student_id = s.id
  ORDER BY payment_date DESC
  LIMIT 1
) last_payment ON true
WHERE s.is_active = true
ORDER BY days_since_payment DESC;

-- Session cleanup (expired sessions)
DELETE FROM session WHERE expire < NOW();

-- Get session count
SELECT COUNT(*) FROM session;

-- Active users (with valid sessions)
SELECT 
  u.name,
  u.email,
  u.role,
  s.expire
FROM users u
JOIN session s ON s.sess::jsonb->>'user'->>'id' = u.id::text
WHERE s.expire > NOW();
```

### Database Backup

```bash
# Create backup
pg_dump -U postgres psa_nashik > /root/backups/psa_nashik_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U postgres -d psa_nashik < backup_file.sql

# Backup with compression
pg_dump -U postgres psa_nashik | gzip > /root/backups/psa_nashik_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore from compressed backup
gunzip -c backup_file.sql.gz | psql -U postgres -d psa_nashik
```

---

## 🧪 API Testing with curl

### Authentication

```bash
# Login and save session cookie
curl -X POST https://psanashik.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@psa.com","password":"admin123"}' \
  -c cookies.txt \
  -v

# Check authentication
curl https://psanashik.in/api/auth/user \
  -b cookies.txt

# Logout
curl -X POST https://psanashik.in/api/auth/logout \
  -b cookies.txt
```

### Students API

```bash
# Get all students (paginated)
curl https://psanashik.in/api/students \
  -b cookies.txt

# Get students with filters
curl "https://psanashik.in/api/students?page=1&limit=20&sport=Cricket&isActive=true" \
  -b cookies.txt

# Get single student
curl https://psanashik.in/api/students/1 \
  -b cookies.txt

# Create student
curl -X POST https://psanashik.in/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "parentPhone": "9876543211",
    "dateOfBirth": "2010-05-15",
    "gender": "male",
    "sportId": 1,
    "batchId": 1,
    "skillLevel": "beginner",
    "address": "123 Main St, Nashik",
    "emergencyContact": {
      "name": "Father Name",
      "phone": "9876543211",
      "relation": "Father"
    },
    "feeAmount": "5000"
  }'

# Update student
curl -X PUT https://psanashik.in/api/students/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Rahul Kumar Updated",
    "phone": "9876543299",
    "skillLevel": "intermediate"
  }'

# Partial update
curl -X PATCH https://psanashik.in/api/students/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "skillLevel": "advanced"
  }'

# Delete (soft delete)
curl -X DELETE https://psanashik.in/api/students/1 \
  -b cookies.txt
```

### Payments API

```bash
# Get all payments
curl https://psanashik.in/api/payments \
  -b cookies.txt

# Get payments by student
curl https://psanashik.in/api/payments/student/1 \
  -b cookies.txt

# Get pending payments
curl https://psanashik.in/api/payments/pending \
  -b cookies.txt

# Check monthly payment
curl https://psanashik.in/api/payments/check-monthly/1/2025-10 \
  -b cookies.txt

# Record payment
curl -X POST https://psanashik.in/api/payments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "studentId": 1,
    "amount": "5000",
    "paymentDate": "2025-10-15",
    "paymentMethod": "cash",
    "monthYear": "2025-10",
    "notes": "Monthly fee for October"
  }'

# Get revenue stats
curl https://psanashik.in/api/payments/revenue-stats \
  -b cookies.txt
```

### Attendance API

```bash
# Get attendance records
curl "https://psanashik.in/api/attendance?date=2025-10-15&batchId=1" \
  -b cookies.txt

# Mark attendance
curl -X POST https://psanashik.in/api/attendance \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "studentId": 1,
    "batchId": 1,
    "date": "2025-10-15",
    "status": "present",
    "checkInTime": "2025-10-15T16:30:00Z",
    "location": {
      "latitude": 19.9975,
      "longitude": 73.7898
    }
  }'

# Get student attendance
curl https://psanashik.in/api/attendance/student/1 \
  -b cookies.txt

# Get attendance stats
curl https://psanashik.in/api/attendance/stats \
  -b cookies.txt
```

### Batches API

```bash
# Get all batches
curl https://psanashik.in/api/batches \
  -b cookies.txt

# Get batches by sport
curl "https://psanashik.in/api/batches?sportId=1" \
  -b cookies.txt

# Create batch
curl -X POST https://psanashik.in/api/batches \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Cricket Advanced Batch",
    "sportId": 1,
    "coachId": 1,
    "startTime": "16:00",
    "endTime": "18:00",
    "daysOfWeek": "Mon,Wed,Fri",
    "maxStudents": 20,
    "feeAmount": "6000"
  }'

# Update batch
curl -X PATCH https://psanashik.in/api/batches/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "startTime": "17:00",
    "maxStudents": 25
  }'

# Delete batch
curl -X DELETE https://psanashik.in/api/batches/1 \
  -b cookies.txt
```

### Sports API

```bash
# Get all sports
curl https://psanashik.in/api/sports \
  -b cookies.txt
```

### Coaches API

```bash
# Get all coaches
curl https://psanashik.in/api/coaches \
  -b cookies.txt
```

### Badges API

```bash
# Get all badges
curl https://psanashik.in/api/badges \
  -b cookies.txt

# Get badge details
curl https://psanashik.in/api/badges/1 \
  -b cookies.txt

# Create badge
curl -X POST https://psanashik.in/api/badges \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Perfect Attendance",
    "description": "100% attendance for 1 month",
    "iconUrl": "/badges/perfect-attendance.png",
    "criteria": {
      "type": "attendance",
      "percentage": 100,
      "months": 1
    },
    "points": 50,
    "category": "attendance"
  }'

# Update badge
curl -X PATCH https://psanashik.in/api/badges/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "points": 75
  }'

# Delete badge
curl -X DELETE https://psanashik.in/api/badges/1 \
  -b cookies.txt
```

### Reports API

```bash
# Get predefined reports
curl https://psanashik.in/api/reports/predefined \
  -b cookies.txt

# Generate student report
curl "https://psanashik.in/api/reports/students?sport=Cricket&isActive=true" \
  -b cookies.txt

# Generate attendance report
curl "https://psanashik.in/api/reports/attendance?startDate=2025-10-01&endDate=2025-10-31" \
  -b cookies.txt

# Export students to Excel
curl https://psanashik.in/api/export/students \
  -b cookies.txt \
  --output students.xlsx

# Export payments to Excel
curl "https://psanashik.in/api/export/payments?startDate=2025-10-01&endDate=2025-10-31" \
  -b cookies.txt \
  --output payments.xlsx
```

### Health Check

```bash
# Basic health check
curl https://psanashik.in/api/health

# Database health check
curl https://psanashik.in/api/health/db
```

---

## 🚀 Application Management

### Start/Stop Application

```bash
# Current method (manual)
cd /root/PSA-NASHIK

# Stop (find and kill process)
ps aux | grep "node dist/index.js"
kill <PID>

# Start
npm start &

# Or with nohup (keeps running after logout)
nohup npm start > server.log 2>&1 &
```

### Recommended: Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd /root/PSA-NASHIK
pm2 start npm --name "psa-nashik" -- start

# Other PM2 commands
pm2 status                 # Check status
pm2 logs psa-nashik        # View logs
pm2 logs psa-nashik --lines 100  # Last 100 lines
pm2 restart psa-nashik     # Restart
pm2 stop psa-nashik        # Stop
pm2 delete psa-nashik      # Remove from PM2

# Auto-start on server reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Update Application

```bash
cd /root/PSA-NASHIK

# Pull latest code
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Build
npm run build

# Restart
# Manual method:
pkill -f "node dist/index.js"
npm start &

# PM2 method (recommended):
pm2 restart psa-nashik
```

---

## 🔧 Nginx Management

```bash
# Check nginx status
systemctl status nginx

# Test configuration
nginx -t

# Reload nginx (after config changes)
systemctl reload nginx

# Restart nginx
systemctl restart nginx

# Stop nginx
systemctl stop nginx

# Start nginx
systemctl start nginx

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 SSL Certificate Management

```bash
# Check certificate expiry
certbot certificates

# Renew certificates (dry run)
certbot renew --dry-run

# Renew certificates
certbot renew

# Auto-renewal is set up via cron:
# Certbot creates a systemd timer or cron job automatically

# Manual renewal for specific domain
certbot renew --cert-name psanashik.in

# View certbot logs
tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 📊 Monitoring & Diagnostics

### System Resources

```bash
# CPU and Memory usage
htop

# Or simpler:
top

# Disk usage
df -h

# Disk usage by directory
du -sh /root/PSA-NASHIK/*

# Check PostgreSQL disk usage
psql -U postgres -d psa_nashik -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Network

```bash
# Check open ports
netstat -tulpn

# Check if port 3000 is listening
netstat -tulpn | grep 3000

# Check nginx is listening on 443
netstat -tulpn | grep 443

# Test local connectivity
curl http://localhost:3000/api/health

# Test external connectivity
curl https://psanashik.in/api/health
```

### Application Logs

```bash
# Real-time logs
tail -f /root/PSA-NASHIK/server.log

# Search for errors
grep -i error /root/PSA-NASHIK/server.log | tail -20

# Search for specific student
grep "studentId: 123" /root/PSA-NASHIK/server.log

# Search for payments
grep "POST /api/payments" /root/PSA-NASHIK/server.log | tail -10

# View last 100 lines
tail -100 /root/PSA-NASHIK/server.log

# Save last 1000 lines to file
tail -1000 /root/PSA-NASHIK/server.log > /root/recent-logs.txt
```

### Database Monitoring

```bash
# PostgreSQL status
systemctl status postgresql

# Active connections
psql -U postgres -d psa_nashik -c "
SELECT 
  count(*) as connections,
  usename,
  application_name
FROM pg_stat_activity
WHERE datname = 'psa_nashik'
GROUP BY usename, application_name;
"

# Long running queries
psql -U postgres -d psa_nashik -c "
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - pg_stat_activity.query_start > interval '1 minute'
ORDER BY duration DESC;
"

# Database size
psql -U postgres -c "
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'psa_nashik';
"

# Table sizes
psql -U postgres -d psa_nashik -c "
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check if port 3000 is already in use
netstat -tulpn | grep 3000

# If port is in use, kill the process
lsof -ti:3000 | xargs kill -9

# Check for errors in code
cd /root/PSA-NASHIK
npm run build

# Check environment variables
cat .env

# Check database connectivity
psql -U postgres -d psa_nashik -c "SELECT 1;"

# Try starting in foreground to see errors
npm start
```

### Application Crashes

```bash
# Check logs for errors
tail -100 /root/PSA-NASHIK/server.log

# Check system logs
journalctl -u node --since "1 hour ago"

# Check memory usage (might be out of memory)
free -h

# Check disk space (might be full)
df -h

# Restart application
pm2 restart psa-nashik
# or
pkill -f "node dist/index.js" && npm start &
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Check database exists
psql -U postgres -l | grep psa_nashik

# Check database credentials in .env
cat /root/PSA-NASHIK/.env | grep DATABASE_URL

# Test connection manually
psql -U postgres -d psa_nashik

# Check active connections
psql -U postgres -d psa_nashik -c "
SELECT count(*) FROM pg_stat_activity 
WHERE datname = 'psa_nashik';
"
```

### Nginx Issues

```bash
# Check nginx configuration
nginx -t

# Check nginx is running
systemctl status nginx

# Restart nginx
systemctl restart nginx

# Check nginx error logs
tail -50 /var/log/nginx/error.log

# Check SSL certificate
certbot certificates

# Test proxy connection
curl http://localhost:3000/api/health
curl https://psanashik.in/api/health
```

### SSL Certificate Issues

```bash
# Check certificate expiry
certbot certificates

# Renew certificate
certbot renew

# If renewal fails, check logs
tail -100 /var/log/letsencrypt/letsencrypt.log

# Check if ports 80 and 443 are open
netstat -tulpn | grep -E '(80|443)'

# Restart nginx after renewal
systemctl restart nginx
```

### Session Issues (Users Can't Login)

```bash
# Check session table exists
psql -U postgres -d psa_nashik -c "\d session"

# Clear expired sessions
psql -U postgres -d psa_nashik -c "DELETE FROM session WHERE expire < NOW();"

# Check .env has SESSION_SECRET
cat /root/PSA-NASHIK/.env | grep SESSION_SECRET

# Restart application
pm2 restart psa-nashik
```

---

## 🔄 Maintenance Tasks

### Daily

```bash
# Check application status
pm2 status
# or
ps aux | grep "node dist/index.js"

# Check logs for errors
grep -i error /root/PSA-NASHIK/server.log | tail -10

# Check disk space
df -h
```

### Weekly

```bash
# Clean expired sessions
psql -U postgres -d psa_nashik -c "DELETE FROM session WHERE expire < NOW();"

# Check database size
psql -U postgres -c "
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'psa_nashik';
"

# Backup database
pg_dump -U postgres psa_nashik > /root/backups/psa_nashik_$(date +%Y%m%d).sql

# Clean old backups (keep last 30 days)
find /root/backups -name "*.sql" -mtime +30 -delete

# Check SSL certificate expiry
certbot certificates
```

### Monthly

```bash
# Vacuum database
psql -U postgres -d psa_nashik -c "VACUUM ANALYZE;"

# Update system packages
apt update && apt upgrade

# Review and archive old logs
tail -10000 /root/PSA-NASHIK/server.log > /root/backups/server_$(date +%Y%m).log
> /root/PSA-NASHIK/server.log  # Clear log file

# Check for npm updates
cd /root/PSA-NASHIK
npm outdated
```

---

## 📝 Quick Reference

### Important Files

```
/root/PSA-NASHIK/.env                    - Environment configuration
/root/PSA-NASHIK/server.log              - Application logs
/root/PSA-NASHIK/dist/                   - Built application
/etc/nginx/sites-available/psa-nashik    - Nginx configuration
/etc/letsencrypt/live/psanashik.in/      - SSL certificates
/var/log/nginx/access.log                - Nginx access logs
/var/log/nginx/error.log                 - Nginx error logs
```

### Important Ports

```
3000  - Node.js application
5432  - PostgreSQL database
80    - Nginx HTTP (redirects to 443)
443   - Nginx HTTPS
```

### Default Credentials

```
Admin:
  Email: admin@psa.com
  Password: admin123

Database:
  User: postgres
  Password: PSA_Nashik_2025_Secure_DB_Pass
  Database: psa_nashik
```

---

## 🚨 Emergency Procedures

### Application Down

```bash
# 1. Check if running
ps aux | grep "node dist/index.js"

# 2. Check logs
tail -50 /root/PSA-NASHIK/server.log

# 3. Restart
cd /root/PSA-NASHIK
npm start &
# or with PM2:
pm2 restart psa-nashik
```

### Database Down

```bash
# 1. Check status
systemctl status postgresql

# 2. Restart
systemctl restart postgresql

# 3. Verify
psql -U postgres -d psa_nashik -c "SELECT 1;"
```

### Website Not Accessible

```bash
# 1. Check nginx
systemctl status nginx

# 2. Test application
curl http://localhost:3000/api/health

# 3. Check SSL
certbot certificates

# 4. Restart nginx
systemctl restart nginx
```

### Forgot Admin Password

```bash
# Reset admin password
psql -U postgres -d psa_nashik

-- In psql:
UPDATE users 
SET password = '$2a$10$...'  -- bcrypt hash of 'admin123'
WHERE email = 'admin@psa.com';

-- Or use emergency reset endpoint:
curl -X POST https://psanashik.in/api/admin/emergency-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@psa.com",
    "newPassword": "newpassword123"
  }'
```

---

## 📞 Support Contacts

- **Server IP**: 194.238.23.217
- **Domain**: https://psanashik.in
- **SSH Access**: root@194.238.23.217 (Password: Kalilinux@2812)
- **Database**: psa_nashik on localhost:5432

---

**Last Updated**: October 15, 2025
