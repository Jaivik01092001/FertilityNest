import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCycle } from '../../store/slices/cycleSlice';
import useApi from '../../hooks/useApi';

const CreateCycle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    cycleLength: '',
    periodLength: '',
  });
  
  const { execute, loading, error } = useApi({
    asyncAction: createCycle,
    feature: 'cycles',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert string values to appropriate types
    const cycleData = {
      ...formData,
      cycleLength: formData.cycleLength ? parseInt(formData.cycleLength) : undefined,
      periodLength: formData.periodLength ? parseInt(formData.periodLength) : undefined,
    };
    
    const result = await execute(cycleData);
    
    if (result.success) {
      navigate('/cycles');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Track New Cycle
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Enter the details of your new cycle
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave blank if your period is still ongoing
              </p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="cycleLength" className="block text-sm font-medium text-gray-700">
                Cycle Length (days)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="cycleLength"
                  id="cycleLength"
                  min="20"
                  max="45"
                  value={formData.cycleLength}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Typical cycle length is between 21-35 days
              </p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="periodLength" className="block text-sm font-medium text-gray-700">
                Period Length (days)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="periodLength"
                  id="periodLength"
                  min="1"
                  max="10"
                  value={formData.periodLength}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Typical period length is between 3-7 days
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/cycles')}
              className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCycle;
