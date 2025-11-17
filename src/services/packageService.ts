import axios from 'axios'
import { supabase } from '@/lib/supabase'
import { startOfDay, subDays, subWeeks, format } from 'date-fns'

interface NPMPackageInfo {
  name: string
  description?: string
  repository?: {
    url?: string
  }
}

interface DownloadStats {
  downloads: number
  start: string
  end: string
  package: string
}

/**
 * Fetch package info from NPM registry
 */
async function fetchPackageInfo(packageName: string): Promise<NPMPackageInfo | null> {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`, {
      timeout: 10000,
    })
    return response.data
  } catch (error) {
    console.error(`Failed to fetch package info for ${packageName}:`, error)
    return null
  }
}

/**
 * Fetch download stats from NPM API
 */
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

/**
 * Add a new package to tracking
 */
export async function addPackage(packageName: string): Promise<{
  success: boolean
  message: string
  dataPoints?: number
}> {
  try {
    // 1. Validate package exists on NPM
    const packageInfo = await fetchPackageInfo(packageName)
    if (!packageInfo) {
      return {
        success: false,
        message: `Package "${packageName}" not found on NPM. Please check the spelling.`,
      }
    }

    // 2. Check if already tracking
    const { data: existing } = await supabase
      .from('packages')
      .select('name')
      .eq('name', packageName)
      .single()

    if (existing) {
      return {
        success: false,
        message: `Package "${packageName}" is already being tracked.`,
      }
    }

    // 3. Add to packages table
    const { error: insertError } = await supabase.from('packages').insert({
      name: packageName,
      description: packageInfo.description || null,
      repository: packageInfo.repository?.url || null,
    })

    if (insertError) {
      console.error('Error inserting package:', insertError)
      return {
        success: false,
        message: `Failed to add package: ${insertError.message}`,
      }
    }

    // 4. Backfill historical data (last 52 weeks)
    const dataPoints = await backfillPackageData(packageName)

    return {
      success: true,
      message: `Successfully added "${packageName}" with ${dataPoints} weeks of historical data.`,
      dataPoints,
    }
  } catch (error) {
    console.error('Error adding package:', error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Backfill historical data for a package
 */
async function backfillPackageData(
  packageName: string,
  weeksBack: number = 52
): Promise<number> {
  let dataPointsSaved = 0

  // Start from 3 days ago to account for NPM's data processing delay
  const now = new Date()
  const dataAvailableUntil = startOfDay(subDays(now, 3))

  for (let i = 0; i <= weeksBack; i++) {
    const endDate = startOfDay(subWeeks(dataAvailableUntil, i))
    const startDate = startOfDay(subDays(endDate, 6))

    // Skip future dates
    if (endDate > now) continue

    const stats = await fetchDownloads(packageName, startDate, endDate)

    if (stats && stats.downloads > 0) {
      const { error } = await supabase
        .from('package_downloads')
        .insert({
          package_name: packageName,
          downloads: stats.downloads,
          date: format(endDate, 'yyyy-MM-dd'),
        })
        .select()

      if (!error) {
        dataPointsSaved++
      }
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return dataPointsSaved
}

/**
 * Remove a package from tracking
 */
export async function removePackage(packageName: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    // 1. Delete from package_downloads
    const { error: downloadsError } = await supabase
      .from('package_downloads')
      .delete()
      .eq('package_name', packageName)

    if (downloadsError) {
      return {
        success: false,
        message: `Failed to remove download data: ${downloadsError.message}`,
      }
    }

    // 2. Delete from packages
    const { error: packageError } = await supabase
      .from('packages')
      .delete()
      .eq('name', packageName)

    if (packageError) {
      return {
        success: false,
        message: `Failed to remove package: ${packageError.message}`,
      }
    }

    return {
      success: true,
      message: `Successfully removed "${packageName}" from tracking.`,
    }
  } catch (error) {
    console.error('Error removing package:', error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Validate NPM package name format
 */
export function isValidPackageName(name: string): boolean {
  // NPM package naming rules
  const npmPackageRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  return npmPackageRegex.test(name)
}
