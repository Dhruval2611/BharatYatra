import React, { useEffect, useState, useCallback } from 'react';
import { fetchPackages, deletePackage } from '../../services/api';
import { TravelPackage } from '../../types';
import EditPackageModal from '../../components/EditPackageModal';

const ManagePackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPackages = await fetchPackages();
      setPackages(fetchedPackages);
    } catch (error) {
      console.error("Failed to fetch packages", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();

    const handleStorageChange = () => {
      loadPackages();
    };

    window.addEventListener('storageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, [loadPackages]);

  const handleDelete = async (packageId: string) => {
    if (window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      await deletePackage(packageId);
      // The event listener will automatically call loadPackages to refresh the list.
    }
  };

  const handleEdit = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedPackage(null);
  };

  const handleSavePackage = () => {
    // The event listener will handle reloading packages.
    // This function's only job is to close the modal.
    handleCloseModal();
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Manage Packages</h1>
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-700 text-xs uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3 text-center">Edit</th>
                  <th scope="col" className="px-6 py-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        <span className="ml-4">Loading packages...</span>
                      </div>
                    </td>
                  </tr>
                ) : packages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">No packages found.</td>
                  </tr>
                ) : (
                  packages.map(pkg => (
                    <tr key={pkg.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{pkg.title}</td>
                      <td className="px-6 py-4">₹{pkg.price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
                          aria-label={`Edit package ${pkg.title}`}
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="font-medium text-red-500 hover:text-red-400 transition-colors"
                          aria-label={`Delete package ${pkg.title}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isEditModalOpen && selectedPackage && (
        <EditPackageModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePackage}
          pkg={selectedPackage}
        />
      )}
    </>
  );
};

export default ManagePackagesPage;