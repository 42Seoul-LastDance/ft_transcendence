// import React, { createContext, useContext, useEffect } from 'react';
// import { io, Socket } from 'socket.io-client';

// // Socket.IO 소켓 초기화
// var dmSocket: Socket = io('http://10.14.6.6:3000/DM', {
//   withCredentials: false,
// });

// // SocketContext 생성
// const DmSocketContext = createContext<Socket | undefined>(undefined);

// // 커스텀 훅 정의
// export function useDmSocket() {
//   const socket = useContext(DmSocketContext);
//   if (!socket) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return socket;
// }

// // SocketProvider 컴포넌트 정의
// export function DmSocketProvider({ children }: { children: React.ReactNode }) {
//   // 소켓 초기화와 컨텍스트 제공을 한꺼번에 수행
//   useEffect(() => {
//     dmSocket.connect();
//     return () => {
//       dmSocket.disconnect();
//     };
//   }, []);

//   return (
//     <DmSocketContext.Provider value={dmSocket}>
//       {children}
//     </DmSocketContext.Provider>
//   );
// }
