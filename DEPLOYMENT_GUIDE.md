# SWORD Smart RO — Production Deployment Guide

## Step 1: Supabase Setup (Database)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Name: `sword-smart-ro`
4. Database Password: Generate a strong password
5. Region: Choose closest to India (`Asia Pacific (Mumbai)`)
6. Click "Create New Project"

### 1.2 Get Connection Strings
1. In your project dashboard, go to **Project Settings** (gear icon)
2. Click **Database**
3. Under "Connection String", copy:
   - **URI** (for migrations, port 5432)
   - **Session pooler** (for app, port 6543)
4. Replace `[YOUR-PASSWORD]` with the password you set

### 1.3 Set Environment Variables
Create `.env.local` in your project root:
```bash
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

### 1.4 Run Migration
Option A — Using Supabase SQL Editor (Easiest):
1. Go to your Supabase project → **SQL Editor**
2. Click "New query"
3. Open `prisma/migration.sql` from this project
4. Copy ALL contents and paste into SQL Editor
5. Click **Run**
6. All tables are created!

Option B — Using Prisma CLI:
```bash
# Install Prisma CLI
npm install -g prisma

# Set environment variable
export DATABASE_URL="your-connection-string"

# Run migration
npx prisma migrate deploy

# Or push schema directly
npx prisma db push
```

### 1.5 Seed Data
In Supabase SQL Editor:
1. Open `prisma/seed.sql`
2. Copy ALL contents
3. Paste into new query
4. Click **Run**
5. All sample data is loaded!

### 1.6 Verify
In Supabase → **Table Editor**, you should see all tables:
- `users` — with admin user
- `products` — 12 products
- `orders` — 3 sample orders
- `categories` — 5 categories
- `coupons` — 5 coupons
- `pages` — 6 CMS pages
- `banners` — 3 banners
- `settings` — 15 settings

---

## Step 2: Install Prisma Client

```bash
npm install @prisma/client
npm install -D prisma

# Generate Prisma client from schema
npx prisma generate
```

---

## Step 3: Connect Frontend to Database

The `src/lib/prisma.ts` file automatically switches between:
- **localStorage** mode (demo, no database)
- **PostgreSQL** mode (when `DATABASE_URL` is set)

To enable PostgreSQL:
1. Set `DATABASE_URL` in your `.env.local`
2. The app automatically uses Prisma + Supabase
3. No code changes needed!

---

## Step 4: Authentication Setup

### 4.1 Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: Web application
5. Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### 4.2 Firebase Phone OTP
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → Authentication → Sign-in method
3. Enable "Phone" provider
4. Go to Project Settings → General
5. Copy Firebase config to `.env.local`

---

## Step 5: Image Storage (Cloudinary)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud name, API Key, API Secret
3. Add to `.env.local`
4. Set up upload preset in Settings → Upload → Add Upload Preset

---

## Step 6: Deploy to Vercel

### 6.1 Push to GitHub
```bash
git add -A
git commit -m "Production build with Supabase backend"
git push origin main
```

### 6.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project" → Import your GitHub repo
3. Framework Preset: **Other** (static export)
4. Click "Environment Variables" and add ALL from `.env.local`
5. Click **Deploy**

### 6.3 Custom Domain
1. Vercel Dashboard → Your Project → Domains
2. Add: `swordhome.com`
3. Add DNS records at your domain provider:
   - `A` → `@` → `76.76.21.21`
   - `CNAME` → `www` → `cname.vercel-dns.com`

---

## Step 7: Configure Razorpay (Payments)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Dashboard → Account & Settings → API Keys
3. Generate Key ID and Key Secret
4. Add to Admin Panel → Settings → Payment tab
5. Or add to `.env.local` → redeploy

---

## Step 8: Configure Shiprocket (Shipping)

1. Sign up at [shiprocket.in](https://shiprocket.in)
2. Dashboard → Settings → API
3. Generate API Token
4. Add to Admin Panel → Settings → Shipping tab
5. Or add to `.env.local` → redeploy

---

## Database Schema Quick Reference

### Price Storage
All prices are stored in **paise** (₹1 = 100 paise):
- Product price: `2799900` = ₹27,999
- Order total: `3303882` = ₹33,038.82

### Status Values
- **User role**: `super_admin` | `admin` | `manager` | `customer`
- **User status**: `active` | `inactive` | `suspended`
- **Order status**: `placed` | `processing` | `shipped` | `delivered` | `cancelled` | `refunded`
- **Payment status**: `pending` | `paid` | `failed` | `refunded`
- **Product status**: `active` | `inactive` | `draft`
- **Coupon type**: `percent` | `fixed` | `free_shipping`

---

## Admin Default Login

| Field | Value |
|-------|-------|
| **Username** | `ohmnam` |
| **Password** | `9769610205` |
| **Email (DB)** | `admin@sword.com` |

---

## Troubleshooting

### Connection Error to Supabase
- Check if IP is allowed: Supabase → Settings → Database → IPv4 → Add your IP
- Verify connection string format
- Try direct connection (port 5432) vs pooler (port 6543)

### Migration Failed
- Check SQL Editor logs in Supabase
- Ensure `uuid-ossp` extension is enabled
- Run tables one by one if needed

### Data Not Persisting
- Check `DATABASE_URL` is set in production environment
- Verify Prisma client is generated: `npx prisma generate`
- Check browser console for errors

---

## File Structure

```
prisma/
├── schema.prisma          # Prisma schema (12 tables)
├── migration.sql          # Full SQL migration for Supabase
└── seed.sql               # Sample data (products, orders, users)
src/
├── lib/
│   └── prisma.ts          # Prisma client + data access layer
├── services/
│   └── dataStore.ts       # localStorage implementation (fallback)
├── context/
│   └── AuthContext.tsx    # Authentication
└── pages/
    └── Admin.tsx          # Admin panel (13 modules)
.env.example               # Environment variables template
DEPLOYMENT_GUIDE.md        # This file
```

---

## Support

- **SWORD**: priyank.joshi@swordhome.com
- **CEO**: Priyank Joshi (+91 95377 97597)
