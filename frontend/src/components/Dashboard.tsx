import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package } from '../types/api';
import { TrendingUp, Package as PackageIcon, Download, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  packages: Package[];
}

export function Dashboard({ packages }: DashboardProps) {
  const stats = useMemo(() => {
    const totalPackages = packages.length;
    const highGrowthPackages = packages.filter(pkg => pkg.is_high_growth).length;
    const totalDownloads = packages.reduce((sum, pkg) => sum + (pkg.last_week_downloads || 0), 0);
    const avgGrowthRate = packages.length > 0
      ? packages.reduce((sum, pkg) => sum + (pkg.weekly_growth_rate || 0), 0) / packages.length
      : 0;

    return {
      totalPackages,
      highGrowthPackages,
      totalDownloads,
      avgGrowthRate
    };
  }, [packages]);

  const topPerformers = useMemo(() => {
    return packages
      .filter(pkg => pkg.growth_score !== null && pkg.growth_score !== undefined)
      .sort((a, b) => (b.growth_score || 0) - (a.growth_score || 0))
      .slice(0, 10)
      .map(pkg => ({
        name: pkg.name.length > 20 ? pkg.name.substring(0, 20) + '...' : pkg.name,
        growth: pkg.growth_score || 0,
        downloads: pkg.last_week_downloads || 0
      }));
  }, [packages]);

  const growthDistribution = useMemo(() => {
    const buckets = {
      'High Growth (>50%)': 0,
      'Moderate Growth (10-50%)': 0,
      'Slow Growth (0-10%)': 0,
      'Declining (<0%)': 0
    };

    packages.forEach(pkg => {
      const rate = pkg.weekly_growth_rate || 0;
      if (rate > 50) buckets['High Growth (>50%)']++;
      else if (rate > 10) buckets['Moderate Growth (10-50%)']++;
      else if (rate >= 0) buckets['Slow Growth (0-10%)']++;
      else buckets['Declining (<0%)']++;
    });

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [packages]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPackages}</p>
            </div>
            <PackageIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Growth</p>
              <p className="text-2xl font-bold text-green-600">{stats.highGrowthPackages}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Downloads</p>
              <p className="text-2xl font-bold text-purple-600">
                {(stats.totalDownloads / 1000000).toFixed(1)}M
              </p>
            </div>
            <Download className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Growth Rate</p>
              <p className={`text-2xl font-bold ${stats.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.avgGrowthRate.toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${stats.avgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Growth Performers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPerformers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'growth' ? `${value}` : `${Number(value).toLocaleString()}`,
                  name === 'growth' ? 'Growth Score' : 'Weekly Downloads'
                ]}
              />
              <Bar dataKey="growth" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={growthDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {growthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Overview</h3>
        {packages.length === 0 ? (
          <div className="text-center py-8">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages tracked</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first npm package to track.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.slice(0, 5).map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{pkg.name}</h4>
                  <p className="text-xs text-gray-500">{pkg.description || 'No description'}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    (pkg.weekly_growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pkg.weekly_growth_rate ? `${pkg.weekly_growth_rate.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pkg.last_week_downloads ? `${(pkg.last_week_downloads / 1000).toFixed(0)}k downloads` : 'No data'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}