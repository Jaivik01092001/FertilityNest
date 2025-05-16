import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createMedication } from '../../store/slices/medicationSlice';
import useApi from '../../hooks/useApi';
import Layout from '../layout/Layout';
import { Button, Input, Select, Card } from '../ui/UIComponents';

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
    <Layout>
      <Card className="max-w-4xl mx-auto">
        <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
          <h3 className="text-xl leading-6 font-medium text-neutral-900">
            Add New Medication
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Enter details about your medication or supplement
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 mt-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Basic Information */}
            <div className="sm:col-span-3">
              <Input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                label="Medication Name *"
                placeholder="Enter medication name"
              />
            </div>

            <div className="sm:col-span-3">
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                options={[
                  { value: "fertility", label: "Fertility" },
                  { value: "hormone", label: "Hormone" },
                  { value: "vitamin", label: "Vitamin" },
                  { value: "supplement", label: "Supplement" },
                  { value: "pain relief", label: "Pain Relief" },
                  { value: "other", label: "Other" }
                ]}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                type="text"
                name="dosage"
                id="dosage"
                required
                value={formData.dosage}
                onChange={handleChange}
                label="Dosage *"
                placeholder="Enter dosage amount"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                type="text"
                name="unit"
                id="unit"
                value={formData.unit}
                onChange={handleChange}
                label="Unit"
                placeholder="mg, ml, etc."
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                id="frequency"
                name="frequency"
                required
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency *"
                options={[
                  { value: "once", label: "Once" },
                  { value: "daily", label: "Daily" },
                  { value: "twice daily", label: "Twice Daily" },
                  { value: "three times daily", label: "Three Times Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "as needed", label: "As Needed" },
                  { value: "other", label: "Other" }
                ]}
              />
            </div>

            {formData.frequency === 'other' && (
              <div className="sm:col-span-6">
                <Input
                  type="text"
                  name="customFrequency"
                  id="customFrequency"
                  value={formData.customFrequency}
                  onChange={handleChange}
                  label="Custom Frequency"
                  placeholder="E.g., Every other day"
                />
              </div>
            )}

            {/* Schedule */}
            <div className="sm:col-span-3">
              <Input
                type="date"
                name="startDate"
                id="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                label="Start Date *"
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                label="End Date"
              />
              <p className="mt-1 text-xs text-neutral-500">
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
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
              <Input
                type="text"
                name="purpose"
                id="purpose"
                value={formData.purpose}
                onChange={handleChange}
                label="Purpose"
                placeholder="E.g., For fertility support"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="instructions" className="block text-sm font-medium text-neutral-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows="3"
                value={formData.instructions}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full px-4 py-3 text-base border border-neutral-300 rounded-lg"
                placeholder="E.g., Take with food"
              />
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
                    className="focus:ring-primary-500 h-5 w-5 text-primary-600 border-neutral-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="reminders.enabled" className="font-medium text-neutral-700">
                    Enable Reminders
                  </label>
                  <p className="text-neutral-500">Receive reminders to take this medication</p>
                </div>
              </div>
            </div>

            {formData.reminders.enabled && (
              <>
                <div className="sm:col-span-3">
                  <Input
                    type="number"
                    name="reminders.reminderTime"
                    id="reminders.reminderTime"
                    min="0"
                    max="60"
                    value={formData.reminders.reminderTime}
                    onChange={handleChange}
                    label="Reminder Time (minutes before)"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Select
                    id="reminders.notificationMethod"
                    name="reminders.notificationMethod"
                    value={formData.reminders.notificationMethod}
                    onChange={handleChange}
                    label="Notification Method"
                    options={[
                      { value: "push", label: "Push Notification" },
                      { value: "email", label: "Email" },
                      { value: "sms", label: "SMS" },
                      { value: "all", label: "All Methods" }
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-4 py-4 bg-neutral-50 text-right sm:px-6 rounded-b-lg border-t border-neutral-200">
          <Button
            type="button"
            onClick={() => navigate('/medications')}
            variant="outline"
            className="mr-3"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
      </Card>
    </Layout>
  );
};

export default AddMedication;
