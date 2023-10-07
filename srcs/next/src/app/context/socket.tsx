import { Socket, io } from 'socket.io-client';
import BACK_URL from '../globals';

// socket io event hook
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

export const createSocket = (namespace: string, token: string): Socket => {
  return io(`${BACK_URL}/${namespace}`, {
    // forceNew: true,
    withCredentials: false,
    autoConnect: true,
    transports: ['websocket'],
    closeOnBeforeunload: true,
    query: {
      token,
    },
  });
};
