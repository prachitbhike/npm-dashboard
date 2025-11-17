# 🚀 Deploying NPM Dashboard to Vercel

This guide walks you through deploying your NPM Package Growth Dashboard to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works!)
- Your Supabase credentials (URL and Anon Key)

## Step 1: Push to GitHub

### 1.1 Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `npm-dashboard` (or any name you prefer)
3. **Don't** initialize with README (we already have one)

### 1.2 Push Your Code

```bash
cd /Users/prachitbhike/Code/npm-dashboard

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: NPM Package Growth Dashboard"

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/npm-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up or log in (use "Continue with GitHub" for easier integration)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Select your `npm-dashboard` repository

### 2.2 Configure Project Settings

Vercel will auto-detect the Vite framework. Verify these settings:

**Build & Development Settings:**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Leave these at their defaults - Vercel detects them automatically!

### 2.3 Add Environment Variables

**IMPORTANT**: Before deploying, add your Supabase credentials:

1. In the Vercel project configuration, scroll to **"Environment Variables"**
2. Add these variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://fawgoaszqzvapmttcrkc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (your full anon key) |

**Select**: All Environments (Production, Preview, Development)

### 2.4 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://npm-dashboard-abc123.vercel.app`

## Step 3: Test Your Deployment

1. Open your Vercel URL
2. You should see the dashboard (might show "No data available")
3. Click **"Update Data"** to fetch npm package data
4. Packages should start appearing!

## Step 4: Set Up Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Add your domain (e.g., `npm-dashboard.yourdomain.com`)
3. Follow Vercel's DNS instructions

### 4.2 Configure DNS

Add these records to your DNS provider:
- **Type**: CNAME
- **Name**: npm-dashboard (or your subdomain)
- **Value**: cname.vercel-dns.com

## Automatic Deployments

Now every time you push to GitHub:
- **main branch** → Deploys to production
- **Other branches** → Creates preview deployments

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys! 🚀
```

## Environment Variables Management

### Update Environment Variables

1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Edit or add new variables
4. **Redeploy** for changes to take effect

### Local vs Production

Your local `.env` file is NOT pushed to GitHub (it's in `.gitignore`).
Always set environment variables in Vercel Dashboard for production.

## Troubleshooting

### Build Fails

**Error**: `Missing Supabase environment variables`
- **Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel dashboard

**Error**: `Build command failed`
- **Solution**: Check that `package.json` has correct build script
- Verify: `"build": "tsc && vite build"`

### App Shows Blank Page

1. Check browser console for errors (F12)
2. Verify environment variables are set in Vercel
3. Check that Supabase tables exist and RLS policies are correct

### "No data available"

This is normal on first deployment:
- Click **"Update Data"** to fetch npm package data
- Or run the backfill script locally and data will sync to Supabase

## Running Backfill for Production

Since the backfill script is heavy, run it locally:

```bash
# Local machine
npm run backfill

# Data is stored in Supabase
# Your production site will see it immediately!
```

The data is stored in Supabase (not on Vercel), so running backfill locally populates data for both local and production environments.

## Vercel CLI (Optional)

Install Vercel CLI for command-line deployments:

```bash
npm install -g vercel

# Deploy from terminal
vercel

# Deploy to production
vercel --prod
```

## Production Checklist

Before sharing your dashboard:

- [ ] Supabase database tables created
- [ ] Environment variables set in Vercel
- [ ] Run backfill to populate data
- [ ] Test all time period filters
- [ ] Test all sort options
- [ ] Click a few packages to verify charts work
- [ ] Verify "Update Data" button works

## Costs

**Vercel Free Tier includes:**
- Unlimited personal projects
- 100 GB bandwidth/month
- Automatic HTTPS
- Serverless Functions
- 6,000 build minutes/month

**Supabase Free Tier includes:**
- 500 MB database storage (plenty for this app)
- 2 GB data transfer
- 50,000 monthly active users

Your NPM Dashboard will run **completely free** on both platforms! 💰

## Monitoring

View your deployment logs:
1. Vercel Dashboard → Your Project
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **Supabase Docs**: https://supabase.com/docs

---

**Your dashboard is now live!** 🎉

Share it with the world: `https://your-project.vercel.app`
