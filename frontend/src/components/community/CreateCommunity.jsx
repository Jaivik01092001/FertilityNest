import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCommunity } from '../../store/slices/communitySlice';
import useApi from '../../hooks/useApi';

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General Support',
    rules: '',
    isPrivate: false,
    requireApproval: false
  });
  
  const { execute, loading, error } = useApi({
    asyncAction: createCommunity,
    feature: 'community',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.name.length < 3) {
      toast.error('Community name must be at least 3 characters');
      return;
    }
    
    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    
    const result = await execute(formData);
    
    if (result.success) {
      toast.success('Community created successfully');
      navigate(`/community/${result.data.community._id}`);
    } else {
      toast.error('Failed to create community');
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create a New Community
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Start a supportive space for people on similar fertility journeys
        </p>
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Community Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="E.g., IVF Warriors"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="IVF">IVF</option>
                  <option value="IUI">IUI</option>
                  <option value="PCOS">PCOS</option>
                  <option value="Endometriosis">Endometriosis</option>
                  <option value="Pregnancy">Pregnancy</option>
                  <option value="LGBTQ+">LGBTQ+</option>
                  <option value="Single Parents">Single Parents</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe what this community is about and who it's for..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Brief description for your community. This will be displayed on the community list.
              </p>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700">
                Community Rules
              </label>
              <div className="mt-1">
                <textarea
                  id="rules"
                  name="rules"
                  rows="4"
                  value={formData.rules}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="List any specific rules or guidelines for your community..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Optional. Set clear expectations for community members.
              </p>
            </div>
            
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isPrivate"
                    name="isPrivate"
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isPrivate" className="font-medium text-gray-700">
                    Private Community
                  </label>
                  <p className="text-gray-500">
                    If enabled, this community will not be visible in public listings and can only be joined via invitation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="requireApproval"
                    name="requireApproval"
                    type="checkbox"
                    checked={formData.requireApproval}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="requireApproval" className="font-medium text-gray-700">
                    Require Approval
                  </label>
                  <p className="text-gray-500">
                    If enabled, new members will need to be approved by a moderator before joining.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunity;
