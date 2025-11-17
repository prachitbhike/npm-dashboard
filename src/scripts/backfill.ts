/**
 * Backfill Script - Populate historical npm download data
 *
 * This script fetches historical download data for npm packages
 * at weekly intervals going back up to 1 year.
 *
 * Note: Starts from 3 days ago to account for npm's data processing delay.
 * npm typically has a 2-3 day delay in making download stats available.
 *
 * Run: npm run backfill
 */

import { supabase } from '../lib/supabase'
import { subDays, subWeeks, format, startOfDay } from 'date-fns'

interface NPMDownloadStats {
  downloads: number
  start: string
  end: string
  package: string
}

interface PackageInfo {
  name: string
  description?: string
  repository?: {
    url: string
  }
}

const PACKAGES_TO_BACKFILL = [
  // Modern frameworks & libraries
  'react', 'vue', 'angular', 'svelte', 'solid-js', 'next', 'nuxt', 'remix',
  'astro', 'qwik', 'fresh',

  // Build tools & bundlers
  'vite', 'webpack', 'esbuild', 'rollup', 'parcel', 'turbo', 'tsup',

  // React ecosystem
  'react-dom', 'react-router', 'react-router-dom', 'react-query', '@tanstack/react-query',
  'zustand', 'jotai', 'recoil', 'redux', '@reduxjs/toolkit',

  // Styling
  'tailwindcss', 'styled-components', '@emotion/react', 'sass', 'postcss',

  // TypeScript & tooling
  'typescript', 'tsx', '@types/node', '@types/react',

  // Backend frameworks
  'express', 'fastify', 'hono', 'koa', '@hono/node-server',

  // Utilities
  'axios', 'lodash', 'date-fns', 'dayjs', 'zod', 'yup',

  // Testing
  'vitest', 'jest', '@testing-library/react', 'playwright', 'cypress',

  // AI/ML related (trending)
  'openai', '@langchain/core', 'langchain', '@ai-sdk/openai', 'ai',

  // Monorepo tools
  'nx', 'lerna', 'turborepo',

  // Database clients
  '@supabase/supabase-js', 'prisma', '@prisma/client', 'drizzle-orm',

  // Modern utilities
  'bun', 'biome', 'oxlint', 'nanoid', 'uuid'
]

/**
 * Fetch package info from npm registry
 */
async function fetchPackageInfo(packageName: string): Promise<PackageInfo | null> {
  try {
    const url = `https://registry.npmjs.org/${packageName}`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Failed to fetch package info for ${packageName}`)
      return null
    }

    const data = await response.json()
    return {
      name: data.name,
      description: data.description,
      repository: data.repository,
    }
  } catch (error) {
    console.error(`Error fetching package info for ${packageName}:`, error)
    return null
  }
}

/**
 * Fetch download stats for a specific date range
 */
async function fetchDownloads(
  packageName: string,
  startDate: Date,
  endDate: Date
): Promise<NPMDownloadStats | null> {
  try {
    const start = format(startDate, 'yyyy-MM-dd')
    const end = format(endDate, 'yyyy-MM-dd')
    const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`

    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Failed to fetch downloads for ${packageName} (${start} to ${end})`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching downloads for ${packageName}:`, error)
    return null
  }
}

/**
 * Save package metadata to database
 */
async function savePackageInfo(packageInfo: PackageInfo) {
  const { error } = await supabase
    .from('packages')
    .upsert({
      name: packageInfo.name,
      description: packageInfo.description,
      repository: packageInfo.repository?.url,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'name'
    })

  if (error) {
    console.error(`Error saving package info for ${packageInfo.name}:`, error)
  }
}

/**
 * Save download stats to database
 */
async function saveDownloadStats(
  packageName: string,
  downloads: number,
  date: string
) {
  const { error } = await supabase
    .from('package_downloads')
    .upsert({
      package_name: packageName,
      downloads,
      date,
    }, {
      onConflict: 'package_name,date'
    })

  if (error) {
    console.error(`Error saving download stats for ${packageName} on ${date}:`, error)
  }
}

/**
 * Backfill data for a single package
 */
async function backfillPackage(packageName: string, weeksBack: number = 52) {
  console.log(`\n📦 Backfilling ${packageName}...`)

  // Fetch and save package info
  const packageInfo = await fetchPackageInfo(packageName)
  if (!packageInfo) {
    console.log(`❌ Failed to fetch package info for ${packageName}`)
    return
  }

  await savePackageInfo(packageInfo)
  console.log(`✓ Saved package info`)

  // Start from 3 days ago to account for npm's data processing delay
  const now = new Date()
  const dataAvailableUntil = startOfDay(subDays(now, 3))

  let successCount = 0
  let errorCount = 0

  // Fetch weekly data points going back
  for (let i = 0; i <= weeksBack; i++) {
    const endDate = startOfDay(subWeeks(dataAvailableUntil, i))
    const startDate = startOfDay(subDays(endDate, 6)) // 7-day period

    // Skip if the end date is in the future (shouldn't happen with our calculation, but safety check)
    if (endDate > now) {
      continue
    }

    const stats = await fetchDownloads(packageName, startDate, endDate)

    if (stats && stats.downloads) {
      await saveDownloadStats(
        packageName,
        stats.downloads,
        format(endDate, 'yyyy-MM-dd')
      )
      successCount++

      // Progress indicator every 10 weeks
      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${weeksBack + 1} weeks`)
      }
    } else {
      errorCount++
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  console.log(`✓ Completed: ${successCount} data points saved, ${errorCount} errors`)
}

/**
 * Main backfill function
 */
async function main() {
  console.log('🚀 Starting NPM Package Data Backfill')
  console.log(`📊 Backfilling ${PACKAGES_TO_BACKFILL.length} packages`)
  console.log(`📅 Fetching weekly data for the past year\n`)

  const startTime = Date.now()
  let completedPackages = 0

  for (const packageName of PACKAGES_TO_BACKFILL) {
    try {
      await backfillPackage(packageName, 52) // 52 weeks = 1 year
      completedPackages++

      console.log(`\n✅ Progress: ${completedPackages}/${PACKAGES_TO_BACKFILL.length} packages completed`)

      // Longer delay between packages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`❌ Error backfilling ${packageName}:`, error)
    }
  }

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2)
  console.log(`\n🎉 Backfill complete!`)
  console.log(`   Packages processed: ${completedPackages}/${PACKAGES_TO_BACKFILL.length}`)
  console.log(`   Time taken: ${duration} minutes`)
  console.log(`\n💡 Refresh your dashboard to see the trends!`)
}

// Run the backfill
main().catch(console.error)
