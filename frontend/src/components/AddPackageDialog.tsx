import { useState } from 'react';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import { SearchResult } from '../types/api';

interface AddPackageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPackage: (packageName: string) => Promise<{ success: boolean; error?: string }>;
}

export function AddPackageDialog({ isOpen, onClose, onAddPackage }: AddPackageDialogProps) {
  const [packageName, setPackageName] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const result = await response.json();

      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search packages');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPackage = async (name: string) => {
    setIsAdding(true);
    setError('');

    try {
      const result = await onAddPackage(name);

      if (result.success) {
        onClose();
        setPackageName('');
        setSearchResults([]);
        setSearchQuery('');
      } else {
        setError(result.error || 'Failed to add package');
      }
    } catch (err) {
      console.error('Add package error:', err);
      setError('Failed to add package');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDirectAdd = async () => {
    if (!packageName.trim()) {
      setError('Please enter a package name');
      return;
    }

    await handleAddPackage(packageName.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Package to Track</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Direct Add */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleDirectAdd)}
                placeholder="e.g. react, lodash, @babel/core"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleDirectAdd}
                disabled={isAdding || !packageName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Search for Packages
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSearch)}
                placeholder="Search npm packages..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {result.package.name}
                        </h4>
                        {result.package.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.package.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>v{result.package.version}</span>
                          {result.package.author && (
                            <span>by {result.package.author.name}</span>
                          )}
                          <span>Score: {result.score.final.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddPackage(result.package.name)}
                        disabled={isAdding}
                        className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}