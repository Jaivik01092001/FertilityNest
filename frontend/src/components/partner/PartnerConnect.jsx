import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { generatePartnerCode, connectWithPartner } from '../../store/slices/partnerSlice';
import useApi from '../../hooks/useApi';

const PartnerConnect = () => {
  const navigate = useNavigate();
  const [partnerCode, setPartnerCode] = useState('');
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'connect'
  
  const { partnerInfo, partnerCode: generatedCode } = useSelector((state) => state.partner);
  
  const { execute: generateCode, loading: generatingCode, error: generateError } = useApi({
    asyncAction: generatePartnerCode,
    feature: 'partner',
  });
  
  const { execute: connect, loading: connecting, error: connectError } = useApi({
    asyncAction: connectWithPartner,
    feature: 'partner',
  });

  useEffect(() => {
    // If already connected to a partner, redirect to partner dashboard
    if (partnerInfo) {
      navigate('/partner');
    }
  }, [partnerInfo, navigate]);

  const handleGenerateCode = async () => {
    const result = await generateCode();
    
    if (result.success) {
      toast.success('Partner code generated successfully');
    } else {
      toast.error('Failed to generate partner code');
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!partnerCode.trim()) {
      toast.error('Please enter a partner code');
      return;
    }
    
    const result = await connect(partnerCode);
    
    if (result.success) {
      toast.success('Connected with partner successfully');
      navigate('/partner');
    } else {
      toast.error('Failed to connect with partner');
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
        .then(() => {
          toast.success('Partner code copied to clipboard');
        })
        .catch(() => {
          toast.error('Failed to copy code');
        });
    }
  };

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
      
      {(generateError || connectError) && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {generateError || connectError}
        </div>
      )}
      
      <div className="px-4 py-5 sm:p-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('generate')}
              className={`${
                activeTab === 'generate'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Generate Code
            </button>
            <button
              onClick={() => setActiveTab('connect')}
              className={`${
                activeTab === 'connect'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Connect with Code
            </button>
          </nav>
        </div>
        
        <div className="mt-6">
          {activeTab === 'generate' ? (
            <div>
              <div className="text-center">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">Generate a Partner Code</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate a unique code to share with your partner so they can connect with you.
                </p>
                
                {generatedCode ? (
                  <div className="mt-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Your Partner Code:</p>
                      <div className="mt-2 flex justify-center">
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={generatedCode}
                            className="block w-64 pr-10 border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                      Share this code with your partner. They will need to enter it in the "Connect with Code" tab.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      This code will expire in 24 hours.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                    >
                      {generatingCode ? 'Generating...' : 'Generate Partner Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Connect with a Partner Code</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the code shared by your partner to connect with them.
                </p>
                
                <form onSubmit={handleConnect} className="mt-6">
                  <div className="max-w-xs mx-auto">
                    <label htmlFor="partnerCode" className="sr-only">
                      Partner Code
                    </label>
                    <input
                      type="text"
                      name="partnerCode"
                      id="partnerCode"
                      required
                      value={partnerCode}
                      onChange={(e) => setPartnerCode(e.target.value)}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter partner code"
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={connecting || !partnerCode.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                    >
                      {connecting ? 'Connecting...' : 'Connect with Partner'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerConnect;
