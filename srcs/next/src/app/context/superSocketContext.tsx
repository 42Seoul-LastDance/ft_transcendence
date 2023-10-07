// import React, { createContext, useContext, useEffect } from 'react';
// import { io, Socket } from 'socket.io-client';
// import BACK_URL from '../globals';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/store';
// import tryAuth from '../auth';
// import { createSocket } from './socket';

// // Socket.IO 소켓 초기화

// // SocketContext 생성
// const SuperSocketContext = createContext<Socket | undefined>(undefined);

// // 커스텀 훅 정의
// export function useSuperSocket() {
//   const socket = useContext(SuperSocketContext);
//   if (!socket) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return socket;
// }

// // SocketProvider 컴포넌트 정의
// const SuperSocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const token = useSelector((state: RootState) => state.user.token);
//   const superSocket: Socket = createSocket('DM', token);

//   useEffect(() => {
//     tryAuth();

//     console.log('[Socket.IO] socket info', superSocket);
//     if (!superSocket.connected) superSocket.connect();
//   }, []);

//   return (
//     <SuperSocketContext.Provider value={superSocket}>
//       {children}
//     </SuperSocketContext.Provider>
//   );
// };

// export default SuperSocketProvider;
