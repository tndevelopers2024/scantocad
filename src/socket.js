// src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://5000-firebase-scantocadbackendgit-1748956005344.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev';

let socket;

export const initializeSocket = () => {
  const token = localStorage.getItem('token');
  
  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket'],
    autoConnect: false
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