# NPM Package Growth Dashboard

A real-time dashboard to track the fastest growing npm packages by usage. Visualize which packages are growing exponentially or accelerating in adoption over different time periods.

## Features

- 📈 **Track Top NPM Packages**: Monitor the top 100-500 most downloaded npm packages
- 🚀 **Exponential Growth Detection**: Automatically identify packages with exponential growth patterns
- ⚡ **Acceleration Metrics**: See which packages are accelerating in adoption
- 📊 **Interactive Charts**: Visualize download trends with interactive charts
- ⏰ **Multiple Time Periods**: View growth over 1 month, 3 months, 6 months, or 1 year
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- 💾 **Supabase Backend**: PostgreSQL database for reliable data storage

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **Data Source**: NPM Registry API

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works!)

## Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
cd /Users/prachitbhike/Code/npm-dashboard
npm install
\`\`\`

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (takes ~2 minutes)
3. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

### 3. Create Database Schema

1. In your Supabase project, go to the **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL script to create the tables and policies

### 4. Configure Environment Variables

Create a `.env` file in the project root:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your Supabase credentials:

\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### First Time Setup

1. **Update Data**: Click the "Update Data" button to fetch the latest npm package statistics
   - This will fetch data for the top 20 packages (configurable)
   - Takes ~1-2 minutes depending on rate limits
   - Data is saved to your Supabase database

2. **Browse Packages**: Scroll through the package cards to see growth metrics
   - 🟢 Green badges indicate exponential or accelerating growth
   - Growth rate shows percentage change
   - Acceleration shows change in growth rate

3. **View Charts**: Click on any package card to see its download trend chart

4. **Filter by Time Period**: Use the time period buttons to switch between:
   - 1 Month
   - 3 Months
   - 6 Months
   - 1 Year

### Understanding Metrics

- **Growth Rate**: Percentage change in downloads compared to previous period
- **Acceleration**: Change in the growth rate (positive = speeding up)
- **Exponential**: Packages where growth rate is consistently increasing
- **Accelerating**: Packages with significant positive acceleration
- **Growing**: Packages with >20% growth
- **Stable**: Packages with -10% to 20% change
- **Declining**: Packages with declining downloads

## Project Structure

\`\`\`
npm-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Badge.tsx
│   │   ├── Dashboard.tsx    # Main dashboard component
│   │   ├── PackageCard.tsx  # Package metric card
│   │   └── GrowthChart.tsx  # Chart visualization
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   ├── services/
│   │   └── npmService.ts    # NPM API integration
│   ├── utils/
│   │   └── growthCalculations.ts  # Growth metrics logic
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase-schema.sql      # Database schema
├── package.json
├── vite.config.ts
└── README.md
\`\`\`

## Configuration

### Tracking More Packages

Edit `src/services/npmService.ts` and modify the `fetchTopPackages` function to:
- Add more package names to the curated list
- Change the limit parameter in `handleUpdateData` (Dashboard.tsx)

### Update Frequency

Currently uses manual refresh. To add automatic updates:
- Set up Supabase Edge Functions with cron jobs
- Or implement client-side periodic fetching with `setInterval`

### Growth Detection Tuning

Adjust thresholds in `src/utils/growthCalculations.ts`:
- `isExponentialGrowth`: Change the 0.6 threshold for exponential detection
- `determineTrend`: Modify growth rate thresholds for trend classification

## NPM Registry API

This project uses the official NPM Registry API:
- **Download Stats**: `https://api.npmjs.org/downloads/point/{start}:{end}/{package}`
- **Package Info**: `https://registry.npmjs.org/{package}`

Rate limits: ~100 requests per minute per IP

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists and contains valid Supabase credentials
- Restart the dev server after creating/editing `.env`

### "Failed to fetch data"
- Check if Supabase tables are created (run the SQL schema)
- Verify RLS policies are set up correctly
- Check browser console for specific error messages

### "No data available"
- Click "Update Data" to fetch initial data
- Wait for the update process to complete (~1-2 minutes)

### Rate Limiting
- NPM API has rate limits (~100 req/min)
- The app includes small delays between requests
- If you hit rate limits, wait a few minutes and try again

## Deployment

### Deploy to Vercel

This app is optimized for Vercel deployment:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/npm-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click Deploy!

3. **Run Backfill Locally**:
   ```bash
   npm run backfill
   ```
   Data is stored in Supabase and will appear on your production site immediately.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Vercel Configuration

The project includes:
- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to exclude from deployment
- Auto-detected Vite framework settings

## Future Enhancements

- [ ] Add search functionality for specific packages
- [ ] Export data to CSV/JSON
- [ ] Compare multiple packages side-by-side
- [ ] Email alerts for packages hitting exponential growth
- [ ] Weekly/monthly growth reports
- [ ] Integration with GitHub stars/trending
- [ ] Dark mode toggle
- [ ] Automated daily data updates via Supabase Edge Functions

## Contributing

Feel free to submit issues or pull requests!

## License

MIT

## Author

Prachit Bhike
