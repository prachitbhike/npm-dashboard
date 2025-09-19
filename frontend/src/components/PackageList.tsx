import { Package } from '../types/api';
import { TrendingUp, TrendingDown, Minus, Trash2, ExternalLink } from 'lucide-react';

interface PackageListProps {
  packages: Package[];
  selectedPackage: Package | null;
  onSelectPackage: (pkg: Package) => void;
  onRemovePackage: (packageId: number) => void;
}

export function PackageList({ packages, selectedPackage, onSelectPackage, onRemovePackage }: PackageListProps) {
  const sortedPackages = [...packages].sort((a, b) => {
    // Sort by growth score, then by downloads
    const scoreA = a.growth_score || 0;
    const scoreB = b.growth_score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;

    const downloadsA = a.last_week_downloads || 0;
    const downloadsB = b.last_week_downloads || 0;
    return downloadsB - downloadsA;
  });

  const getTrendIcon = (growthRate?: number) => {
    if (!growthRate) return <Minus className="h-4 w-4 text-gray-400" />;
    if (growthRate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growthRate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (growthRate?: number) => {
    if (!growthRate) return 'text-gray-500';
    if (growthRate > 10) return 'text-green-600';
    if (growthRate > 0) return 'text-green-500';
    if (growthRate < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Tracked Packages ({packages.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {sortedPackages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No packages tracked yet.</p>
            <p className="text-sm text-gray-400 mt-1">Add packages to start monitoring their growth.</p>
          </div>
        ) : (
          sortedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedPackage?.id === pkg.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
              onClick={() => onSelectPackage(pkg)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {pkg.name}
                    </h3>
                    {pkg.is_high_growth && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Hot
                      </span>
                    )}
                  </div>

                  {pkg.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {pkg.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(pkg.weekly_growth_rate)}
                        <span className={getTrendColor(pkg.weekly_growth_rate)}>
                          {pkg.weekly_growth_rate ? `${pkg.weekly_growth_rate.toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>

                      <div className="text-gray-500">
                        {formatNumber(pkg.last_week_downloads)} downloads
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://npmjs.com/package/${pkg.name}`, '_blank');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View on npm"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to remove ${pkg.name} from tracking?`)) {
                            onRemovePackage(pkg.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove package"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {pkg.growth_score !== null && pkg.growth_score !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Growth Score</span>
                        <span className="text-gray-900 font-medium">
                          {pkg.growth_score.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, pkg.growth_score * 20))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}