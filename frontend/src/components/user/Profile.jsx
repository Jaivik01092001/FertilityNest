import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import useApi from '../../hooks/useApi';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    fertilityStage: '',
    journeyType: '',
    dateOfBirth: '',
    phone: '',
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        shareWithPartner: true,
        anonymousInCommunity: false,
      },
      theme: 'auto',
    },
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const { execute, loading, error } = useApi({
    asyncAction: updateProfile,
    feature: 'auth',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        fertilityStage: user.fertilityStage || 'Other',
        journeyType: user.journeyType || 'Natural',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        phone: user.phone || '',
        preferences: {
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
          },
          privacy: {
            shareWithPartner: user.preferences?.privacy?.shareWithPartner ?? true,
            anonymousInCommunity: user.preferences?.privacy?.anonymousInCommunity ?? false,
          },
          theme: user.preferences?.theme || 'auto',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., preferences.notifications.email)
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
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear success message when form is changed
    if (updateSuccess) {
      setUpdateSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await execute(formData);
    
    if (result.success) {
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Profile Information
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Update your personal details and preferences
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {updateSuccess && (
        <div className="rounded-md bg-green-50 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Profile Updated
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your profile has been updated successfully.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="shadow-sm bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="fertilityStage" className="block text-sm font-medium text-gray-700">
                Fertility Stage
              </label>
              <div className="mt-1">
                <select
                  id="fertilityStage"
                  name="fertilityStage"
                  value={formData.fertilityStage}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="Trying to Conceive">Trying to Conceive</option>
                  <option value="IVF">IVF</option>
                  <option value="IUI">IUI</option>
                  <option value="PCOS Management">PCOS Management</option>
                  <option value="Pregnancy">Pregnancy</option>
                  <option value="Postpartum">Postpartum</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="journeyType" className="block text-sm font-medium text-gray-700">
                Journey Type
              </label>
              <div className="mt-1">
                <select
                  id="journeyType"
                  name="journeyType"
                  value={formData.journeyType}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="Natural">Natural</option>
                  <option value="IVF">IVF</option>
                  <option value="IUI">IUI</option>
                  <option value="PCOS">PCOS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="preferences.notifications.email"
                    name="preferences.notifications.email"
                    type="checkbox"
                    checked={formData.preferences.notifications.email}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="preferences.notifications.email" className="font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-gray-500">Receive updates and reminders via email</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="preferences.notifications.push"
                    name="preferences.notifications.push"
                    type="checkbox"
                    checked={formData.preferences.notifications.push}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="preferences.notifications.push" className="font-medium text-gray-700">
                    Push Notifications
                  </label>
                  <p className="text-gray-500">Receive push notifications in your browser</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="preferences.notifications.sms"
                    name="preferences.notifications.sms"
                    type="checkbox"
                    checked={formData.preferences.notifications.sms}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="preferences.notifications.sms" className="font-medium text-gray-700">
                    SMS Notifications
                  </label>
                  <p className="text-gray-500">Receive text message reminders (may incur charges)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Privacy Preferences</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="preferences.privacy.shareWithPartner"
                    name="preferences.privacy.shareWithPartner"
                    type="checkbox"
                    checked={formData.preferences.privacy.shareWithPartner}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="preferences.privacy.shareWithPartner" className="font-medium text-gray-700">
                    Share with Partner
                  </label>
                  <p className="text-gray-500">Allow your partner to view your cycle and medication data</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="preferences.privacy.anonymousInCommunity"
                    name="preferences.privacy.anonymousInCommunity"
                    type="checkbox"
                    checked={formData.preferences.privacy.anonymousInCommunity}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="preferences.privacy.anonymousInCommunity" className="font-medium text-gray-700">
                    Anonymous in Community
                  </label>
                  <p className="text-gray-500">Hide your real name in community posts and comments</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Theme Preference</h3>
            <div className="mt-4">
              <select
                id="preferences.theme"
                name="preferences.theme"
                value={formData.preferences.theme}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System Default)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
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

export default Profile;
