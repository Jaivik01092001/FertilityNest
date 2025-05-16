import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getMedications } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';

const MedicationList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState('true');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const { medications, totalMedications } = useSelector((state) => state.medication);
  const { execute, loading, error } = useApi({
    asyncAction: getMedications,
    feature: 'medications',
  });

  useEffect(() => {
    loadMedications();
  }, [page, limit, activeFilter, categoryFilter]);

  const loadMedications = async () => {
    await execute({ 
      page, 
      limit, 
      active: activeFilter === 'all' ? undefined : activeFilter,
      category: categoryFilter || undefined
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'active') {
      setActiveFilter(value);
    } else if (name === 'category') {
      setCategoryFilter(value);
    }
    setPage(1); // Reset to first page when filters change
  };

  if (loading) {
    return <div className="text-center py-4">Loading medications...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Your Medications
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Track and manage your medications and supplements
        </p>
      </div>
      
      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex space-x-4">
            <div>
              <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="active"
                name="active"
                value={activeFilter}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={categoryFilter}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                <option value="fertility">Fertility</option>
                <option value="hormone">Hormone</option>
                <option value="vitamin">Vitamin</option>
                <option value="supplement">Supplement</option>
                <option value="pain relief">Pain Relief</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => {/* Navigate to add medication page */}}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Add Medication
            </button>
          </div>
        </div>
      </div>
      
      {medications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No medications found.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {medications.map((medication) => (
            <li key={medication._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    {medication.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {medication.dosage} {medication.unit} - {medication.frequency}
                  </p>
                  <div className="mt-1 flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      medication.category === 'fertility' ? 'bg-pink-100 text-pink-800' :
                      medication.category === 'hormone' ? 'bg-purple-100 text-purple-800' :
                      medication.category === 'vitamin' ? 'bg-green-100 text-green-800' :
                      medication.category === 'supplement' ? 'bg-blue-100 text-blue-800' :
                      medication.category === 'pain relief' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {medication.category}
                    </span>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      medication.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {medication.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-purple-600 hover:text-purple-800"
                    onClick={() => {/* Navigate to medication details */}}
                  >
                    View
                  </button>
                  <button
                    className="text-purple-600 hover:text-purple-800"
                    onClick={() => {/* Navigate to edit medication */}}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* Pagination */}
      {totalMedications > limit && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page * limit >= totalMedications}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page * limit >= totalMedications
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationList;
