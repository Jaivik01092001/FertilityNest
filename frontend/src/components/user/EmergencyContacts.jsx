import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from '../../store/slices/uiSlice';
import useApi from '../../hooks/useApi';

// Create async thunk for adding emergency contact
export const addEmergencyContact = createAsyncThunk(
  'user/addEmergencyContact',
  async (contactData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.post('/users/emergency-contacts', contactData);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Failed to add emergency contact',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Create async thunk for removing emergency contact
export const removeEmergencyContact = createAsyncThunk(
  'user/removeEmergencyContact',
  async (contactId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.delete(`/users/emergency-contacts/${contactId}`);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Failed to remove emergency contact',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const EmergencyContacts = () => {
  const { user } = useSelector((state) => state.auth);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const [addSuccess, setAddSuccess] = useState(false);
  const [removeSuccess, setRemoveSuccess] = useState(false);
  
  const addApi = useApi({
    asyncAction: addEmergencyContact,
    feature: 'auth',
  });
  
  const removeApi = useApi({
    asyncAction: removeEmergencyContact,
    feature: 'auth',
  });

  useEffect(() => {
    if (user && user.emergencyContacts) {
      setContacts(user.emergencyContacts);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear success messages when form is changed
    if (addSuccess) setAddSuccess(false);
    if (removeSuccess) setRemoveSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await addApi.execute(formData);
    
    if (result.success) {
      setAddSuccess(true);
      setFormData({
        name: '',
        phone: '',
        relationship: '',
      });
      
      // Update contacts list
      if (result.data.user && result.data.user.emergencyContacts) {
        setContacts(result.data.user.emergencyContacts);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAddSuccess(false);
      }, 3000);
    }
  };

  const handleRemove = async (contactId) => {
    const result = await removeApi.execute(contactId);
    
    if (result.success) {
      setRemoveSuccess(true);
      
      // Update contacts list
      if (result.data.user && result.data.user.emergencyContacts) {
        setContacts(result.data.user.emergencyContacts);
      } else {
        // Fallback if the API doesn't return updated contacts
        setContacts(contacts.filter(contact => contact._id !== contactId));
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setRemoveSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Emergency Contacts
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Add contacts who should be notified in case of emergency
        </p>
      </div>
      
      {(addApi.error || removeApi.error) && (
        <div className="rounded-md bg-red-50 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{addApi.error || removeApi.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {(addSuccess || removeSuccess) && (
        <div className="rounded-md bg-green-50 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {addSuccess ? 'Contact Added' : 'Contact Removed'}
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  {addSuccess 
                    ? 'Emergency contact has been added successfully.' 
                    : 'Emergency contact has been removed successfully.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 py-5 sm:p-6">
        <h4 className="text-md font-medium text-gray-900">Current Emergency Contacts</h4>
        
        {contacts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            You haven't added any emergency contacts yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {contacts.map((contact) => (
              <li key={contact._id} className="py-4 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                  {contact.relationship && (
                    <p className="text-sm text-gray-500">{contact.relationship}</p>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemove(contact._id)}
                    disabled={removeApi.loading}
                    className="text-sm text-red-600 hover:text-red-900 disabled:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900">Add New Emergency Contact</h4>
          <form onSubmit={handleSubmit} className="mt-4">
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
                    required
                    value={formData.name}
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
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="relationship"
                    id="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Spouse, Parent, Friend, etc."
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={addApi.loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
              >
                {addApi.loading ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
