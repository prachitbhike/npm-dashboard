import axios from 'axios';
import { NpmRegistryResponse, NpmDownloadsResponse } from '../types/database.js';

export class NpmService {
  private readonly registryBaseUrl: string;
  private readonly downloadsBaseUrl: string;

  constructor() {
    this.registryBaseUrl = process.env.NPM_REGISTRY_BASE_URL || 'https://registry.npmjs.org';
    this.downloadsBaseUrl = process.env.NPM_DOWNLOADS_BASE_URL || 'https://api.npmjs.org/downloads';
  }

  /**
   * Fetch package metadata from npm registry
   */
  async getPackageInfo(packageName: string): Promise<NpmRegistryResponse | null> {
    try {
      const url = `${this.registryBaseUrl}/${packageName}`;
      const response = await axios.get<NpmRegistryResponse>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'npm-dashboard/1.0.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching package info for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Fetch download statistics for a package over a date range
   */
  async getDownloadStats(
    packageName: string,
    period: string = 'last-month'
  ): Promise<NpmDownloadsResponse | null> {
    try {
      const url = `${this.downloadsBaseUrl}/range/${period}/${packageName}`;
      const response = await axios.get<NpmDownloadsResponse>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'npm-dashboard/1.0.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching download stats for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Fetch download statistics for a custom date range
   */
  async getDownloadStatsByDateRange(
    packageName: string,
    startDate: string,
    endDate: string
  ): Promise<NpmDownloadsResponse | null> {
    try {
      const url = `${this.downloadsBaseUrl}/range/${startDate}:${endDate}/${packageName}`;
      const response = await axios.get<NpmDownloadsResponse>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'npm-dashboard/1.0.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching download stats for ${packageName} (${startDate} to ${endDate}):`, error);
      return null;
    }
  }

  /**
   * Search for packages by name
   */
  async searchPackages(query: string, limit: number = 20): Promise<any[]> {
    try {
      const url = `${this.registryBaseUrl}/-/v1/search`;
      const response = await axios.get(url, {
        params: {
          text: query,
          size: limit
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'npm-dashboard/1.0.0'
        }
      });

      return response.data.objects || [];
    } catch (error) {
      console.error(`Error searching packages with query "${query}":`, error);
      return [];
    }
  }

  /**
   * Get multiple packages' download stats in parallel
   */
  async getBulkDownloadStats(
    packageNames: string[],
    period: string = 'last-month'
  ): Promise<Map<string, NpmDownloadsResponse | null>> {
    const results = new Map<string, NpmDownloadsResponse | null>();

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < packageNames.length; i += batchSize) {
      const batch = packageNames.slice(i, i + batchSize);

      const promises = batch.map(async (packageName) => {
        const stats = await this.getDownloadStats(packageName, period);
        return { packageName, stats };
      });

      const batchResults = await Promise.all(promises);

      batchResults.forEach(({ packageName, stats }) => {
        results.set(packageName, stats);
      });

      // Add delay between batches to be respectful to the API
      if (i + batchSize < packageNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Format date for npm API (YYYY-MM-DD)
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date range for last N days
   */
  getDateRange(days: number): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    };
  }

  /**
   * Validate package name format
   */
  isValidPackageName(name: string): boolean {
    // npm package naming rules
    const packageNameRegex = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return packageNameRegex.test(name) && name.length <= 214;
  }
}