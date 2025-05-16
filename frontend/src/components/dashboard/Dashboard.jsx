import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentCycle } from '../../store/slices/cycleSlice';
import { getTodayMedications } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentCycle } = useSelector((state) => state.cycle);
  const { todayMedications } = useSelector((state) => state.medication);
  
  const cycleApi = useApi({
    asyncAction: getCurrentCycle,
    feature: 'cycles',
  });
  
  const medicationApi = useApi({
    asyncAction: getTodayMedications,
    feature: 'medications',
  });

  useEffect(() => {
    // Load current cycle and today's medications
    cycleApi.execute();
    medicationApi.execute();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user?.name || 'User'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your fertility journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cycle Information */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Cycle Information</h2>
            
            {cycleApi.loading ? (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : cycleApi.error ? (
              <div className="mt-4 text-sm text-red-600">
                {cycleApi.error}
              </div>
            ) : currentCycle ? (
              <div className="mt-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Cycle</p>
                    <p className="text-lg font-semibold text-gray-900">
                      Day {currentCycle.currentDay || '?'} of {currentCycle.cycleLength || '?'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Started On</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(currentCycle.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {currentCycle.fertileWindow && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Fertile Window</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {new Date(currentCycle.fertileWindow.start).toLocaleDateString()} - {new Date(currentCycle.fertileWindow.end).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link
                    to="/cycles"
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View all cycles
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-500">No active cycle found.</p>
                <div className="mt-4">
                  <Link
                    to="/cycles/new"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Track New Cycle
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Today's Medications */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Today's Medications</h2>
            
            {medicationApi.loading ? (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : medicationApi.error ? (
              <div className="mt-4 text-sm text-red-600">
                {medicationApi.error}
              </div>
            ) : todayMedications && todayMedications.length > 0 ? (
              <div className="mt-4">
                <ul className="divide-y divide-gray-200">
                  {todayMedications.map((medication) => (
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
                          ) : (
                            <button
                              type="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              onClick={() => {/* Log medication */}}
                            >
                              Log
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6">
                  <Link
                    to="/medications"
                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                  >
                    View all medications
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-500">No medications scheduled for today.</p>
                <div className="mt-4">
                  <Link
                    to="/medications/new"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Add Medication
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Link
                to="/chat"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Chat with Anaira
              </Link>
              <Link
                to="/cycles/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Track New Cycle
              </Link>
              <Link
                to="/medications/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add Medication
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
        
        {/* Partner Information */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Partner Connection</h2>
            
            {user?.partnerId ? (
              <div className="mt-4">
                <p className="text-sm text-gray-500">You are connected with a partner.</p>
                <div className="mt-4">
                  <Link
                    to="/partner"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    View Partner Portal
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-500">You are not connected with a partner yet.</p>
                <div className="mt-4">
                  <Link
                    to="/partner/connect"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Connect with Partner
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
