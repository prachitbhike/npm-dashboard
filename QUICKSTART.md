# 🚀 Quick Start - NPM Growth Dashboard

Your dashboard is ready! Just 3 steps to get started:

## ✅ What's Already Done

- ✓ Project structure set up
- ✓ All dependencies installed
- ✓ UI components built
- ✓ Growth calculation algorithms implemented
- ✓ NPM API integration complete
- ✓ Charts and visualizations ready
- ✓ Build tested successfully

## 📋 What You Need To Do

### Step 1: Create Your .env File (2 minutes)

You need to add your Supabase credentials. Since you mentioned you have them ready:

\`\`\`bash
cp .env.example .env
\`\`\`

Then edit `.env` and add your credentials:
\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### Step 2: Set Up Database (3 minutes)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy all contents from `supabase-schema.sql`
3. Paste and click **Run**
4. Verify tables created in Table Editor:
   - `packages`
   - `package_downloads`

### Step 3: Start the Dashboard (30 seconds)

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:5173

## 🎯 First Use

1. Click **"Update Data"** button (top right)
2. Wait 1-2 minutes for initial data load
3. Browse the fastest growing npm packages!
4. Click any package card to see its growth chart

## 📊 What You'll See

- **Exponential Growth**: Packages with 🟢 badges and ⚡ icon
- **Accelerating**: Packages speeding up in growth
- **Growth Metrics**: Real percentages and trends
- **Interactive Charts**: Click packages to visualize trends
- **Time Filters**: 1M, 3M, 6M, 1Y views

## 🔍 Features Overview

### Dashboard Stats
- Total packages tracked
- Count of exponentially growing packages
- Count of accelerating packages

### Package Cards Show
- Package name
- Current downloads (formatted: 1.2M, 45K, etc.)
- Growth rate (% change)
- Acceleration (change in growth rate)
- Trend badge (exponential, accelerating, growing, stable, declining)
- Previous period comparison

### Growth Detection
The app automatically detects:
- **Exponential**: Growth rate consistently increasing over 60% of periods
- **Accelerating**: Positive acceleration > 10%
- **Growing**: Growth rate > 20%
- **Stable**: Growth rate between -10% and 20%
- **Declining**: Negative growth

## 🛠️ Customization

### Track Different Packages
Edit `src/services/npmService.ts` line 45 - modify the `topPackages` array

### Track More Packages
Edit `src/components/Dashboard.tsx` line 50 - change `fetchTopPackages(20)` to a higher number

### Adjust Growth Thresholds
Edit `src/utils/growthCalculations.ts`:
- Line 37: Exponential detection threshold (currently 0.6)
- Line 60-63: Trend classification thresholds

## 📚 Documentation

- **Full Guide**: See `README.md`
- **Detailed Setup**: See `SETUP.md`
- **Database Schema**: See `supabase-schema.sql`

## 💡 Pro Tips

1. **First Run**: Initial data fetch takes ~1-2 minutes for 20 packages
2. **Rate Limits**: NPM API allows ~100 req/min - app has built-in delays
3. **Data Updates**: Click refresh periodically to see latest trends
4. **Charts**: Click any package card to see detailed trend visualization
5. **Sorting**: Packages auto-sorted by growth (exponential first, then by rate)

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
→ Create `.env` file with your credentials (Step 1)

**"No data available"**
→ Click "Update Data" button and wait

**"Failed to fetch data"**
→ Run the SQL schema in Supabase (Step 2)

**Build errors**
→ Run `npm install` again

## 📈 How Growth Calculation Works

1. **Fetches** download stats from NPM Registry API
2. **Stores** historical data in Supabase
3. **Calculates** growth rate: `(current - previous) / previous * 100`
4. **Detects** exponential growth by checking if growth rates are accelerating
5. **Computes** acceleration: change in growth rate over time
6. **Classifies** packages into trends based on metrics

## 🎨 Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (visualization)
- Supabase (PostgreSQL database)
- NPM Registry API (data source)

---

**Ready to see the fastest growing npm packages? Run `npm run dev` and go to localhost:5173!** 🚀
