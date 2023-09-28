// import React, { createContext, useContext, useEffect } from 'react';
// import { io, Socket } from 'socket.io-client';

// // Socket.IO 소켓 초기화
// var gameSocket: Socket | undefined = undefined;

// // SocketContext 생성
// const GameSocketContext = createContext<Socket | undefined>(undefined);

// // 커스텀 훅 정의
// export function useGameSocket() {
//   if (!gameSocket) {
//     gameSocket = io('http://10.14.6.6:3000/Game', {
//       withCredentials: false,
//     });
//   }
//   const socket = useContext(GameSocketContext);
//   return socket;
// }

// // SocketProvider 컴포넌트 정의
// export function GameSocketProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // 소켓 초기화와 컨텍스트 제공을 한꺼번에 수행
//   useEffect(() => {
//     if (!gameSocket)
//       gameSocket = io('http://10.14.6.6:3000/Game', {
//         withCredentials: false,
//       });
//     else gameSocket.connect();
//     return () => {
//       if (gameSocket != undefined) gameSocket.disconnect();
//     };
//   }, []);

//   return (
//     <GameSocketContext.Provider value={gameSocket}>
//       {children}
//     </GameSocketContext.Provider>
//   );
// }
