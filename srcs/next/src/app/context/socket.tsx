import { Socket, io } from 'socket.io-client';
import BACK_URL from '../globals';
import { getCookie } from '../Cookie';

// socket io event hook
export const IoEventOnce = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  if (!chatSocket.hasListeners(eventName)) {
    chatSocket.once(eventName, eventHandler);
    console.log(`[Socket.IO] ${eventName} event once`);
  }
};

export const IoEventListner = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  if (!chatSocket.hasListeners(eventName)) {
    chatSocket.on(eventName, eventHandler);
    console.log(`[Socket.IO] ${eventName} event listen`);
  }
};

export const createSocket = (
  namespace: string,
  token: string | null,
): Socket => {
  return io(`${BACK_URL}/${namespace}`, {
    withCredentials: false,
    autoConnect: false,
    transports: ['websocket'],
    closeOnBeforeunload: true,
    reconnection: true,
    query: {
      token,
    },
  });
};
