import pool from '../config/database.js';
import { Package, PackageDownload, PackageSummary, NpmRegistryResponse } from '../types/database.js';

export class PackageService {
  /**
   * Add a new package to track
   */
  async addPackage(packageInfo: NpmRegistryResponse): Promise<Package | null> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO packages (
          name, description, homepage, repository_url, latest_version,
          license, keywords, maintainers
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          homepage = EXCLUDED.homepage,
          repository_url = EXCLUDED.repository_url,
          latest_version = EXCLUDED.latest_version,
          license = EXCLUDED.license,
          keywords = EXCLUDED.keywords,
          maintainers = EXCLUDED.maintainers,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;

      const repositoryUrl = packageInfo.repository?.url
        ? packageInfo.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
        : null;

      const values = [
        packageInfo.name,
        packageInfo.description,
        packageInfo.homepage,
        repositoryUrl,
        packageInfo['dist-tags']?.latest,
        packageInfo.license,
        packageInfo.keywords || [],
        JSON.stringify(packageInfo.maintainers || [])
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding package:', error);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Get all tracked packages
   */
  async getAllPackages(): Promise<Package[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM packages WHERE is_active = true ORDER BY name';
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching packages:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * Get package by name
   */
  async getPackageByName(name: string): Promise<Package | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM packages WHERE name = $1 AND is_active = true';
      const result = await client.query(query, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching package by name:', error);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Remove package from tracking
   */
  async removePackage(packageId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const query = 'UPDATE packages SET is_active = false WHERE id = $1';
      const result = await client.query(query, [packageId]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error removing package:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Store daily download data
   */
  async storeDailyDownloads(packageId: number, downloads: Array<{ day: string; downloads: number }>): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const download of downloads) {
        const query = `
          INSERT INTO package_downloads (package_id, date, downloads)
          VALUES ($1, $2, $3)
          ON CONFLICT (package_id, date) DO UPDATE SET
            downloads = EXCLUDED.downloads
        `;
        await client.query(query, [packageId, download.day, download.downloads]);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error storing daily downloads:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Get download data for a package within date range
   */
  async getDownloadData(
    packageId: number,
    startDate: string,
    endDate: string
  ): Promise<PackageDownload[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM package_downloads
        WHERE package_id = $1 AND date >= $2 AND date <= $3
        ORDER BY date ASC
      `;
      const result = await client.query(query, [packageId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching download data:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * Get package summary with latest statistics
   */
  async getPackageSummaries(): Promise<PackageSummary[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM package_summary ORDER BY growth_score DESC NULLS LAST';
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching package summaries:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * Get trending packages
   */
  async getTrendingPackages(limit: number = 20): Promise<any[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM trending_packages LIMIT $1';
      const result = await client.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching trending packages:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * Calculate and store weekly statistics
   */
  async calculateWeeklyStats(packageId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const query = `
        WITH weekly_data AS (
          SELECT
            date_trunc('week', date) as week_start,
            SUM(downloads) as total_downloads,
            AVG(downloads) as avg_daily_downloads
          FROM package_downloads
          WHERE package_id = $1
          GROUP BY date_trunc('week', date)
          ORDER BY week_start
        ),
        weekly_with_growth AS (
          SELECT
            *,
            CASE
              WHEN LAG(total_downloads) OVER (ORDER BY week_start) IS NOT NULL
              THEN (total_downloads - LAG(total_downloads) OVER (ORDER BY week_start))::DECIMAL /
                   LAG(total_downloads) OVER (ORDER BY week_start) * 100
              ELSE NULL
            END as growth_rate
          FROM weekly_data
        )
        INSERT INTO package_weekly_stats (package_id, week_start, total_downloads, avg_daily_downloads, growth_rate)
        SELECT $1, week_start, total_downloads, avg_daily_downloads, growth_rate
        FROM weekly_with_growth
        ON CONFLICT (package_id, week_start) DO UPDATE SET
          total_downloads = EXCLUDED.total_downloads,
          avg_daily_downloads = EXCLUDED.avg_daily_downloads,
          growth_rate = EXCLUDED.growth_rate
      `;

      await client.query(query, [packageId]);
      return true;
    } catch (error) {
      console.error('Error calculating weekly stats:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Get recent download trends for dashboard
   */
  async getRecentTrends(packageId: number, days: number = 30): Promise<any[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT
          date,
          downloads,
          AVG(downloads) OVER (
            ORDER BY date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ) as moving_avg
        FROM package_downloads
        WHERE package_id = $1
          AND date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date ASC
      `;
      const result = await client.query(query, [packageId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent trends:', error);
      return [];
    } finally {
      client.release();
    }
  }
}