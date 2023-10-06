import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.IO 소켓 초기화
var gameSocket: Socket = io('http://10.28.4.13:3000/Game', {
    withCredentials: false,
});

// SocketContext 생성
const GameSocketContext = createContext<Socket | undefined>(undefined);

// 커스텀 훅 정의
export function useGameSocket() {
    const socket = useContext(GameSocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
}

// SocketProvider 컴포넌트 정의
export function GameSocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // 소켓 초기화와 컨텍스트 제공을 한꺼번에 수행
    useEffect(() => {
        gameSocket.connect();
        return () => {
            gameSocket.disconnect();
        };
    }, []);

    return (
        <GameSocketContext.Provider value={gameSocket}>
            {children}
        </GameSocketContext.Provider>
    );
}
