import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMedication, logMedication, deleteMedication } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';

const MedicationDetail = () => {
  const { medicationId } = useParams();
  const navigate = useNavigate();
  const [medication, setMedication] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [logNote, setLogNote] = useState('');

  const { execute: fetchMedication, loading: loadingMedication, error: medicationError } = useApi({
    asyncAction: getMedication,
    feature: 'medications',
  });

  const { execute: logMed, loading: loggingMedication, error: logError } = useApi({
    asyncAction: logMedication,
    feature: 'medications',
  });

  const { execute: deleteMed, loading: deletingMedication, error: deleteError } = useApi({
    asyncAction: deleteMedication,
    feature: 'medications',
  });

  useEffect(() => {
    if (medicationId) {
      loadMedication();
    }
  }, [medicationId]);

  const loadMedication = async () => {
    const result = await fetchMedication(medicationId);

    if (result.success && result.data.medication) {
      setMedication(result.data.medication);
    }
  };

  const handleLogMedication = async (taken) => {
    const result = await logMed({
      id: medicationId,
      logData: {
        taken,
        note: logNote,
        date: new Date().toISOString()
      }
    });

    if (result.success) {
      toast.success(taken ? 'Medication logged as taken' : 'Medication logged as skipped');
      setLogNote('');

      // Update medication state with new logs
      if (result.data.logs) {
        setMedication(prev => ({
          ...prev,
          logs: result.data.logs
        }));
      }
    } else {
      toast.error('Failed to log medication');
    }
  };

  const handleDeleteMedication = async () => {
    const result = await deleteMed(medicationId);

    if (result.success) {
      toast.success('Medication deleted successfully');
      navigate('/medications');
    } else {
      toast.error('Failed to delete medication');
    }
  };

  if (loadingMedication && !medication) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (medicationError && !medication) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{medicationError}</p>
        <button
          onClick={loadMedication}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Medication not found</p>
        <Link
          to="/medications"
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Medications
        </Link>
      </div>
    );
  }

  // Check if medication was taken today
  const isTakenToday = medication.logs && medication.logs.some(log =>
    new Date(log.date).toDateString() === new Date().toDateString() && log.taken
  );

  // Check if medication was skipped today
  const isSkippedToday = medication.logs && medication.logs.some(log =>
    new Date(log.date).toDateString() === new Date().toDateString() && !log.taken
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {medication.name}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {medication.dosage} {medication.unit} - {medication.frequency}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/medications/edit/${medicationId}`}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      {(logError || deleteError) && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {logError || deleteError}
        </div>
      )}

      {confirmDelete && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200 bg-red-50">
          <h3 className="text-lg leading-6 font-medium text-red-800">
            Delete Medication
          </h3>
          <div className="mt-2 max-w-xl text-sm text-red-700">
            <p>
              Are you sure you want to delete this medication? This action cannot be undone.
            </p>
          </div>
          <div className="mt-5 flex space-x-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteMedication}
              disabled={deletingMedication}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            >
              {deletingMedication ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
          <dl className="mt-2 text-sm text-gray-500">
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Category:</dt>
              <dd className="w-2/3">
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
              </dd>
            </div>
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Status:</dt>
              <dd className="w-2/3">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  medication.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {medication.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Purpose:</dt>
              <dd className="w-2/3">{medication.purpose || 'Not specified'}</dd>
            </div>
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Instructions:</dt>
              <dd className="w-2/3">{medication.instructions || 'None'}</dd>
            </div>
          </dl>
        </div>

        <div className="sm:col-span-3">
          <h4 className="text-md font-medium text-gray-900">Schedule</h4>
          <dl className="mt-2 text-sm text-gray-500">
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Start Date:</dt>
              <dd className="w-2/3">{new Date(medication.startDate).toLocaleDateString()}</dd>
            </div>
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">End Date:</dt>
              <dd className="w-2/3">
                {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Ongoing'}
              </dd>
            </div>
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Frequency:</dt>
              <dd className="w-2/3">{medication.customFrequency || medication.frequency}</dd>
            </div>
            <div className="mt-1 flex">
              <dt className="w-1/3 font-medium">Time of Day:</dt>
              <dd className="w-2/3">
                {medication.timeOfDay.includes('custom')
                  ? medication.customTimes.map(time => time).join(', ')
                  : medication.timeOfDay.join(', ')}
              </dd>
            </div>
            {medication.daysOfWeek && medication.daysOfWeek.length > 0 && (
              <div className="mt-1 flex">
                <dt className="w-1/3 font-medium">Days of Week:</dt>
                <dd className="w-2/3">{medication.daysOfWeek.join(', ')}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="sm:col-span-6 border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900">Log Medication for Today</h4>

          {isTakenToday ? (
            <div className="mt-2 bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Medication taken today
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      You've already logged this medication as taken today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : isSkippedToday ? (
            <div className="mt-2 bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Medication skipped today
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You've already logged this medication as skipped today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <div className="mb-4">
                <label htmlFor="logNote" className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="logNote"
                    name="logNote"
                    rows="2"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add any notes about taking this medication"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleLogMedication(true)}
                  disabled={loggingMedication}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                >
                  {loggingMedication ? 'Logging...' : 'Mark as Taken'}
                </button>
                <button
                  type="button"
                  onClick={() => handleLogMedication(false)}
                  disabled={loggingMedication}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-yellow-300"
                >
                  {loggingMedication ? 'Logging...' : 'Mark as Skipped'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-6 border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900">Medication History</h4>

          {medication.logs && medication.logs.length > 0 ? (
            <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {medication.logs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((log, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.taken ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.taken ? 'Taken' : 'Skipped'}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {log.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              No medication logs found.
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Link
          to="/medications"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Medications
        </Link>
      </div>
    </div>
  );
};

export default MedicationDetail;
