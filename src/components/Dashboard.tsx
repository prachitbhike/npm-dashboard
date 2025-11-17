import { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, Package, AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { PackageCard } from './PackageCard'
import { GrowthChart } from './GrowthChart'
import { supabase, PackageDownloads } from '@/lib/supabase'
import { calculateGrowthMetrics, getTopGrowing, GrowthMetrics } from '@/utils/growthCalculations'
import { fetchTopPackages, updatePackageData } from '@/services/npmService'

type TimePeriod = 'month' | '3months' | '6months' | 'year'

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [packageDownloads, setPackageDownloads] = useState<PackageDownloads[]>([])
  const [error, setError] = useState<string | null>(null)

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: 'month', label: '1 Month' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: 'year', label: '1 Year' },
  ]

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('package_downloads')
        .select('*')
        .order('date', { ascending: false })
        .limit(1000)

      if (fetchError) throw fetchError

      if (!data || data.length === 0) {
        setError('No data available. Please update the data first.')
        setGrowthMetrics([])
        return
      }

      // Group by package name
      const packageMap = new Map<string, PackageDownloads[]>()
      data.forEach((item) => {
        if (!packageMap.has(item.package_name)) {
          packageMap.set(item.package_name, [])
        }
        packageMap.get(item.package_name)!.push(item)
      })

      // Calculate metrics for each package
      const metrics: GrowthMetrics[] = []
      packageMap.forEach((downloads, packageName) => {
        const metric = calculateGrowthMetrics(packageName, downloads)
        metrics.push(metric)
      })

      const topGrowing = getTopGrowing(metrics, 50)
      setGrowthMetrics(topGrowing)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateData = async () => {
    setUpdating(true)
    setError(null)

    try {
      const packages = await fetchTopPackages(20) // Update top 20 packages
      let successCount = 0

      for (const packageName of packages) {
        const success = await updatePackageData(packageName)
        if (success) successCount++

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      console.log(`Successfully updated ${successCount}/${packages.length} packages`)
      await fetchData()
    } catch (err) {
      console.error('Error updating data:', err)
      setError('Failed to update data. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handlePackageClick = async (packageName: string) => {
    setSelectedPackage(packageName)

    const { data, error: fetchError } = await supabase
      .from('package_downloads')
      .select('*')
      .eq('package_name', packageName)
      .order('date', { ascending: true })

    if (fetchError) {
      console.error('Error fetching package downloads:', fetchError)
      return
    }

    setPackageDownloads(data || [])
  }

  useEffect(() => {
    fetchData()
  }, [timePeriod])

  const exponentialPackages = growthMetrics.filter(m => m.isExponential)
  const acceleratingPackages = growthMetrics.filter(m => m.trend === 'accelerating')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                NPM Growth Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track the fastest growing npm packages
              </p>
            </div>
            <Button
              onClick={handleUpdateData}
              disabled={updating}
              size="lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Updating...' : 'Update Data'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Period Filter */}
        <div className="flex gap-2 mb-8">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              variant={timePeriod === period.value ? 'default' : 'outline'}
              onClick={() => setTimePeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Total Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{growthMetrics.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Exponential Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {exponentialPackages.length}
              </p>
              <CardDescription className="mt-1">
                Growing exponentially
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Accelerating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {acceleratingPackages.length}
              </p>
              <CardDescription className="mt-1">
                Acceleration detected
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Selected Package Chart */}
        {selectedPackage && packageDownloads.length > 0 && (
          <div className="mb-8">
            <GrowthChart data={packageDownloads} packageName={selectedPackage} />
          </div>
        )}

        {/* Package Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {growthMetrics.map((metric) => (
              <div
                key={metric.packageName}
                onClick={() => handlePackageClick(metric.packageName)}
                className="cursor-pointer"
              >
                <PackageCard metrics={metric} />
              </div>
            ))}
          </div>
        )}

        {!loading && growthMetrics.length === 0 && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No data available. Click "Update Data" to fetch the latest package statistics.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
