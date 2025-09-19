#!/usr/bin/env node

import dotenv from 'dotenv';
import { testConnection, initializeDatabase } from '../config/database.js';
import { NpmService } from '../services/npmService.js';
import { PackageService } from '../services/packageService.js';

dotenv.config();

class DataCollector {
  private npmService: NpmService;
  private packageService: PackageService;

  constructor() {
    this.npmService = new NpmService();
    this.packageService = new PackageService();
  }

  /**
   * Collect data for all tracked packages
   */
  async collectAllPackageData(): Promise<void> {
    console.log('Starting data collection...');

    try {
      // Get all tracked packages
      const packages = await this.packageService.getAllPackages();
      console.log(`Found ${packages.length} packages to update`);

      for (const pkg of packages) {
        console.log(`Processing ${pkg.name}...`);
        await this.collectPackageData(pkg.name);

        // Add delay between packages to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Data collection completed successfully');
    } catch (error) {
      console.error('Error during data collection:', error);
      throw error;
    }
  }

  /**
   * Collect data for a specific package
   */
  async collectPackageData(packageName: string): Promise<void> {
    try {
      // Get package info and update metadata
      const packageInfo = await this.npmService.getPackageInfo(packageName);
      if (!packageInfo) {
        console.error(`Could not fetch info for package: ${packageName}`);
        return;
      }

      // Update package metadata
      const pkg = await this.packageService.addPackage(packageInfo);
      if (!pkg) {
        console.error(`Could not add/update package: ${packageName}`);
        return;
      }

      // Get download statistics for the last 30 days
      const downloadStats = await this.npmService.getDownloadStats(packageName, 'last-month');
      if (!downloadStats || !downloadStats.downloads) {
        console.error(`Could not fetch download stats for package: ${packageName}`);
        return;
      }

      // Store daily download data
      const success = await this.packageService.storeDailyDownloads(pkg.id, downloadStats.downloads);
      if (!success) {
        console.error(`Could not store download data for package: ${packageName}`);
        return;
      }

      // Calculate weekly statistics
      await this.packageService.calculateWeeklyStats(pkg.id);

      console.log(`Successfully updated data for ${packageName}`);
    } catch (error) {
      console.error(`Error collecting data for ${packageName}:`, error);
    }
  }

  /**
   * Add a new package to track
   */
  async addNewPackage(packageName: string): Promise<boolean> {
    try {
      // Validate package name
      if (!this.npmService.isValidPackageName(packageName)) {
        console.error(`Invalid package name: ${packageName}`);
        return false;
      }

      // Check if package exists on npm
      const packageInfo = await this.npmService.getPackageInfo(packageName);
      if (!packageInfo) {
        console.error(`Package not found on npm: ${packageName}`);
        return false;
      }

      // Check if already tracking
      const existingPackage = await this.packageService.getPackageByName(packageName);
      if (existingPackage) {
        console.log(`Package ${packageName} is already being tracked`);
        return true;
      }

      // Add package
      const pkg = await this.packageService.addPackage(packageInfo);
      if (!pkg) {
        console.error(`Could not add package: ${packageName}`);
        return false;
      }

      // Collect initial data (last 90 days for better baseline)
      const downloadStats = await this.npmService.getDownloadStats(packageName, 'last-month');
      if (downloadStats && downloadStats.downloads) {
        await this.packageService.storeDailyDownloads(pkg.id, downloadStats.downloads);
        await this.packageService.calculateWeeklyStats(pkg.id);
      }

      console.log(`Successfully added package: ${packageName}`);
      return true;
    } catch (error) {
      console.error(`Error adding package ${packageName}:`, error);
      return false;
    }
  }

  /**
   * Collect historical data for a package
   */
  async collectHistoricalData(packageName: string, days: number = 90): Promise<void> {
    try {
      const pkg = await this.packageService.getPackageByName(packageName);
      if (!pkg) {
        console.error(`Package not found: ${packageName}`);
        return;
      }

      console.log(`Collecting ${days} days of historical data for ${packageName}...`);

      // Collect data in chunks to avoid API limits
      const chunkSize = 30; // 30-day chunks
      const chunks = Math.ceil(days / chunkSize);

      for (let i = 0; i < chunks; i++) {
        const endDaysAgo = i * chunkSize;
        const startDaysAgo = Math.min((i + 1) * chunkSize, days);

        const { start, end } = this.npmService.getDateRange(startDaysAgo);
        const endDate = this.npmService.getDateRange(endDaysAgo).end;

        const downloadStats = await this.npmService.getDownloadStatsByDateRange(
          packageName,
          start,
          endDate
        );

        if (downloadStats && downloadStats.downloads) {
          await this.packageService.storeDailyDownloads(pkg.id, downloadStats.downloads);
        }

        // Add delay between chunks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Recalculate weekly stats with new data
      await this.packageService.calculateWeeklyStats(pkg.id);

      console.log(`Historical data collection completed for ${packageName}`);
    } catch (error) {
      console.error(`Error collecting historical data for ${packageName}:`, error);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  // Initialize database if needed
  await initializeDatabase();

  const collector = new DataCollector();

  switch (command) {
    case 'collect':
      await collector.collectAllPackageData();
      break;

    case 'add':
      if (args.length < 2) {
        console.error('Usage: npm run collect add <package-name>');
        process.exit(1);
      }
      const success = await collector.addNewPackage(args[1]);
      process.exit(success ? 0 : 1);
      break;

    case 'historical':
      if (args.length < 2) {
        console.error('Usage: npm run collect historical <package-name> [days]');
        process.exit(1);
      }
      const days = args[2] ? parseInt(args[2]) : 90;
      await collector.collectHistoricalData(args[1], days);
      break;

    default:
      console.log('Usage:');
      console.log('  npm run collect collect           - Collect data for all tracked packages');
      console.log('  npm run collect add <package>     - Add a new package to track');
      console.log('  npm run collect historical <package> [days] - Collect historical data');
      break;
  }

  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DataCollector };