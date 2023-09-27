'use client';

import { useState, useEffect, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { RootState } from '../Redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setIsMatched } from '../Redux/matchSlice';
import { useGameSocket } from '../Contexts/GameSocketContext';
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";
import { deflateSync } from 'zlib';

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
    const isMatched = useSelector((state: RootState) => state.match.isMatched);
    const isCustomGame = useSelector((state: RootState) => state.match.isCustom);

    // useEffect(() => {
    //     return () => {
    //         dispatch(setIsMatched({ isMatched: true }));
    //     };
    // }, []);
    const socket = useGameSocket();

    // react to unity
    if (!socket.hasListeners('startGame')) {
        socket.on('startGame', (json: JSON) => {
            alert('startGame Event Detected');
            sendMessage('GameManager', 'StartGame', JSON.stringify(json));
        });
    }
    if (!socket.hasListeners('kickout')) {
        socket.on('kickout', () => {
            alert('kickout Event Detected');
            dispatch(setIsMatched({ isMatched: false }));
        });
    }
    if (!socket.hasListeners('movePaddle')) {
        socket.on('movePaddle', (json: JSON) => {
            alert('movePaddle Event Detected');
            sendMessage('Paddle', 'MoveOpponentPaddle', JSON.stringify(json));
        });
    }
    if (!socket.hasListeners('gameOver')) {
        socket.on('gameOver', (json: JSON) => {
            alert('gameOver Event Detected');
            sendMessage('GameManager', 'GameOver', JSON.stringify(json));
            setGameOver(true);
            if (!isCustomGame) dispatch(setIsMatched({ isMatched: false }));
            else setIsReady(false);
        });
    }

    const handleUnityException = useCallback((data: ReactUnityEventParameter) => {
        alert('Unity Exception : ' + data);
    }, []);
	const handleValidCheck = useCallback((data: ReactUnityEventParameter) => {
        console.log('ValidCheck : ' + data);
    }, []);
	// to string 형변환
	const handleMovePaddle = useCallback((data: ReactUnityEventParameter) => {
        socket.emit('movePaddle', JSON.parse(data))
    }, []);
	
	// unity to react
    useEffect(() => {
        addEventListener('UnityException', handleUnityException);
		addEventListener('ValidCheck', handleValidCheck);
        return () => {
            removeEventListener('UnityException', handleUnityException);
			removeEventListener('ValidCheck', handleValidCheck);
			removeEventListener('MovePaddle', handleValidCheck);
        };
    }, [addEventListener, removeEventListener, handleUnityException, handleValidCheck]);
	
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
