# 📊 Backfill Historical Data

This guide explains how to populate your database with historical npm download data to see trends over time.

## What is Backfilling?

The backfill script fetches **weekly download data for the past year** for popular npm packages. This creates a timeline of data points that:
- Powers the trend charts
- Shows growth acceleration over time
- Enables exponential growth detection
- Provides historical comparison

## Quick Start

Run the backfill script:

```bash
npm run backfill
```

## What It Does

The backfill script will:

1. **Fetch 60+ popular packages** including:
   - Modern frameworks (React, Vue, Svelte, Solid, Next, Remix, Astro)
   - Build tools (Vite, Webpack, Turbo, esbuild)
   - AI/ML libraries (OpenAI, LangChain)
   - Database clients (Supabase, Prisma, Drizzle)
   - And many more trending packages

2. **Get weekly data points** going back 52 weeks (1 year)

3. **Store ~3,000+ data points** in your Supabase database
   - 60 packages × 52 weeks = 3,120 data points

4. **Progress tracking** - Shows you real-time progress:
   ```
   📦 Backfilling react...
   ✓ Saved package info
     Progress: 10/52 weeks
     Progress: 20/52 weeks
     ...
   ✓ Completed: 52 data points saved, 0 errors

   ✅ Progress: 1/60 packages completed
   ```

## How Long Does It Take?

- **Time**: 10-15 minutes for all packages
- **API calls**: ~3,120 requests to npm registry
- **Rate limiting**: Built-in delays to avoid hitting npm API limits

## Customizing the Backfill

### Change Which Packages to Track

Edit `src/scripts/backfill.ts` and modify the `PACKAGES_TO_BACKFILL` array:

```typescript
const PACKAGES_TO_BACKFILL = [
  'your-package-1',
  'your-package-2',
  // ... add your packages here
]
```

### Change Time Range

In `backfill.ts`, modify the `weeksBack` parameter:

```typescript
await backfillPackage(packageName, 52)  // Change 52 to desired weeks
```

Options:
- `13` = 3 months
- `26` = 6 months
- `52` = 1 year (default)
- `104` = 2 years

### Change Data Frequency

Currently fetches weekly data. To change to monthly:

In `backfill.ts`, replace `subWeeks` with `subMonths`:

```typescript
const endDate = startOfDay(subMonths(now, i))  // Monthly instead of weekly
const startDate = startOfDay(subDays(endDate, 29))  // 30-day period
```

## What You'll See After Backfill

Once the backfill completes:

1. **Refresh your dashboard** (http://localhost:5175)

2. **Click on any package card** to see:
   - 📈 Beautiful trend charts showing growth over time
   - Week-by-week download progression
   - Visual representation of exponential growth

3. **Growth metrics become more accurate**:
   - Exponential detection works better with more data points
   - Acceleration calculations are more precise
   - Trend classification is more reliable

## Running Multiple Times

The script uses `UPSERT`, so it's safe to run multiple times:
- Updates existing data points
- Adds missing data points
- Won't create duplicates

## Troubleshooting

### Rate Limiting Errors

If you see lots of errors:
- The script already has 150ms delays between requests
- Try increasing the delay in `backfill.ts`:
  ```typescript
  await new Promise(resolve => setTimeout(resolve, 300))  // Increase to 300ms
  ```

### Out of Memory

If processing too many packages:
- Reduce the number of packages in `PACKAGES_TO_BACKFILL`
- Run backfill in batches (comment out some packages, run, then do the rest)

### Connection Errors

- Check your internet connection
- Verify Supabase credentials in `.env`
- Make sure database tables are created

## Advanced: Continuous Updates

To keep data fresh, you can:

### Option 1: Manual Updates

Run the backfill script periodically:
```bash
npm run backfill
```

### Option 2: Cron Job (macOS/Linux)

Add to your crontab:
```bash
# Run backfill every Sunday at 2 AM
0 2 * * 0 cd /path/to/npm-dashboard && npm run backfill
```

### Option 3: Supabase Edge Function (Future Enhancement)

Set up a Supabase Edge Function with cron trigger to run backfill daily.

## Data Storage

After backfilling 60 packages for 1 year:
- Database rows: ~3,120 in `package_downloads` table
- Storage: ~500 KB
- Queries are fast thanks to indexes

## Sample Output

```
🚀 Starting NPM Package Data Backfill
📊 Backfilling 60 packages
📅 Fetching weekly data for the past year

📦 Backfilling react...
✓ Saved package info
  Progress: 10/53 weeks
  Progress: 20/53 weeks
  Progress: 30/53 weeks
  Progress: 40/53 weeks
  Progress: 50/53 weeks
✓ Completed: 53 data points saved, 0 errors

✅ Progress: 1/60 packages completed

📦 Backfilling vue...
...

🎉 Backfill complete!
   Packages processed: 60/60
   Time taken: 12.45 minutes

💡 Refresh your dashboard to see the trends!
```

## Why This Matters

Without backfill:
- ❌ Only 1 data point per package
- ❌ No trends visible
- ❌ Charts are empty or show flat lines
- ❌ Growth detection is inaccurate

With backfill:
- ✅ 52 data points per package (weekly for 1 year)
- ✅ Rich trend visualization
- ✅ Charts show actual growth patterns
- ✅ Accurate exponential growth detection
- ✅ See which packages exploded in popularity

---

**Ready to backfill?** Just run:

```bash
npm run backfill
```

Then grab a coffee while it runs for ~10-15 minutes! ☕
