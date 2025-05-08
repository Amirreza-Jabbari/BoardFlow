import { io } from 'socket.io-client';

// We rely on Vite’s proxy: connect to same origin
const socket = io({ path: '/socket.io', transports: ['websocket'] });
export default socket;
