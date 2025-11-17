import axios from 'axios'
import { supabase } from '../lib/supabase'
import { startOfDay, subDays, format } from 'date-fns'

/**
 * Daily update script - only fetches the most recent week's data
 * Much faster than backfill since it only gets 1 data point per package
 */

interface DownloadStats {
  downloads: number
  start: string
  end: string
  package: string
}

async function fetchDownloads(
  packageName: string,
  startDate: Date,
  endDate: Date
): Promise<DownloadStats | null> {
  const start = format(startDate, 'yyyy-MM-dd')
  const end = format(endDate, 'yyyy-MM-dd')

  try {
    const response = await axios.get(
      `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`,
      { timeout: 10000 }
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch downloads for ${packageName}:`, error)
    return null
  }
}

async function getActivePackages(): Promise<string[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('name')
    .order('name')

  if (error) {
    console.error('Error fetching packages:', error)
    return []
  }

  return data.map((p) => p.name)
}

async function updateDailyData() {
  console.log('🔄 Starting daily NPM data update')

  // Get list of packages to track
  const packages = await getActivePackages()
  console.log(`📦 Tracking ${packages.length} packages`)

  // Fetch data for the most recent complete week (3 days ago to account for npm delay)
  const endDate = startOfDay(subDays(new Date(), 3))
  const startDate = startOfDay(subDays(endDate, 6))

  console.log(`📅 Fetching data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`)

  let successCount = 0
  let skipCount = 0

  for (const packageName of packages) {
    // Check if we already have this data point
    const { data: existing } = await supabase
      .from('package_downloads')
      .select('id')
      .eq('package_name', packageName)
      .eq('date', format(endDate, 'yyyy-MM-dd'))
      .single()

    if (existing) {
      skipCount++
      continue
    }

    // Fetch new data
    const stats = await fetchDownloads(packageName, startDate, endDate)

    if (stats) {
      const { error } = await supabase
        .from('package_downloads')
        .insert({
          package_name: packageName,
          downloads: stats.downloads,
          date: format(endDate, 'yyyy-MM-dd'),
        })

      if (!error) {
        successCount++
        console.log(`✓ ${packageName}: ${stats.downloads.toLocaleString()} downloads`)
      }
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  console.log(`\n✅ Daily update complete!`)
  console.log(`   New data points: ${successCount}`)
  console.log(`   Skipped (already exists): ${skipCount}`)
  console.log(`   Failed: ${packages.length - successCount - skipCount}`)
}

updateDailyData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Update failed:', error)
    process.exit(1)
  })
