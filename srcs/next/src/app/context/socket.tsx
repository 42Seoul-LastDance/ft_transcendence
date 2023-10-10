import { Socket, io } from 'socket.io-client';
import { BACK_URL } from '../globals';
import { reGenerateToken } from '../auth';
import { getCookie } from '../Cookie';

// socket io event hook
export const IoEventOnce = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  if (!chatSocket?.hasListeners(eventName)) {
    chatSocket?.once(eventName, (data) => {
      eventHandler(data);
    });
    console.log(`[Socket.IO] once ${eventName}`);
  }
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
    chatSocket?.on(eventName, (data?: any) => eventHandler(data));
    console.log(`[Socket.IO] listen ${eventName}`);
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
    auth: {
      token: token,
    },
  });
};

export const handleTryAuth = async (socket: Socket, router: any) => {
  const response = await reGenerateToken(router);

  switch (response.status) {
    case 200:
      const xAccessToken = getCookie('access_token');
      if (socket?.connected) {
        socket?.disconnect();
        socket.auth = {
          token: xAccessToken,
        };
        socket.connect();
      }
      break;
    case 401:
      router.push('/');
      break;
    default:
      console.log('refresh token: ', response.status);
  }
};
