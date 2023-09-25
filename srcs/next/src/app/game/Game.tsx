'use client';

import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { getGameSocket, disconnectGameSocket } from '../SSock';
import { Socket } from 'socket.io-client';
import { useAppSelector, store } from '../Redux/store';
import { Provider, useDispatch } from 'react-redux';
import { setIsChanged } from '../Redux/socketSlice';
import { setIsMatched } from '../Redux/matchSlice';

interface MatchingProps {
    socket: Socket | undefined;
}

// const Game: React.FC<MatchingProps> = (props) => {
const Game = () => {
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
    const [isReady, setIsReady] = useState<boolean>(false);
    const dispatch = useDispatch();
    const isMathched = useAppSelector((state) => state.match.isMatched);
    const isChanged = useAppSelector((state) => state.socket.isChanged);
    const isCustomGame = useAppSelector((state) => state.match.isCustom);
    var socket: Socket = getGameSocket();

    useEffect(() => {
        socket = getGameSocket();
        return () => {
            disconnectGameSocket();
        };
    }, []);

    // react to unity
    if (!socket.hasListeners('startGame')) {
        socket.on('startGame', (json: JSON) => {
            console.log('! startGame Event Detected');
            sendMessage('GameManager', 'StartGame', JSON.stringify(json));
        });
    }
    if (!socket.hasListeners('kickout')) {
        socket.on('kickout', () => {
            console.log('! kickout Event Detected');
            dispatch(setIsMatched({ isMatched: false }));
        });
    }
    if (!socket.hasListeners('movePaddle')) {
        socket.on('movePaddle', (json: JSON) => {
            console.log('! movePaddle Event Detected');
            sendMessage('Paddle', 'MoveOpponentPaddle', JSON.stringify(json));
        });
    }
    if (!socket.hasListeners('gameOver')) {
        socket.on('gameOver', (json: JSON) => {
            console.log('! gameOver Event Detected');
            sendMessage('GameManager', 'GameOver', JSON.stringify(json));
            setGameOver(true);
            if (!isCustomGame) dispatch(setIsMatched({ isMatched: false }));
            else setIsReady(false);
        });
    }

    // unity to react
    // const handleGameOver = useCallback(() => {
    //     socket.emit('GameOver', 'hi');
    // }, [setGameOver]);

    // useEffect(() => {
    //     addEventListener('GameOver', handleGameOver);
    //     return () => {
    //         removeEventListener('GameOver', handleGameOver);
    //     };
    // }, [addEventListener, removeEventListener, handleGameOver]);

    return (
        <>
            {gameOver === true && <h2>{'Game Over!'}</h2>}
            <button
                onClick={() => {
                    socket.emit('getReady');
                    setIsReady(true);
                }}
                disabled={isReady}
            >
                Get Ready
            </button>
            <Unity
                unityProvider={unityProvider}
                style={{ width: 1280, height: 720 }}
            />
        </>
    );
};

export default Game;
