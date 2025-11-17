import { PackageDownloads } from '@/lib/supabase'

export interface GrowthMetrics {
  packageName: string
  currentDownloads: number
  previousDownloads: number
  growthRate: number
  percentageGrowth: number
  isExponential: boolean
  acceleration: number | null
  trend: 'exponential' | 'accelerating' | 'growing' | 'stable' | 'declining'
  dataPoints: number
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? Infinity : 0
  return ((current - previous) / previous) * 100
}

/**
 * Detect if growth is exponential
 * A package is considered exponentially growing if the growth rate is consistently increasing
 */
export function isExponentialGrowth(downloadHistory: number[]): boolean {
  if (downloadHistory.length < 3) return false

  const growthRates: number[] = []
  for (let i = 1; i < downloadHistory.length; i++) {
    const rate = calculateGrowthRate(downloadHistory[i], downloadHistory[i - 1])
    growthRates.push(rate)
  }

  // Check if growth rates are increasing (acceleration)
  let accelerationCount = 0
  for (let i = 1; i < growthRates.length; i++) {
    if (growthRates[i] > growthRates[i - 1]) {
      accelerationCount++
    }
  }

  // If more than 60% of periods show acceleration, consider it exponential
  return accelerationCount / (growthRates.length - 1) > 0.6
}

/**
 * Calculate acceleration (change in growth rate)
 * Returns null if there aren't enough data points (need at least 3)
 */
export function calculateAcceleration(downloadHistory: number[]): number | null {
  if (downloadHistory.length < 3) return null

  const recentGrowth = calculateGrowthRate(
    downloadHistory[downloadHistory.length - 1],
    downloadHistory[downloadHistory.length - 2]
  )

  const previousGrowth = calculateGrowthRate(
    downloadHistory[downloadHistory.length - 2],
    downloadHistory[downloadHistory.length - 3]
  )

  return recentGrowth - previousGrowth
}

/**
 * Determine the trend of a package
 */
export function determineTrend(
  growthRate: number,
  acceleration: number | null,
  isExponential: boolean
): GrowthMetrics['trend'] {
  if (isExponential) return 'exponential'
  if (acceleration !== null && acceleration > 10) return 'accelerating'
  if (growthRate > 20) return 'growing'
  if (growthRate > -10) return 'stable'
  return 'declining'
}

/**
 * Calculate comprehensive growth metrics for a package
 */
export function calculateGrowthMetrics(
  packageName: string,
  downloadData: PackageDownloads[]
): GrowthMetrics {
  const dataPoints = downloadData.length

  if (dataPoints < 2) {
    return {
      packageName,
      currentDownloads: downloadData[0]?.downloads || 0,
      previousDownloads: 0,
      growthRate: 0,
      percentageGrowth: 0,
      isExponential: false,
      acceleration: null,
      trend: 'stable',
      dataPoints,
    }
  }

  // Sort by date
  const sortedData = [...downloadData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const downloadHistory = sortedData.map(d => d.downloads)
  const current = downloadHistory[downloadHistory.length - 1]
  const previous = downloadHistory[downloadHistory.length - 2]

  const growthRate = calculateGrowthRate(current, previous)
  const acceleration = calculateAcceleration(downloadHistory)
  const isExponential = isExponentialGrowth(downloadHistory)
  const trend = determineTrend(growthRate, acceleration, isExponential)

  return {
    packageName,
    currentDownloads: current,
    previousDownloads: previous,
    growthRate,
    percentageGrowth: growthRate,
    isExponential,
    acceleration,
    trend,
    dataPoints,
  }
}

/**
 * Sort packages by growth rate
 */
export function sortByGrowth(metrics: GrowthMetrics[]): GrowthMetrics[] {
  return [...metrics].sort((a, b) => {
    // Prioritize exponential growth
    if (a.isExponential && !b.isExponential) return -1
    if (!a.isExponential && b.isExponential) return 1

    // Then sort by growth rate
    return b.growthRate - a.growthRate
  })
}

/**
 * Filter packages by trend
 */
export function filterByTrend(
  metrics: GrowthMetrics[],
  trend: GrowthMetrics['trend']
): GrowthMetrics[] {
  return metrics.filter(m => m.trend === trend)
}

/**
 * Get top growing packages
 */
export function getTopGrowing(
  metrics: GrowthMetrics[],
  limit: number = 10
): GrowthMetrics[] {
  return sortByGrowth(metrics).slice(0, limit)
}
