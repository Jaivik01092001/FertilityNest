import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getChatSession, sendMessage, setTypingStatus } from '../../store/slices/chatSlice';
import useApi from '../../hooks/useApi';
import { getSocket, initSocket } from '../../services/socketService';

const ChatSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { currentSession } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { execute: fetchSession, loading: loadingSession, error: sessionError } = useApi({
    asyncAction: getChatSession,
    feature: 'chat',
  });

  const { execute: sendMsg, loading: sendingMessage, error: sendError } = useApi({
    asyncAction: sendMessage,
    feature: 'chat',
  });

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  // Initialize socket connection
  useEffect(() => {
    if (user && user._id) {
      // Initialize socket connection
      const socket = initSocket(user._id);

      // Clean up on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Set typing status to true immediately when user sends a message
    // This will be updated by the socket event when the AI response is ready
    dispatch(setTypingStatus({ sessionId, isTyping: true }));

    const result = await sendMsg({ sessionId, content: message });

    if (result.success) {
      setMessage('');

      // If there was no AI response (error case), make sure typing status is reset
      if (!result.data.aiResponse) {
        dispatch(setTypingStatus({ sessionId, isTyping: false }));
      }
    } else {
      toast.error('Failed to send message');
      dispatch(setTypingStatus({ sessionId, isTyping: false }));
    }
  };

  if (loadingSession && !currentSession) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (sessionError && !currentSession) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{sessionError}</p>
        <button
          onClick={() => fetchSession(sessionId)}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chat session not found</p>
        <Link
          to="/chat"
          className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Chat List
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg flex flex-col h-[calc(100vh-8rem)]">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {currentSession.title || 'Chat with Anaira'}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {new Date(currentSession.createdAt).toLocaleString()}
          </p>
        </div>
        <Link
          to="/chat"
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Back to Chat List
        </Link>
      </div>

      {sendError && (
        <div className="px-4 py-3 bg-red-50 text-red-700 text-sm">
          {sendError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSession.messages && currentSession.messages.length > 0 ? (
          <>
            {currentSession.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-purple-100 text-purple-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    {msg.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {currentSession.isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl px-4 py-2 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="typing-dot bg-gray-500"></div>
                    <div className="typing-dot bg-gray-500 animation-delay-200"></div>
                    <div className="typing-dot bg-gray-500 animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Type your message..."
              disabled={sendingMessage}
            />
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={sendingMessage || !message.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
            >
              {sendingMessage ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatSession;
