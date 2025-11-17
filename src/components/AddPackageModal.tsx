import { useState } from 'react'
import { X, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { addPackage, isValidPackageName } from '@/services/packageService'

interface AddPackageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPackageModal({ isOpen, onClose, onSuccess }: AddPackageModalProps) {
  const [packageName, setPackageName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = packageName.trim()

    // Validate package name format
    if (!isValidPackageName(trimmedName)) {
      setResult({
        type: 'error',
        message: 'Invalid package name format. Use lowercase letters, numbers, hyphens, and optionally @scope/',
      })
      return
    }

    setLoading(true)
    setResult({ type: null, message: '' })

    try {
      const response = await addPackage(trimmedName)

      if (response.success) {
        setResult({
          type: 'success',
          message: response.message,
        })
        setPackageName('')

        // Refresh dashboard after 2 seconds
        setTimeout(() => {
          onSuccess()
          onClose()
          setResult({ type: null, message: '' })
        }, 2000)
      } else {
        setResult({
          type: 'error',
          message: response.message,
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Package
              </CardTitle>
              <CardDescription className="mt-2">
                Track a new NPM package on your dashboard
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="package-name"
                className="block text-sm font-medium mb-2"
              >
                Package Name
              </label>
              <input
                id="package-name"
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g., react, @supabase/supabase-js"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the exact package name from npmjs.com
              </p>
            </div>

            {result.type && (
              <div
                className={`flex items-start gap-2 p-3 rounded-md ${
                  result.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {result.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{result.message}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !packageName.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </>
                )}
              </Button>
            </div>

            {loading && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">This may take a minute...</p>
                <p className="text-xs mt-1">
                  Fetching up to 52 weeks of historical data from NPM
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
