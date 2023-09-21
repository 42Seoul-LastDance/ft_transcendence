'use client';

import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { getGameSocket } from './SSock';
import { Socket } from 'socket.io-client';

function Game() {
    const {
        unityProvider,
        sendMessage,
        addEventListener,
        removeEventListener,
    } = useUnityContext({
        loaderUrl: 'build/Pong.loader.js',
        dataUrl: 'build/Pong.data.unityweb',
        frameworkUrl: 'build/Pong.framework.js.unityweb',
        codeUrl: 'build/Pong.wasm.unityweb',
    });

    const [gameOver, setGameOver] = useState<boolean | undefined>(undefined);
	const socket: Socket = getGameSocket();
	console.log('is connected ', socket.connect)
    // react to unity
    socket.on('StartGame', () => {
        sendMessage('GameManager', 'StartGame');
		console.log('! StartGame Event Detected');
    });
    socket.on('RestartGame', () => {
        sendMessage('GameManager', 'RestartGame');
        setGameOver(false);
		console.log('! GameManager Event Detected');
    });
    socket.on('GameOver', () => {
        setGameOver(true);
		console.log('! GameOver Event Detected');
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

    return (
        <Fragment>
            <div className="Game">
                {gameOver === true && <p>{`Game Over!`}</p>}
                <button
                    onClick={() => {
                        socket.emit('StartGame', 'hi');
						console.log('Start Button Clicked');
                    }}
                >
                    시작
                </button>
                <button
                    onClick={() => {
                        socket.emit('RestartGame', 'hi');
						console.log('Restart Button Clicked');
                    }}
                >
                    재시작
                </button>
                <Unity
                    unityProvider={unityProvider}
                    style={{ width: 1280, height: 720 }}
                />
            </div>
        </Fragment>
    );
}

export default Game;
