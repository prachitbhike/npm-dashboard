import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { PackageList } from './components/PackageList';
import { AddPackageDialog } from './components/AddPackageDialog';
import { PackageDetails } from './components/PackageDetails';
import { Package } from './types/api';

function App() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/packages');
      const result = await response.json();

      if (result.success) {
        setPackages(result.data);
      } else {
        console.error('Failed to fetch packages:', result.error);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleAddPackage = async (packageName: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: packageName }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchPackages(); // Refresh the list
        setIsAddDialogOpen(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error adding package:', error);
      return { success: false, error: 'Failed to add package' };
    }
  };

  const handleRemovePackage = async (packageId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/packages/${packageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchPackages(); // Refresh the list
        if (selectedPackage?.id === packageId) {
          setSelectedPackage(null);
        }
      } else {
        console.error('Failed to remove package:', result.error);
      }
    } catch (error) {
      console.error('Error removing package:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddPackage={() => setIsAddDialogOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading packages...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Overview */}
            <div className="lg:col-span-2">
              <Dashboard packages={packages} />
            </div>

            {/* Package List Sidebar */}
            <div className="lg:col-span-1">
              <PackageList
                packages={packages}
                selectedPackage={selectedPackage}
                onSelectPackage={setSelectedPackage}
                onRemovePackage={handleRemovePackage}
              />
            </div>

            {/* Package Details (Full Width when selected) */}
            {selectedPackage && (
              <div className="lg:col-span-3">
                <PackageDetails
                  package={selectedPackage}
                  onClose={() => setSelectedPackage(null)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <AddPackageDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddPackage={handleAddPackage}
      />
    </div>
  );
}

export default App;