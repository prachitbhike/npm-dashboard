import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';

import { testConnection, initializeDatabase } from './config/database.js';
import { PackageService } from './services/packageService.js';
import { NpmService } from './services/npmService.js';
import { DataCollector } from './scripts/collect-data.js';

dotenv.config();

const app = new Hono();
const packageService = new PackageService();
const npmService = new NpmService();
const dataCollector = new DataCollector();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Get all tracked packages with summaries
app.get('/api/packages', async (c) => {
  try {
    const packages = await packageService.getPackageSummaries();
    return c.json({ success: true, data: packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return c.json({ success: false, error: 'Failed to fetch packages' }, 500);
  }
});

// Get trending packages
app.get('/api/packages/trending', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const packages = await packageService.getTrendingPackages(limit);
    return c.json({ success: true, data: packages });
  } catch (error) {
    console.error('Error fetching trending packages:', error);
    return c.json({ success: false, error: 'Failed to fetch trending packages' }, 500);
  }
});

// Get specific package details with trends
app.get('/api/packages/:name', async (c) => {
  try {
    const packageName = c.req.param('name');
    const pkg = await packageService.getPackageByName(packageName);

    if (!pkg) {
      return c.json({ success: false, error: 'Package not found' }, 404);
    }

    const days = parseInt(c.req.query('days') || '30');
    const trends = await packageService.getRecentTrends(pkg.id, days);

    return c.json({
      success: true,
      data: {
        package: pkg,
        trends
      }
    });
  } catch (error) {
    console.error('Error fetching package details:', error);
    return c.json({ success: false, error: 'Failed to fetch package details' }, 500);
  }
});

// Add a new package to track
app.post('/api/packages', async (c) => {
  try {
    const { name } = await c.req.json();

    if (!name || typeof name !== 'string') {
      return c.json({ success: false, error: 'Package name is required' }, 400);
    }

    // Validate package name
    if (!npmService.isValidPackageName(name)) {
      return c.json({ success: false, error: 'Invalid package name format' }, 400);
    }

    // Check if already tracking
    const existingPackage = await packageService.getPackageByName(name);
    if (existingPackage) {
      return c.json({ success: false, error: 'Package is already being tracked' }, 409);
    }

    // Add package
    const success = await dataCollector.addNewPackage(name);

    if (success) {
      const pkg = await packageService.getPackageByName(name);
      return c.json({ success: true, data: pkg });
    } else {
      return c.json({ success: false, error: 'Failed to add package' }, 500);
    }
  } catch (error) {
    console.error('Error adding package:', error);
    return c.json({ success: false, error: 'Failed to add package' }, 500);
  }
});

// Remove a package from tracking
app.delete('/api/packages/:id', async (c) => {
  try {
    const packageId = parseInt(c.req.param('id'));

    if (isNaN(packageId)) {
      return c.json({ success: false, error: 'Invalid package ID' }, 400);
    }

    const success = await packageService.removePackage(packageId);

    if (success) {
      return c.json({ success: true, message: 'Package removed from tracking' });
    } else {
      return c.json({ success: false, error: 'Package not found' }, 404);
    }
  } catch (error) {
    console.error('Error removing package:', error);
    return c.json({ success: false, error: 'Failed to remove package' }, 500);
  }
});

// Search for packages on npm
app.get('/api/search', async (c) => {
  try {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '20');

    if (!query) {
      return c.json({ success: false, error: 'Search query is required' }, 400);
    }

    const results = await npmService.searchPackages(query, limit);

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching packages:', error);
    return c.json({ success: false, error: 'Failed to search packages' }, 500);
  }
});

// Trigger data collection for all packages
app.post('/api/collect', async (c) => {
  try {
    // Run collection in background
    dataCollector.collectAllPackageData().catch(console.error);

    return c.json({ success: true, message: 'Data collection started' });
  } catch (error) {
    console.error('Error starting data collection:', error);
    return c.json({ success: false, error: 'Failed to start data collection' }, 500);
  }
});

// Get download data for a specific package
app.get('/api/packages/:name/downloads', async (c) => {
  try {
    const packageName = c.req.param('name');
    const days = parseInt(c.req.query('days') || '30');

    const pkg = await packageService.getPackageByName(packageName);
    if (!pkg) {
      return c.json({ success: false, error: 'Package not found' }, 404);
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const downloads = await packageService.getDownloadData(
      pkg.id,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    return c.json({ success: true, data: downloads });
  } catch (error) {
    console.error('Error fetching download data:', error);
    return c.json({ success: false, error: 'Failed to fetch download data' }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Route not found' }, 404);
});

// Start server
async function startServer() {
  const port = parseInt(process.env.PORT || '3001');

  // Test database connection
  console.log('Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  // Initialize database
  console.log('Initializing database...');
  await initializeDatabase();

  // Start HTTP server
  console.log(`Starting server on port ${port}...`);

  serve({
    fetch: app.fetch,
    port
  });

  console.log(`🚀 NPM Dashboard API server running at http://localhost:${port}`);
  console.log(`📊 Dashboard available at ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
}

startServer().catch(console.error);