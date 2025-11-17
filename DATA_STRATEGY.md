# Data Strategy for VC Investment Tracking

## Overview
This dashboard tracks npm package adoption to identify early-stage investment opportunities in developer tools, infrastructure, and AI/ML companies.

## 1. Automated Data Collection

### Daily Updates (GitHub Actions)
- **Schedule**: Runs daily at 2 AM UTC
- **Cost**: Free (GitHub Actions free tier: 2,000 minutes/month)
- **Data**: Fetches only the most recent week's data for all tracked packages
- **Duration**: ~5-10 minutes for 100 packages (200ms delay between requests)

```bash
# Manual trigger
npm run update-daily

# Automated via GitHub Actions
# See: .github/workflows/update-npm-data.yml
```

### Initial Backfill (One-time)
- **When**: Only when adding new packages
- **Data**: 52 weeks of historical data
- **Duration**: ~15 minutes for 70 packages
- **Cost**: Free (NPM API has no cost, just rate limits)

```bash
# Only run when adding new packages
npm run backfill
```

## 2. Smart Package Selection Strategy

### Current Approach (70 packages)
We track packages across these investment themes:

#### 🤖 AI/ML Infrastructure (Hottest VC Category)
- `openai`, `langchain`, `ai` (Vercel AI SDK)
- Vector DBs: `pinecone-client`, `chromadb`
- **Why**: $10B+ invested in AI tooling in 2024

#### ⚡ Modern Web Frameworks
- `next`, `astro`, `remix`, `qwik`
- **Why**: Early adopters signal broader developer trends

#### 🛠️ Developer Tools
- `vite`, `turbo`, `biome`, `bun`
- **Why**: Strong SaaS metrics, high willingness to pay

#### 📊 Data/Backend Infrastructure
- `@supabase/supabase-js`, `prisma`, `drizzle-orm`
- **Why**: Critical infrastructure = sticky revenue

#### 🌐 Edge Computing (Emerging)
- `hono`, `@cloudflare/workers-types`
- **Why**: Next platform shift

### Package Discovery Automation

**Auto-add packages that meet these criteria:**
- Weekly downloads > 10,000 (signals real traction)
- Growth rate > 50% over 3 months
- In target categories: AI, edge, serverless, realtime, vector, database

**Sources for discovery:**
- NPM trending page
- GitHub trending (JavaScript/TypeScript)
- Hacker News mentions
- YC company packages (W23-W24 batches)
- VC portfolio companies (a16z, Sequoia tools funds)

## 3. Investment Signals

### Strong Buy Signals 🟢
- Growth rate > 100%
- Positive acceleration (speeding up)
- Category: AI Infrastructure or Modern Frameworks
- Corporate backing (Vercel, Anthropic, etc.)

### Emerging Opportunities 🟡
- Growth rate > 50%
- Weekly downloads > 5,000
- Package age < 6 months
- Clean exponential curve

### Established Winners 🔵
- Weekly downloads > 100,000
- Sustained growth > 20%
- Multiple quarters of data

### Red Flags 🔴
- Negative acceleration (slowing down)
- Declining downloads
- Single maintainer, no corporate backing
- No updates in 3+ months

## 4. Data Efficiency

### What We Fetch
✅ **Incremental daily updates** (1 data point per package)
✅ **Historical backfill** (one-time per package)
✅ **Only tracked packages** (~100-200 curated packages)

### What We Don't Fetch
❌ All NPM packages (4M+ packages - waste of resources)
❌ Daily granularity (weekly is sufficient for trends)
❌ Re-fetching historical data (permanent storage)

### Rate Limiting Strategy
- 200ms delay between requests (max 5 req/sec)
- NPM API limit: ~1000 req/hour (we use ~20/day)
- GitHub Actions timeout: 6 hours (we use ~10 min)

## 5. Cost Analysis

| Service | Usage | Cost |
|---------|-------|------|
| NPM API | 20-100 req/day | Free |
| GitHub Actions | 10 min/day = 300 min/month | Free (under 2,000 min limit) |
| Supabase | ~100 packages × 52 weeks = 5,200 rows | Free (under 500MB limit) |
| Vercel Hosting | Static site + API | Free |
| **Total** | | **$0/month** |

### Scaling Considerations
- **500 packages**: Still free tier
- **1,000 packages**: Still free tier (52k rows)
- **10,000 packages**: Need Supabase Pro ($25/month)

## 6. Recommended Workflow

### For You (Investor)
1. **Daily**: Check dashboard for new exponential packages
2. **Weekly**: Review "Strong Buy" signals
3. **Monthly**: Analyze category trends (AI vs Edge vs Data)
4. **Quarterly**: Backfill new high-potential packages

### Automated (GitHub Actions)
1. **Daily 2 AM UTC**: Fetch latest week's data
2. **Weekly Sunday**: Run package discovery
3. **Monthly**: Clean up stale packages (no growth for 6 months)

### Manual Triggers
```bash
# Add a new package (includes backfill)
npm run add-package <package-name>

# Force update all packages
npm run update-daily

# Full historical backfill
npm run backfill
```

## 7. Advanced Features to Add

### Phase 2: Enhanced Signals
- [ ] Corporate backing detection (GitHub org analysis)
- [ ] Funding round correlation (Crunchbase API)
- [ ] GitHub stars/contributors tracking
- [ ] NPM package dependencies (ecosystem strength)
- [ ] Twitter/HN mention tracking

### Phase 3: Predictive Analytics
- [ ] ML model for growth prediction
- [ ] Similar package clustering
- [ ] Early warning system (email alerts)
- [ ] Category heatmaps (which categories are hot)

### Phase 4: Investment Tools
- [ ] Export to CSV for analysis
- [ ] Integration with Airtable/Notion
- [ ] Multi-package comparison view
- [ ] Custom watchlists
- [ ] API access for programmatic queries

## 8. Data Quality

### Validation Rules
- Downloads must be > 0
- Growth rate must be reasonable (-100% to +10,000%)
- Dates must be sequential
- No gaps > 2 weeks (fill with interpolation)

### Data Cleaning
```sql
-- Remove obvious errors
DELETE FROM package_downloads
WHERE downloads = 0 OR downloads IS NULL;

-- Find suspicious spikes (>1000% week-over-week)
SELECT package_name, date, downloads,
  LAG(downloads) OVER (PARTITION BY package_name ORDER BY date) as prev
FROM package_downloads
WHERE downloads / LAG(downloads) OVER (PARTITION BY package_name ORDER BY date) > 10;
```

## 9. Privacy & Compliance

- ✅ All data is public (NPM API)
- ✅ No user tracking
- ✅ No PII collection
- ✅ No scraping (official NPM API)
- ✅ Rate limiting respected

## 10. Next Steps

1. **Set up GitHub Actions** (secrets in repo settings):
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

2. **Create package discovery script** to auto-add trending packages

3. **Add category filters** to dashboard UI

4. **Set up email alerts** for strong buy signals

5. **Create investment report** generator (weekly PDF)

## Questions to Consider

**For curating packages:**
- What YC batch companies should we track?
- Which VC portfolios are most relevant?
- What categories are you most interested in?

**For investment decisions:**
- What growth rate threshold = investable?
- How important is corporate backing?
- Should we track competition (similar packages)?

**For scaling:**
- How many packages total should we track?
- What's the update frequency (daily vs weekly)?
- Do you need real-time alerts?
