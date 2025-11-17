import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { PackageDownloads } from '@/lib/supabase'
import { format } from 'date-fns'

interface GrowthChartProps {
  data: PackageDownloads[]
  packageName: string
}

export function GrowthChart({ data, packageName }: GrowthChartProps) {
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({
      date: format(new Date(d.date), 'MMM dd'),
      downloads: d.downloads,
    }))

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {packageName} - Download Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatNumber}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Downloads']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="downloads"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
