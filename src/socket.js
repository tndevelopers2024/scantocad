// src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? 'http://localhost:5173'  // Vite will proxy this to the backend
  : 'https://api.convertscantocad.com';

let socket;

export const initializeSocket = () => {
  const token = localStorage.getItem('token');

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { token },
    autoConnect: false,
    transports: import.meta.env.DEV ? ['polling'] : ['websocket', 'polling'],
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};