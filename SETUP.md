# Quick Setup Guide

Follow these steps to get your NPM Dashboard up and running:

## Step 1: Install Dependencies ✅

Dependencies are already installed! If you need to reinstall:
\`\`\`bash
npm install
\`\`\`

## Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait ~2 minutes for provisioning

### 2.2 Get Your Credentials
1. In your project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon public key** (long string starting with `eyJ...`)

### 2.3 Create the Database Tables
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

### 2.4 Verify Tables Were Created
1. Go to **Table Editor** in Supabase (left sidebar)
2. You should see two tables:
   - `packages`
   - `package_downloads`

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Edit `.env` and paste your Supabase credentials:
   \`\`\`
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   \`\`\`

## Step 4: Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
\`\`\`

## Step 5: Open the Dashboard

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Click **"Update Data"** button (top right)
3. Wait 1-2 minutes for data to load
4. Enjoy exploring the fastest growing npm packages! 🚀

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env` file exists in the project root
- Check that the values don't have quotes or extra spaces
- Restart the dev server (Ctrl+C and `npm run dev` again)

### Error: "Failed to save data"
- Make sure you ran the `supabase-schema.sql` script
- Check that RLS policies were created (they're in the SQL file)
- Verify your Supabase project is active

### No packages showing
- Click "Update Data" and wait for it to complete
- Check browser console (F12) for errors
- Verify your internet connection (needs to reach npmjs.org)

### Rate limiting errors
- NPM API limits to ~100 requests/minute
- Wait a few minutes and try again
- The app already includes delays between requests

## Next Steps

- **Customize package list**: Edit `src/services/npmService.ts` → `fetchTopPackages()`
- **Adjust thresholds**: Edit `src/utils/growthCalculations.ts`
- **Add more packages**: Increase the limit in `Dashboard.tsx` → `handleUpdateData()`

Need help? Check `README.md` for more detailed documentation!
