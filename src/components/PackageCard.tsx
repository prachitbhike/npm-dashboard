import { TrendingUp, TrendingDown, Activity, Zap, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { GrowthMetrics } from '@/utils/growthCalculations'

interface PackageCardProps {
  metrics: GrowthMetrics
}

export function PackageCard({ metrics }: PackageCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'exponential':
        return <Zap className="h-4 w-4" />
      case 'accelerating':
        return <Activity className="h-4 w-4" />
      case 'growing':
        return <TrendingUp className="h-4 w-4" />
      case 'declining':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }

  const getTrendBadgeVariant = () => {
    switch (metrics.trend) {
      case 'exponential':
        return 'success' as const
      case 'accelerating':
        return 'success' as const
      case 'growing':
        return 'default' as const
      case 'declining':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  const getTrendColor = () => {
    if (metrics.growthRate > 0) return 'text-green-600'
    if (metrics.growthRate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{metrics.packageName}</CardTitle>
            <CardDescription className="mt-2">
              {formatNumber(metrics.currentDownloads)} downloads
            </CardDescription>
          </div>
          <Badge variant={getTrendBadgeVariant()} className="flex items-center gap-1">
            {getTrendIcon()}
            {metrics.trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Growth Rate</span>
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {metrics.growthRate > 0 ? '+' : ''}
              {metrics.growthRate.toFixed(1)}%
            </span>
          </div>

          {metrics.isExponential && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Exponential Growth Detected
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Acceleration
              {metrics.dataPoints < 3 && (
                <span className="text-xs ml-1">(need {3 - metrics.dataPoints} more)</span>
              )}
            </span>
            {metrics.acceleration === null ? (
              <span className="text-xs text-muted-foreground italic">Insufficient data</span>
            ) : (
              <span className={`text-sm font-semibold ${metrics.acceleration > 0 ? 'text-green-600' : metrics.acceleration < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {metrics.acceleration > 0 ? '+' : ''}
                {metrics.acceleration.toFixed(1)}%
              </span>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Previous Period</span>
              <span>{formatNumber(metrics.previousDownloads)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
