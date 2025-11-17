# Setting Up Automated Data Updates

## Quick Setup (5 minutes)

### 1. Add GitHub Secrets

Go to your repo: `Settings > Secrets and variables > Actions > New repository secret`

Add these two secrets:

**VITE_SUPABASE_URL**
```
https://your-project.supabase.co
```

**VITE_SUPABASE_ANON_KEY**
```
your-anon-key-here
```

### 2. Enable GitHub Actions

- Go to `Actions` tab in your repo
- Click "I understand my workflows, go ahead and enable them"
- The workflow will now run daily at 2 AM UTC

### 3. Test Manual Trigger

- Go to `Actions > Update NPM Package Data`
- Click `Run workflow`
- Select branch: `main`
- Click `Run workflow`

Should complete in ~5-10 minutes.

## How It Works

### Daily Automated Updates
```
Every day at 2 AM UTC:
├── Fetch list of tracked packages from Supabase
├── Get most recent week's data from NPM API
├── Skip if data already exists (idempotent)
└── Insert new data points into Supabase
```

### What Gets Updated
- **All packages** in your `packages` table
- **Only new data** (skips existing entries)
- **Latest complete week** (accounts for NPM's 2-3 day delay)

### Cost & Limits
- ✅ GitHub Actions: Free (2,000 min/month, we use ~300)
- ✅ NPM API: Free (rate limited, we use ~20 req/day)
- ✅ Supabase: Free tier (500 MB, we use ~1-2 MB)

## Manual Commands

```bash
# Daily update (only fetches latest week)
npm run update-daily

# Full backfill (52 weeks for all packages)
# Only run when adding new packages!
npm run backfill

# Development server
npm run dev
```

## Monitoring

### Check if automation is working

**Method 1: GitHub Actions**
- Go to `Actions` tab
- See recent runs and their status
- View logs for any errors

**Method 2: Supabase**
```sql
-- Check latest data points
SELECT package_name, MAX(date) as latest_date
FROM package_downloads
GROUP BY package_name
ORDER BY latest_date DESC;

-- Should show dates within last 3-4 days
```

**Method 3: Dashboard**
- Just open your Vercel app
- Data should update daily automatically

## Troubleshooting

### Automation not running?
1. Check GitHub Actions is enabled (`Actions` tab)
2. Verify secrets are set correctly
3. Look at workflow logs for errors

### Missing data?
1. NPM API has 2-3 day delay (normal)
2. Check package name spelling in `packages` table
3. Some packages might be npm org scoped (`@org/package`)

### Rate limiting errors?
- Reduce packages to < 100
- Or increase delay in update-daily.ts (currently 200ms)

## Adding New Packages

### Option 1: Directly in Supabase
```sql
INSERT INTO packages (name)
VALUES ('new-package-name');
```
Then run `npm run backfill` locally to get historical data.

### Option 2: Bulk import (coming soon)
Will auto-discover trending packages based on criteria in `curated-packages.ts`.

## Next Steps

1. ✅ Set up GitHub secrets (see step 1 above)
2. ✅ Test manual workflow run
3. ⏳ Wait 24 hours for first automated run
4. 📊 Check dashboard to see updated data

## Advanced: Custom Schedule

Edit `.github/workflows/update-npm-data.yml`:

```yaml
on:
  schedule:
    # Every 6 hours
    - cron: '0 */6 * * *'

    # Every Monday at 9 AM
    - cron: '0 9 * * 1'

    # Twice daily (6 AM and 6 PM UTC)
    - cron: '0 6,18 * * *'
```

Note: More frequent = more GitHub Actions minutes used (but still well within free tier).
