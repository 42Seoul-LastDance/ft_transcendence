'use client';

import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { getGameSocket } from '../../SSock';
import { Socket } from 'socket.io-client';
import { useAppSelector, store } from '../../Redux/store';
import { Provider } from 'react-redux';

// var socket: Socket;
var socket: Socket = getGameSocket();

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

    // useEffect(() => {
    //     socket = getGameSocket();
    // }, []);

    const [gameOver, setGameOver] = useState<boolean | undefined>(undefined);

    // react to unity
    socket.on('movePaddle', (json: JSON) => {
        sendMessage('Paddle', 'MoveOpponentPaddle', JSON.stringify(json));
        console.log('! MovePaddle Event Detected');
    });

    socket.on('startGame', (json: JSON) => {
        sendMessage('GameManager', 'StartGame', JSON.stringify(json));
        console.log('! MovePaddle Event Detected');
    });

    socket.on('gameOver', (json: JSON) => {
        sendMessage('GameManager', 'GameOver', JSON.stringify(json));
        console.log('! MovePaddle Event Detected');
    });

    // unity to react
    const handleGameOver = useCallback(() => {
        //setGameOver(true);
        socket.emit('GameOver', 'hi');
    }, [setGameOver]);

    useEffect(() => {
        addEventListener('GameOver', handleGameOver);
        return () => {
            removeEventListener('GameOver', handleGameOver);
        };
    }, [addEventListener, removeEventListener, handleGameOver]);

    const side = useAppSelector((state) => state.match.side);
    sendMessage('GameManager', 'SetMySide');

    return (
        <Fragment>
            <div className="Game">
                {gameOver === true && <p>{`Game Over!`}</p>}
                <button
                    onClick={() => {
                        socket.emit('getReady');
                        console.log('getReady Button Clicked');
                    }}
                >
                    Get Ready
                </button>
                <Unity
                    unityProvider={unityProvider}
                    style={{ width: 1280, height: 720 }}
                />
            </div>
        </Fragment>
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
