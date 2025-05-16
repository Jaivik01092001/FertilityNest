import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createMedication } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';

const AddMedication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    customFrequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    timeOfDay: ['morning'],
    customTimes: [''],
    daysOfWeek: [],
    instructions: '',
    purpose: '',
    category: 'other',
    reminders: {
      enabled: true,
      reminderTime: 15,
      notificationMethod: 'push'
    },
    refillInfo: {
      refillDate: '',
      quantity: '',
      pharmacy: '',
      prescriber: '',
      reminder: {
        enabled: false,
        daysBeforeRefill: 7
      }
    }
  });
  
  const { execute, loading, error } = useApi({
    asyncAction: createMedication,
    feature: 'medications',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., reminders.enabled)
      const parts = name.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        
        // Navigate to the nested property
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        
        // Set the value
        current[parts[parts.length - 1]] = type === 'checkbox' ? checked : value;
        
        return newData;
      });
    } else if (name === 'timeOfDay' || name === 'daysOfWeek') {
      // Handle multi-select arrays
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCustomTimeChange = (index, value) => {
    setFormData((prev) => {
      const newCustomTimes = [...prev.customTimes];
      newCustomTimes[index] = value;
      return {
        ...prev,
        customTimes: newCustomTimes
      };
    });
  };

  const addCustomTime = () => {
    setFormData((prev) => ({
      ...prev,
      customTimes: [...prev.customTimes, '']
    }));
  };

  const removeCustomTime = (index) => {
    setFormData((prev) => {
      const newCustomTimes = [...prev.customTimes];
      newCustomTimes.splice(index, 1);
      return {
        ...prev,
        customTimes: newCustomTimes
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data for submission
    const medicationData = { ...formData };
    
    // Remove empty fields
    if (!medicationData.endDate) delete medicationData.endDate;
    if (!medicationData.customFrequency) delete medicationData.customFrequency;
    if (!medicationData.refillInfo.refillDate) delete medicationData.refillInfo.refillDate;
    
    // Handle custom times
    if (!medicationData.timeOfDay.includes('custom')) {
      delete medicationData.customTimes;
    }
    
    const result = await execute(medicationData);
    
    if (result.success) {
      toast.success('Medication added successfully');
      navigate('/medications');
    } else {
      toast.error('Failed to add medication');
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Add New Medication
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Enter details about your medication or supplement
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
            {/* Basic Information */}
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Medication Name *
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
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="fertility">Fertility</option>
                  <option value="hormone">Hormone</option>
                  <option value="vitamin">Vitamin</option>
                  <option value="supplement">Supplement</option>
                  <option value="pain relief">Pain Relief</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">
                Dosage *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="dosage"
                  id="dosage"
                  required
                  value={formData.dosage}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="unit"
                  id="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="mg, ml, etc."
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                Frequency *
              </label>
              <div className="mt-1">
                <select
                  id="frequency"
                  name="frequency"
                  required
                  value={formData.frequency}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="twice daily">Twice Daily</option>
                  <option value="three times daily">Three Times Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as needed">As Needed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {formData.frequency === 'other' && (
              <div className="sm:col-span-6">
                <label htmlFor="customFrequency" className="block text-sm font-medium text-gray-700">
                  Custom Frequency
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="customFrequency"
                    id="customFrequency"
                    value={formData.customFrequency}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g., Every other day"
                  />
                </div>
              </div>
            )}
            
            {/* Schedule */}
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
                Leave blank if ongoing
              </p>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700">
                Time of Day *
              </label>
              <div className="mt-1">
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  required
                  multiple
                  value={formData.timeOfDay}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  size="5"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                  <option value="custom">Custom Times</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>
            
            {formData.timeOfDay.includes('custom') && (
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Times
                </label>
                <div className="mt-1 space-y-2">
                  {formData.customTimes.map((time, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleCustomTimeChange(index, e.target.value)}
                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeCustomTime(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCustomTime}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Time
                  </button>
                </div>
              </div>
            )}
            
            {(formData.frequency === 'weekly' || formData.frequency === 'other') && (
              <div className="sm:col-span-6">
                <label htmlFor="daysOfWeek" className="block text-sm font-medium text-gray-700">
                  Days of Week
                </label>
                <div className="mt-1">
                  <select
                    id="daysOfWeek"
                    name="daysOfWeek"
                    multiple
                    value={formData.daysOfWeek}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    size="7"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
            )}
            
            {/* Additional Information */}
            <div className="sm:col-span-6">
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Purpose
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="purpose"
                  id="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="E.g., For fertility support"
                />
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <div className="mt-1">
                <textarea
                  id="instructions"
                  name="instructions"
                  rows="3"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="E.g., Take with food"
                />
              </div>
            </div>
            
            {/* Reminders */}
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="reminders.enabled"
                    name="reminders.enabled"
                    type="checkbox"
                    checked={formData.reminders.enabled}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="reminders.enabled" className="font-medium text-gray-700">
                    Enable Reminders
                  </label>
                  <p className="text-gray-500">Receive reminders to take this medication</p>
                </div>
              </div>
            </div>
            
            {formData.reminders.enabled && (
              <>
                <div className="sm:col-span-3">
                  <label htmlFor="reminders.reminderTime" className="block text-sm font-medium text-gray-700">
                    Reminder Time (minutes before)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="reminders.reminderTime"
                      id="reminders.reminderTime"
                      min="0"
                      max="60"
                      value={formData.reminders.reminderTime}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="reminders.notificationMethod" className="block text-sm font-medium text-gray-700">
                    Notification Method
                  </label>
                  <div className="mt-1">
                    <select
                      id="reminders.notificationMethod"
                      name="reminders.notificationMethod"
                      value={formData.reminders.notificationMethod}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="push">Push Notification</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="all">All Methods</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/medications')}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedication;
