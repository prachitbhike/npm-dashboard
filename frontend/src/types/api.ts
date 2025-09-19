export interface Package {
  id: number;
  name: string;
  description?: string;
  latest_version?: string;
  tracked_since: string;
  last_week_downloads?: number;
  weekly_growth_rate?: number;
  growth_score?: number;
  trend_direction?: string;
  is_high_growth?: boolean;
  days_tracked: number;
}

export interface PackageDownload {
  id: number;
  package_id: number;
  date: string;
  downloads: number;
  created_at: string;
}

export interface TrendingPackage {
  name: string;
  description?: string;
  avg_growth_score: number;
  avg_weekly_growth: number;
  high_growth_days: number;
  peak_weekly_downloads: number;
}

export interface PackageDetails {
  package: Package;
  trends: Array<{
    date: string;
    downloads: number;
    moving_avg: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchResult {
  package: {
    name: string;
    description?: string;
    version: string;
    author?: {
      name: string;
    };
    keywords?: string[];
    links?: {
      npm?: string;
      homepage?: string;
      repository?: string;
    };
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
}