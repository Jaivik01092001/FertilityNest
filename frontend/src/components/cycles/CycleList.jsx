import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCycles } from '../../store/slices/cycleSlice';
import useApi from '../../hooks/useApi';

const CycleList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { cycles, totalCycles } = useSelector((state) => state.cycle);
  const { execute, loading, error } = useApi({
    asyncAction: getCycles,
    feature: 'cycles',
  });

  useEffect(() => {
    loadCycles();
  }, [page, limit]);

  const loadCycles = async () => {
    await execute({ page, limit });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return <div className="text-center py-4">Loading cycles...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cycles found.</p>
        <button
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={() => {/* Navigate to create cycle page */}}
        >
          Track New Cycle
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Your Cycles
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Track and manage your menstrual and fertility cycles
        </p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {cycles.map((cycle) => (
          <li key={cycle._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  {new Date(cycle.startDate).toLocaleDateString()} - 
                  {cycle.endDate 
                    ? new Date(cycle.endDate).toLocaleDateString()
                    : 'Ongoing'}
                </p>
                <p className="text-sm text-gray-500">
                  {cycle.cycleLength ? `${cycle.cycleLength} days` : 'Length not set'}
                </p>
              </div>
              <div>
                <button
                  className="text-purple-600 hover:text-purple-800"
                  onClick={() => {/* Navigate to cycle details */}}
                >
                  View Details
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {/* Pagination */}
      {totalCycles > limit && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
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
              disabled={page * limit >= totalCycles}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page * limit >= totalCycles
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

export default CycleList;
