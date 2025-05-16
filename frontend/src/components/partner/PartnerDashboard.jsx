import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getPartnerInfo, getPartnerCycles, getPartnerMedications } from '../../store/slices/partnerSlice';
import useApi from '../../hooks/useApi';

const PartnerDashboard = () => {
  const { partnerInfo, partnerCycles, partnerMedications } = useSelector((state) => state.partner);
  
  const { execute: fetchInfo, loading: loadingInfo, error: infoError } = useApi({
    asyncAction: getPartnerInfo,
    feature: 'partner',
  });
  
  const { execute: fetchCycles, loading: loadingCycles, error: cyclesError } = useApi({
    asyncAction: getPartnerCycles,
    feature: 'partner',
  });
  
  const { execute: fetchMedications, loading: loadingMedications, error: medicationsError } = useApi({
    asyncAction: getPartnerMedications,
    feature: 'partner',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchInfo();
    await fetchCycles();
    await fetchMedications();
  };

  if (loadingInfo && !partnerInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (infoError && !partnerInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{infoError}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!partnerInfo) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Partner Connection
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Connect with your partner to share your fertility journey
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6 text-center">
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No partner connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't connected with a partner yet.
          </p>
          <div className="mt-6">
            <Link
              to="/partner/connect"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Connect with Partner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Partner Dashboard
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Connected with {partnerInfo.name}
        </p>
      </div>
      
      {(infoError || cyclesError || medicationsError) && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {infoError || cyclesError || medicationsError}
        </div>
      )}
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Partner Information */}
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-gray-900">Partner Information</h4>
              
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{partnerInfo.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{partnerInfo.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Fertility Stage</dt>
                  <dd className="mt-1 text-sm text-gray-900">{partnerInfo.fertilityStage || 'Not specified'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Journey Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{partnerInfo.journeyType || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Cycle Information */}
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-gray-900">Current Cycle</h4>
              
              {loadingCycles ? (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : partnerCycles && partnerCycles.length > 0 ? (
                <div className="mt-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Cycle</p>
                      <p className="text-lg font-semibold text-gray-900">
                        Day {partnerCycles[0].currentDay || '?'} of {partnerCycles[0].cycleLength || '?'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Started On</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(partnerCycles[0].startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {partnerCycles[0].fertileWindow && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Fertile Window</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {new Date(partnerCycles[0].fertileWindow.start).toLocaleDateString()} - {new Date(partnerCycles[0].fertileWindow.end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link
                      to="/partner/cycles"
                      className="text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                      View all cycles
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">No active cycle found.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Today's Medications */}
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-gray-900">Today's Medications</h4>
              
              {loadingMedications ? (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : partnerMedications && partnerMedications.length > 0 ? (
                <div className="mt-4">
                  <ul className="divide-y divide-gray-200">
                    {partnerMedications.map((medication) => (
                      <li key={medication._id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                            <p className="text-sm text-gray-500">
                              {medication.dosage} {medication.unit} - {medication.frequency}
                            </p>
                          </div>
                          <div>
                            {medication.logs && medication.logs.some(log => 
                              new Date(log.date).toDateString() === new Date().toDateString() && log.taken
                            ) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Taken
                              </span>
                            ) : medication.logs && medication.logs.some(log => 
                              new Date(log.date).toDateString() === new Date().toDateString() && !log.taken
                            ) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Skipped
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6">
                    <Link
                      to="/partner/medications"
                      className="text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                      View all medications
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">No medications scheduled for today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
