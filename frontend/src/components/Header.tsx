import { Plus, BarChart3, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onAddPackage: () => void;
}

export function Header({ onAddPackage }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">NPM Dashboard</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Package Growth Tracker</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onAddPackage}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}