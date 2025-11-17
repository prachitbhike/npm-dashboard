import { supabase } from '@/lib/supabase'
import { subDays, format } from 'date-fns'

export interface NPMDownloadStats {
  downloads: number
  start: string
  end: string
  package: string
}

export interface PackageInfo {
  name: string
  description?: string
  repository?: {
    url: string
  }
}

/**
 * Fetch download statistics from npm registry for a specific date range
 */
export async function fetchNPMDownloads(
  packageName: string,
  startDate: Date,
  endDate: Date
): Promise<NPMDownloadStats> {
  const start = format(startDate, 'yyyy-MM-dd')
  const end = format(endDate, 'yyyy-MM-dd')

  const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch downloads for ${packageName}`)
  }

  return response.json()
}

/**
 * Fetch package metadata from npm registry
 */
export async function fetchPackageInfo(packageName: string): Promise<PackageInfo> {
  const url = `https://registry.npmjs.org/${packageName}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch package info for ${packageName}`)
  }

  const data = await response.json()
  return {
    name: data.name,
    description: data.description,
    repository: data.repository,
  }
}

/**
 * Fetch top npm packages
 */
export async function fetchTopPackages(limit: number = 100): Promise<string[]> {
  // Using a curated list of popular packages as npm doesn't have a direct "top packages" API
  // In production, you might want to use npms.io API or maintain your own list
  const topPackages = [
    'react', 'vue', 'angular', 'next', 'express', 'axios', 'lodash', 'typescript',
    'webpack', 'eslint', 'prettier', 'jest', 'tailwindcss', 'redux', 'moment',
    'react-dom', 'prop-types', 'classnames', 'dotenv', 'chalk', 'commander',
    'inquirer', 'yargs', 'request', 'async', 'underscore', 'babel-core',
    'cors', 'body-parser', 'mongodb', 'mysql', 'pg', 'redis', 'socket.io',
    'passport', 'jsonwebtoken', 'bcrypt', 'helmet', 'morgan', 'multer',
    'nodemon', 'mocha', 'chai', 'supertest', 'sinon', 'enzyme', 'react-router',
    'react-router-dom', 'styled-components', 'emotion', 'sass', 'less',
    'postcss', 'autoprefixer', 'rollup', 'parcel', 'vite', 'esbuild',
    'tsup', 'turbo', 'nx', 'lerna', 'pnpm', 'yarn', 'rimraf', 'cross-env',
    'concurrently', 'pm2', 'forever', 'nodemailer', 'sharp', 'jimp',
    'pdfkit', 'csv-parser', 'cheerio', 'puppeteer', 'playwright', 'cypress',
    'testing-library', '@testing-library/react', '@testing-library/jest-dom',
    'react-query', 'swr', 'zustand', 'jotai', 'recoil', 'mobx', 'xstate',
    'immer', 'ramda', 'rxjs', 'date-fns', 'dayjs', 'luxon', 'validator',
    'joi', 'yup', 'zod', 'ajv', 'uuid', 'nanoid', 'shortid', 'slugify',
    'debug', 'winston', 'pino', 'bunyan', 'log4js', 'colors', 'ora',
    'boxen', 'figlet', 'cli-table', 'progress', 'prompts', 'enquirer'
  ]

  return topPackages.slice(0, limit)
}

/**
 * Save download statistics to Supabase
 */
export async function saveDownloadStats(
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
    console.error('Error saving download stats:', error)
    throw error
  }
}

/**
 * Save package metadata to Supabase
 */
export async function savePackageInfo(packageInfo: PackageInfo) {
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
    console.error('Error saving package info:', error)
    throw error
  }
}

/**
 * Fetch and store download data for multiple time periods
 */
export async function updatePackageData(packageName: string) {
  const now = new Date()

  // Fetch data for different time periods
  const periods = [
    { days: 7, label: 'week' },
    { days: 30, label: 'month' },
    { days: 90, label: '3months' },
    { days: 180, label: '6months' },
    { days: 365, label: 'year' },
  ]

  try {
    // Fetch package info
    const packageInfo = await fetchPackageInfo(packageName)
    await savePackageInfo(packageInfo)

    // Fetch download stats for each period
    for (const period of periods) {
      const startDate = subDays(now, period.days)
      const stats = await fetchNPMDownloads(packageName, startDate, now)

      await saveDownloadStats(
        packageName,
        stats.downloads,
        format(now, 'yyyy-MM-dd')
      )

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return true
  } catch (error) {
    console.error(`Error updating data for ${packageName}:`, error)
    return false
  }
}
