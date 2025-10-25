# LetsPrint - GST Invoice App for Shopify

A comprehensive Shopify embedded app for generating GST-compliant invoices, managing orders, and customizing invoice templates.

## Features

- 📄 **GST Invoice Generation**: Create GST-compliant invoices for Indian businesses
- 📦 **Order Management**: View and manage Shopify orders with invoice generation
- 🎨 **Custom Templates**: Design and customize invoice templates
- ✉️ **Email Integration**: Send invoices directly to customers via email
- 📊 **Store Profile**: Manage store information and GST details
- 💳 **Plans & Billing**: Flexible pricing plans for businesses of all sizes

## Tech Stack

### Backend
- Node.js with Express
- Shopify App Bridge
- MongoDB for data storage
- SQLite for session storage
- AWS S3 for file storage

### Frontend
- React 18
- Vite for build tooling
- Shopify Polaris UI components
- React Router for navigation
- i18next for internationalization

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance
- Shopify Partner account
- AWS S3 bucket (for file storage)
- Domain with SSL certificate

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd letsprint-invoice-gst-app
```

### 2. Install dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
HOST=your-domain.com
SHOPIFY_APP_URL=https://your-domain.com
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
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# RazorPay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Build the frontend

```bash
cd frontend
SHOPIFY_API_KEY=your_api_key npm run build
cd ..
```

### 5. Set up Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Create a new app or use existing app
3. Configure App URLs:
   - **App URL**: `https://your-domain.com`
   - **Allowed redirection URL(s)**: `https://your-domain.com/api/auth/callback`
4. Set the API scopes as listed in your `.env` file
5. Note down your Client ID and Client Secret

### 6. Configure Nginx (Production)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

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

### 7. Run the application

#### Development
```bash
npm run dev
```

#### Production with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start index.js --name letsprint

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

## Usage

### Accessing the App

1. Install the app from your Shopify Partner dashboard to a test store
2. The app will appear in your Shopify Admin under Apps → LetsPrint
3. Complete your store profile setup on the home page
4. Navigate to Orders to generate invoices

### Generating Invoices

1. Go to the Orders page
2. Select an order from the list
3. Click "Generate Invoice"
4. Customize the invoice template if needed
5. Download or email the invoice to the customer

### Customizing Templates

1. Navigate to Invoice Templates
2. Choose a template or create a new one
3. Customize colors, logos, and layout
4. Save your template for future use

## Project Structure

```
letsprint-invoice-gst-app/
├── Models/              # Database models
├── controllers/         # Business logic controllers
├── database/           # Database configuration
├── routes/             # API routes
├── frontend/           # React frontend application
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── assets/         # Static assets
│   └── utils/          # Utility functions
├── index.js            # Main server file
├── shopify.js          # Shopify app configuration
└── package.json        # Dependencies and scripts
```

## API Endpoints

### Authentication
- `GET /api/auth` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback handler

### Shop
- `GET /api/2024-10/shop.json` - Get shop information

### Orders
- `GET /api/2024-10/orders.json` - Get all orders

### Products
- `GET /api/2024-10/products.json` - Get all products

### Store Profile
- `POST /api/store-profile` - Create/update store profile
- `GET /api/store-profile/:shopId` - Get store profile

### Invoices
- `POST /api/invoices` - Generate invoice
- `GET /api/invoices/:shopId` - Get invoices for shop

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SHOPIFY_API_KEY` | Shopify app client ID | Yes |
| `SHOPIFY_API_SECRET` | Shopify app client secret | Yes |
| `HOST` | Your app's domain (without https://) | Yes |
| `SHOPIFY_APP_URL` | Full app URL with https:// | Yes |
| `PORT` | Port to run the server | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | Yes |
| `S3_BUCKET_NAME` | S3 bucket name for file storage | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key for payments | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay secret for payments | Optional |

## Troubleshooting

### App doesn't load in Shopify Admin

1. Check that your domain has a valid SSL certificate
2. Verify the App URL and redirect URLs in Shopify Partners Dashboard
3. Ensure `SHOPIFY_APP_URL` in `.env` matches your actual domain
4. Check browser console for errors

### OAuth errors

1. Verify your API key and secret are correct
2. Make sure redirect URL is whitelisted in Shopify Partners
3. Clear browser cookies and try again

### Database connection issues

1. Ensure MongoDB is running: `systemctl status mongod`
2. Check MongoDB connection string in `.env`
3. Verify network access to MongoDB

## Security Notes

- Never commit `.env` file to version control
- Keep your API credentials secure
- Use environment variables for all sensitive data
- Regularly update dependencies for security patches
- Use SSL/TLS for production deployment

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

## Changelog

### Version 1.0.0
- Initial release
- GST invoice generation
- Order management
- Custom invoice templates
- Email integration
- Store profile management
- Plans and billing system
