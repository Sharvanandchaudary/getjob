import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    toast.error('Real-time connection failed');
  });

  // Listen for application updates
  socket.on('application:updated', (data) => {
    toast.success(`Application updated: ${data.position} at ${data.company}`);
    // Trigger a refetch in React Query
    window.dispatchEvent(new CustomEvent('application-updated', { detail: data }));
  });

  socket.on('application:created', (data) => {
    toast.info(`New application: ${data.position} at ${data.company}`);
    window.dispatchEvent(new CustomEvent('application-created', { detail: data }));
  });

  socket.on('status:changed', (data) => {
    toast.success(`Status changed to: ${data.newStatus}`);
    window.dispatchEvent(new CustomEvent('status-changed', { detail: data }));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
};
