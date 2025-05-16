import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getCommunities, joinCommunity } from '../../store/slices/communitySlice';
import useApi from '../../hooks/useApi';

const CommunityList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const { communities, userCommunities, totalCommunities } = useSelector((state) => state.community);
  const { execute: fetchCommunities, loading: loadingCommunities, error: communitiesError } = useApi({
    asyncAction: getCommunities,
    feature: 'community',
  });
  
  const { execute: join, loading: joiningCommunity, error: joinError } = useApi({
    asyncAction: joinCommunity,
    feature: 'community',
  });

  useEffect(() => {
    loadCommunities();
  }, [page, limit, categoryFilter]);

  const loadCommunities = async () => {
    await fetchCommunities({ 
      page, 
      limit, 
      category: categoryFilter || undefined
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  const handleJoinCommunity = async (communityId) => {
    const result = await join(communityId);
    
    if (result.success) {
      toast.success('Successfully joined community');
    } else {
      toast.error('Failed to join community');
    }
  };
  
  const isUserInCommunity = (communityId) => {
    return userCommunities.some(community => community._id === communityId);
  };

  if (loadingCommunities && communities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (communitiesError && communities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{communitiesError}</p>
        <button
          onClick={loadCommunities}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Community Circles
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Connect with others on similar fertility journeys
          </p>
        </div>
        <Link
          to="/community/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Create Community
        </Link>
      </div>
      
      {joinError && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {joinError}
        </div>
      )}
      
      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex space-x-4">
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
          <div className="mt-4 sm:mt-0">
            <Link
              to="/community/my-communities"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              My Communities
            </Link>
          </div>
        </div>
      </div>
      
      {communities.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No communities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {categoryFilter 
              ? `No communities found in the ${categoryFilter} category.` 
              : 'Get started by creating a new community.'}
          </p>
          <div className="mt-6">
            <Link
              to="/community/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create Community
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {communities.map((community) => (
            <li key={community._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    to={`/community/${community._id}`}
                    className="text-lg font-medium text-purple-600 hover:text-purple-900"
                  >
                    {community.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {community.description}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800`}>
                      {community.category}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {community.memberCount || 0} members
                    </span>
                  </div>
                </div>
                <div>
                  {isUserInCommunity(community._id) ? (
                    <Link
                      to={`/community/${community._id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      View
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleJoinCommunity(community._id)}
                      disabled={joiningCommunity}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                    >
                      {joiningCommunity ? 'Joining...' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* Pagination */}
      {totalCommunities > limit && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page * limit >= totalCommunities}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page * limit >= totalCommunities
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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

export default CommunityList;
