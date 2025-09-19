import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Package, PackageDetails as PackageDetailsType } from '../types/api';
import { X, ExternalLink, Calendar, TrendingUp, Download, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PackageDetailsProps {
  package: Package;
  onClose: () => void;
}

export function PackageDetails({ package: pkg, onClose }: PackageDetailsProps) {
  const [details, setDetails] = useState<PackageDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchPackageDetails();
  }, [pkg.id, timeRange]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/packages/${pkg.name}?days=${timeRange}`);
      const result = await response.json();

      if (result.success) {
        setDetails(result.data);
      } else {
        console.error('Failed to fetch package details:', result.error);
      }
    } catch (error) {
      console.error('Error fetching package details:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = details?.trends.map(trend => ({
    date: format(parseISO(trend.date), 'MMM dd'),
    downloads: trend.downloads,
    movingAvg: Math.round(trend.moving_avg),
    fullDate: trend.date
  })) || [];

  const stats = {
    totalDownloads: chartData.reduce((sum, day) => sum + day.downloads, 0),
    avgDailyDownloads: chartData.length > 0 ? Math.round(chartData.reduce((sum, day) => sum + day.downloads, 0) / chartData.length) : 0,
    peakDownloads: Math.max(...chartData.map(day => day.downloads), 0),
    growthTrend: chartData.length > 1 ? ((chartData[chartData.length - 1].downloads - chartData[0].downloads) / chartData[0].downloads) * 100 : 0
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{pkg.name}</h2>
            {pkg.description && (
              <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
            )}
          </div>
          {pkg.is_high_growth && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              🔥 High Growth
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={`https://npmjs.com/package/${pkg.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="View on npm"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <div className="flex space-x-2">
            {[7, 14, 30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-gray-600">Loading package details...</div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(stats.totalDownloads)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Average</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(stats.avgDailyDownloads)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Peak Downloads</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(stats.peakDownloads)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-5 w-5 ${stats.growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Period Growth</p>
                  <p className={`text-lg font-bold ${stats.growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.growthTrend.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Trend Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatNumber(value as number),
                      name === 'downloads' ? 'Downloads' : '7-day Average'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return format(parseISO(payload[0].payload.fullDate), 'MMM dd, yyyy');
                      }
                      return label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Package Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Package Information</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Latest Version:</dt>
                  <dd className="text-sm text-gray-900">{pkg.latest_version || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Tracked Since:</dt>
                  <dd className="text-sm text-gray-900">
                    {format(parseISO(pkg.tracked_since), 'MMM dd, yyyy')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Days Tracked:</dt>
                  <dd className="text-sm text-gray-900">{pkg.days_tracked}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Growth Metrics</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Growth Score:</dt>
                  <dd className="text-sm text-gray-900">
                    {pkg.growth_score ? pkg.growth_score.toFixed(2) : 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Weekly Growth Rate:</dt>
                  <dd className={`text-sm ${(pkg.weekly_growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pkg.weekly_growth_rate ? `${pkg.weekly_growth_rate.toFixed(1)}%` : 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Trend Direction:</dt>
                  <dd className="text-sm text-gray-900">
                    {pkg.trend_direction || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}