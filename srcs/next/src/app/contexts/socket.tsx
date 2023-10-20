import { Socket, io } from 'socket.io-client';
import { BACK_URL } from '../globals';
import { reGenerateToken } from '../auth';
import { getCookie } from '../cookie';
import { Events } from '../interfaces';

// socket io event hook
export const IoEventOnce = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  chatSocket?.off(eventName);
  chatSocket?.once(eventName, (data?: any) => {
    console.log(`[Socket.IO] ${eventName} data: `, data);
    eventHandler(data);
  });
  console.log(`[Socket.IO] once ${eventName}`);
};

export const IoEventListenerEmpty = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: () => void,
) => {
  if (!chatSocket?.hasListeners(eventName)) {
    chatSocket?.on(eventName, eventHandler);
    console.log(`[Socket.IO] listen ${eventName}`);
  }
};

export const IoEventListener = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  if (!chatSocket?.hasListeners(eventName)) {
    chatSocket?.on(eventName, (data?: any) => {
      console.log(`[Socket.IO] ${eventName} data: `, data);
      eventHandler(data);
    });
    console.log(`[Socket.IO] listen ${eventName}`);
  }
};

export const createSocket = (
  namespace: string,
  token: string | null,
): Socket => {
  return io(`${BACK_URL}/${namespace}`, {
    withCredentials: false,
    autoConnect: false, // 첫 연결시 커넥션
    transports: ['websocket'],
    closeOnBeforeunload: true,
    reconnection: false, // 오류시 재연결
    auth: {
      token: token,
    },
  });
};

export const handleTryAuth = async (socket: Socket, router: any) => {
  await reGenerateToken(router);

  const xAccessToken = getCookie('access_token');
  if (socket?.connected) socket?.disconnect();
  socket.auth = {
    token: xAccessToken,
  };
  socket.connect();
};

export const registerSocketEvent = (socket: Socket, e: Events[]): void => {
  e.forEach(({ event, once, callback }) => {
    if (once) {
      IoEventOnce(socket, event, callback);
    } else {
      IoEventListener(socket, event, callback);
    }
  });
};

export const clearSocketEvent = (socket: Socket, e: Events[]): void => {
  e.forEach(({ event, callback }) => {
    socket?.off(event, callback);
  });
};
