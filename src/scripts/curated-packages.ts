/**
 * Curated package lists for VC investment tracking
 * Organized by investment themes and signals
 */

export const packageCategories = {
  // AI/ML Infrastructure (Hot VC category)
  aiInfrastructure: [
    'openai',
    '@anthropic-ai/sdk',
    'langchain',
    '@langchain/core',
    'ai', // Vercel AI SDK
    '@ai-sdk/openai',
    'llamaindex',
    'pinecone-client',
    'chromadb',
    'weaviate-ts-client',
  ],

  // Modern Web Frameworks (High growth potential)
  modernFrameworks: [
    'next',
    'astro',
    'remix',
    'qwik',
    'solid-js',
    'svelte',
    'fresh',
  ],

  // Developer Tools (Strong SaaS metrics)
  devTools: [
    'vite',
    'turbo',
    'biome',
    'oxlint',
    'bun',
    'tsx',
    'tsup',
  ],

  // Data/Backend Infrastructure
  dataInfra: [
    '@supabase/supabase-js',
    'prisma',
    '@prisma/client',
    'drizzle-orm',
    'postgres',
    'pg',
  ],

  // Edge Computing (Emerging category)
  edgeComputing: [
    '@cloudflare/workers-types',
    '@vercel/edge',
    'hono', // Edge-first framework
    '@hono/node-server',
  ],

  // Testing/Quality (Essential tooling)
  testing: [
    'vitest',
    'playwright',
    '@playwright/test',
    'cypress',
  ],

  // State Management (Framework ecosystem indicators)
  stateManagement: [
    'zustand',
    'jotai',
    '@tanstack/react-query',
    'recoil',
  ],

  // YC-Backed Companies (W23-W24)
  ycBacked: [
    // Add packages from recent YC batches
    // Example: 'some-yc-package'
  ],
}

/**
 * Package discovery criteria for automated tracking
 */
export const discoveryThresholds = {
  // Add package if it crosses these thresholds
  minWeeklyDownloads: 10000, // 10k weekly = ~40k monthly
  minGrowthRate: 50, // 50% growth over 3 months
  minDataPoints: 4, // At least 4 weeks of history

  // Categories to auto-discover
  categories: [
    'ai',
    'llm',
    'ml',
    'edge',
    'serverless',
    'realtime',
    'vector',
    'database',
  ],
}

/**
 * Get all packages we should actively track
 */
export function getAllTrackedPackages(): string[] {
  const allPackages = new Set<string>()

  Object.values(packageCategories).forEach((category) => {
    category.forEach((pkg) => allPackages.add(pkg))
  })

  return Array.from(allPackages).sort()
}

/**
 * Investment signals to calculate
 */
export const investmentSignals = {
  // Strong signals
  strongBuy: {
    minGrowthRate: 100, // 100%+ growth
    minAcceleration: 20, // Accelerating
    categories: ['aiInfrastructure', 'modernFrameworks'],
  },

  // Emerging opportunities
  emerging: {
    minGrowthRate: 50,
    minWeeklyDownloads: 5000,
    maxAge: 180, // Less than 6 months old
  },

  // Established winners
  established: {
    minWeeklyDownloads: 100000,
    minGrowthRate: 20,
  },
}

/**
 * Companies/orgs to track (for corporate backing signal)
 */
export const trackedOrgs = [
  'vercel',
  'supabase',
  'anthropic-ai',
  'langchain',
  'openai',
  'cloudflare',
  'prisma',
  'tanstack',
]
