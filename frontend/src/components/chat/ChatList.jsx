import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getChatSessions, createChatSession } from '../../store/slices/chatSlice';
import useApi from '../../hooks/useApi';

const ChatList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  
  const { chatSessions, totalSessions } = useSelector((state) => state.chat);
  const { execute: fetchSessions, loading: loadingSessions, error: sessionsError } = useApi({
    asyncAction: getChatSessions,
    feature: 'chat',
  });
  
  const { execute: startSession, loading: creatingSession, error: createError } = useApi({
    asyncAction: createChatSession,
    feature: 'chat',
  });

  useEffect(() => {
    loadSessions();
  }, [page, limit]);

  const loadSessions = async () => {
    await fetchSessions({ page, limit });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    const result = await startSession({ title: sessionTitle || undefined });
    
    if (result.success) {
      toast.success('Chat session created successfully');
      setIsCreating(false);
      setSessionTitle('');
      
      // Navigate to the new chat session
      if (result.data && result.data.chatSession) {
        navigate(`/chat/${result.data.chatSession._id}`);
      }
    } else {
      toast.error('Failed to create chat session');
    }
  };

  if (loadingSessions && chatSessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (sessionsError && chatSessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{sessionsError}</p>
        <button
          onClick={loadSessions}
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
            Chat with Anaira
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your AI companion for fertility support
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          New Chat
        </button>
      </div>
      
      {isCreating && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Start a New Chat</h4>
          <form onSubmit={handleCreateSession}>
            <div>
              <label htmlFor="sessionTitle" className="block text-sm font-medium text-gray-700">
                Chat Title (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sessionTitle"
                  id="sessionTitle"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="E.g., Questions about IVF"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingSession}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
              >
                {creatingSession ? 'Creating...' : 'Start Chat'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {createError && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {createError}
        </div>
      )}
      
      {chatSessions.length === 0 ? (
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No chat sessions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new chat with Anaira.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsCreating(true)}
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
              New Chat
            </button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {chatSessions.map((session) => (
            <li key={session._id}>
              <Link
                to={`/chat/${session._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-purple-600 truncate">
                      {session.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {session.messages?.length || 0} messages
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {session.context?.fertilityStage && (
                          <span className="truncate">{session.context.fertilityStage}</span>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        <time dateTime={new Date(session.createdAt).toISOString()}>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </time>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      {/* Pagination */}
      {totalSessions > limit && (
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
              disabled={page * limit >= totalSessions}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page * limit >= totalSessions
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

export default ChatList;
