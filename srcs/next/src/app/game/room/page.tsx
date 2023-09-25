'use client';

import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { getGameSocket } from '../../SSock';
import { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useAppSelector, store } from '../../Redux/store';
import { Provider } from 'react-redux';

// var socket: Socket;
const socket: Socket = getGameSocket();

const RoomHomeContent = () => {
    const {
        unityProvider,
        sendMessage,
        addEventListener,
        removeEventListener,
    } = useUnityContext({
        loaderUrl: '/build/Socket.loader.js',
        dataUrl: '/build/Socket.data.unityweb',
        frameworkUrl: '/build/Socket.framework.js.unityweb',
        codeUrl: '/build/Socket.wasm.unityweb',
    });

    const [gameOver, setGameOver] = useState<boolean>(false);
    const router = useRouter();

    // sendMessage(
    //     'GameManager',
    //     'SetMySide',
    //     useAppSelector((state) => state.match.side),
    // );
    // react to unity
    if (!socket.hasListeners('kickout')) {
        socket.on('kickout', () => {
            console.log('! kickout Event Detected');
            router.push('../../');
        });
    }
    if (!socket.hasListeners('movePaddle')) {
        socket.on('movePaddle', (json: JSON) => {
            sendMessage('Paddle', 'MoveOpponentPaddle', JSON.stringify(json));
            console.log('! movePaddle Event Detected');
        });
    }
    if (!socket.hasListeners('startGame')) {
        socket.on('startGame', (json: JSON) => {
            sendMessage('GameManager', 'StartGame', JSON.stringify(json));
            console.log('! startGame Event Detected');
        });
    }
    if (!socket.hasListeners('gameOver')) {
        socket.on('gameOver', (json: JSON) => {
            sendMessage('GameManager', 'GameOver', JSON.stringify(json));
            setGameOver(true);
            console.log('! gameOver Event Detected');
        });
    }

    // const handleGameOver = useCallback(() => {
    //     //setGameOver(true);
    //     socket.emit('GameOver', 'hi');
    // }, [setGameOver]);
    // useEffect(() => {
    //     addEventListener('GameOver', handleGameOver);
    //     return () => {
    //         removeEventListener('GameOver', handleGameOver);
    //     };
    // }, [addEventListener, removeEventListener, handleGameOver]);

    // unity to react
    // const handleUnityExeception = useCallback(() => {
    //     console.log('!!! UnityException !!!');
    // }, []);
    // useEffect(() => {
    //     addEventListener('UnityException', handleUnityExeception);
    //     return () => {
    //         removeEventListener('UnityException', handleUnityExeception);
    //     };
    // }, [addEventListener, removeEventListener, handleUnityExeception]);

    return (
        <>
            <div className="Game">
                {gameOver === true && <p>{`Game Over!`}</p>}
                <button
                    onClick={() => {
                        socket.emit('getReady');
                    }}
                >
                    Get Ready
                </button>
                <Unity
                    unityProvider={unityProvider}
                    style={{ width: 1280, height: 720 }}
                />
            </div>
        </>
    );
};

const RoomHome = () => {
    return (
        <>
            <Provider store={store}>
                <RoomHomeContent />
            </Provider>
        </>
    );
};

export default RoomHome;
