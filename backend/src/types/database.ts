export interface Package {
  id: number;
  name: string;
  description?: string;
  homepage?: string;
  repository_url?: string;
  latest_version?: string;
  license?: string;
  keywords?: string[];
  maintainers?: any;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface PackageDownload {
  id: number;
  package_id: number;
  date: Date;
  downloads: number;
  created_at: Date;
}

export interface PackageWeeklyStats {
  id: number;
  package_id: number;
  week_start: Date;
  total_downloads: number;
  avg_daily_downloads: number;
  growth_rate?: number;
  velocity?: number;
  created_at: Date;
}

export interface PackageGrowthAnalysis {
  id: number;
  package_id: number;
  analysis_date: Date;
  growth_score?: number;
  acceleration?: number;
  trend_direction?: 'accelerating' | 'decelerating' | 'stable';
  is_high_growth: boolean;
  weekly_growth_rate?: number;
  monthly_growth_rate?: number;
  volatility?: number;
  created_at: Date;
}

export interface GrowthAlert {
  id: number;
  package_id: number;
  alert_type: 'high_growth' | 'acceleration' | 'new_trend';
  severity: 'low' | 'medium' | 'high';
  message: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
}

export interface PackageSummary {
  id: number;
  name: string;
  description?: string;
  latest_version?: string;
  tracked_since: Date;
  last_week_downloads?: number;
  weekly_growth_rate?: number;
  growth_score?: number;
  trend_direction?: string;
  is_high_growth?: boolean;
  days_tracked: number;
}

export interface TrendingPackage {
  name: string;
  description?: string;
  avg_growth_score: number;
  avg_weekly_growth: number;
  high_growth_days: number;
  peak_weekly_downloads: number;
}

// API Response types
export interface NpmRegistryResponse {
  name: string;
  description?: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  'dist-tags': {
    latest: string;
  };
  license?: string;
  keywords?: string[];
  maintainers?: Array<{
    name: string;
    email: string;
  }>;
}

export interface NpmDownloadsResponse {
  start: string;
  end: string;
  package: string;
  downloads: Array<{
    downloads: number;
    day: string;
  }>;
}

// Analysis types
export interface GrowthMetrics {
  package_name: string;
  growth_rate: number;
  acceleration: number;
  volatility: number;
  trend_direction: 'accelerating' | 'decelerating' | 'stable';
  growth_score: number;
  is_high_growth: boolean;
}