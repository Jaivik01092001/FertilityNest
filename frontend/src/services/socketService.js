import { io } from 'socket.io-client';
import { store } from '../store';
import { setTypingStatus } from '../store/slices/chatSlice';

let socket;

/**
 * Initialize socket connection
 * @param {string} userId - User ID for room
 */
export const initSocket = (userId) => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new connection
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    withCredentials: true,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected');
    
    // Join user's room
    if (userId) {
      socket.emit('join', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Chat events
  socket.on('typingStarted', ({ sessionId }) => {
    store.dispatch(setTypingStatus({ sessionId, isTyping: true }));
  });

  socket.on('typingStopped', ({ sessionId }) => {
    store.dispatch(setTypingStatus({ sessionId, isTyping: false }));
  });

  socket.on('receiveMessage', (data) => {
    // This will be handled by the Redux store
    console.log('Message received via socket:', data);
  });

  return socket;
};

/**
 * Get the socket instance
 * @returns {Object} Socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
};
