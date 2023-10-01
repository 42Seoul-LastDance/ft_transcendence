'use client';

// 1. Paddle은 MoveOpponenet 가 없다
// 2. Unity to react parameter 값 이상함

import { useState, useEffect, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { RootState } from '../Redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setIsMatched } from '../Redux/matchSlice';
import { useGameSocket } from '../Contexts/GameSocketContext';
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";
import { deflateSync } from 'zlib';

enum PlayerSide {
	NONE = -1,
    LEFT = 0,
    RIGHT = 1,
}

interface StartGameJson{
	side: PlayerSide,
	ballDirX: number,
	ballDirY: number,
	ballDirZ: number,
	isFirst: boolean
}

const Game = () => {
    const {
        unityProvider,
        sendMessage,
        addEventListener,
        removeEventListener,
    } = useUnityContext({
        loaderUrl: '/build/Pong.loader.js',
        dataUrl: '/build/Pong.data.unityweb',
        frameworkUrl: '/build/Pong.framework.js.unityweb',
        codeUrl: '/build/Pong.wasm.unityweb',
    });

    const [gameOver, setGameOver] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const dispatch = useDispatch();
    const isMatched = useSelector((state: RootState) => state.match.isMatched);
    const isCustomGame = useSelector((state: RootState) => state.match.isCustom);
	const socket = useGameSocket();
	var mySide :PlayerSide = PlayerSide.NONE;

	// react to unity
	const Init = () => {
		setIsReady(false);
		if (!socket.hasListeners('startGame')) {
			socket.on('startGame', (json: StartGameJson) => {
				if (json.isFirst)
					mySide = json.side;
				sendMessage('GameManager', 'StartGame', JSON.stringify(json));
				console.log('! startGame Event Detected : ', json)
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
				if (mySide === PlayerSide.LEFT)
					sendMessage('RightPaddle', 'MoveOpponentPaddle', JSON.stringify(json));
				else if (mySide === PlayerSide.RIGHT)
					sendMessage('LeftPaddle', 'MoveOpponentPaddle', JSON.stringify(json));
			});
		}
		if (!socket.hasListeners('gameOver')) {
			socket.on('gameOver', (json: JSON) => {
				console.log('! gameOver Event Detected : ', json);
				sendMessage('GameManager', 'GameOver', JSON.stringify(json));
				setGameOver(true);
				//if (!isCustomGame) dispatch(setIsMatched({ isMatched: false }));
				//else setIsReady(false);
			});
		}
		if (!socket.hasListeners('ballHit')) {
			socket.on('ballHit', (json: JSON) => {
				console.log('! ballHit Event Detected : ', json);
				sendMessage('Ball', 'SynchronizeBallPos', JSON.stringify(json));
			});
		}
	}

    const handleUnityException = useCallback((data: ReactUnityEventParameter) => {
        alert('Unity Exception : ' + data);
    }, []);
	const handleValidCheck = useCallback((data: ReactUnityEventParameter) => {
        //console.log('ValidCheck : ' + data);
		//socket.emit('validCheck', JSON.parse(data as string));
    }, []);
	const handleMovePaddle = useCallback((data: ReactUnityEventParameter) => {
        socket.emit('movePaddle', JSON.parse(data as string));
    }, []);
	const handleBallHit = useCallback((data: ReactUnityEventParameter) => {
        socket.emit('ballHit', JSON.parse(data as string));
		console.log('ballHit From Unity : ', data)
    }, []);
	
	// unity to react
    useEffect(() => {
		addEventListener('Init', Init);
		addEventListener('MovePaddle', handleMovePaddle);
		addEventListener('ValidCheck', handleValidCheck);
		addEventListener('BallHit', handleBallHit);
        addEventListener('UnityException', handleUnityException);
        return () => {
			removeEventListener('Init', Init);
			removeEventListener('MovePaddle', handleMovePaddle);
			removeEventListener('ValidCheck', handleValidCheck);
			removeEventListener('BallHit', handleBallHit);
            removeEventListener('UnityException', handleUnityException);
        };
    }, [addEventListener, removeEventListener, handleUnityException, handleValidCheck, handleMovePaddle, Init, handleBallHit]);
	
    return (
        <>
            {gameOver === true && <h2>{'Game Over!'}</h2>}
            <button
                onClick={() => {
                    setIsReady(true);
                    socket.emit('getReady');
                }}
                disabled={isReady}
            >
                Get Ready
            </button>
            <Unity
                unityProvider={unityProvider}
                style={{ width: 800, height: 450 }}
            />
        </>
    );
};

export default Game;
