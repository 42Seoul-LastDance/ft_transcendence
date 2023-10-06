import { Socket } from 'socket.io-client';

// socket io event hook
const IoEventListner = (
  chatSocket: Socket,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  if (!chatSocket.hasListeners(eventName)) {
    chatSocket.once(eventName, eventHandler);
  }
};

export default IoEventListner;
