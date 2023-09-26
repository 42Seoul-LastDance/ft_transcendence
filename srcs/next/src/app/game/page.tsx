'use client';

import { useState, useCallback, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { store, useAppSelector } from '../Redux/store';
import { Socket } from 'socket.io-client';
import { setSide } from '../Redux/matchSlice';
import { Unity, useUnityContext } from 'react-unity-webgl';
import Matching from './Matching';
import { GameSocketProvider } from '../Contexts/GameSocketContext';
import Game from './Game';

const GameHomeContent = () => {
    const isMathched = useAppSelector((state) => state.match.isMatched);
    const dispatch = useDispatch();
    // var socket: Socket | undefined;

    // useEffect(() => {
    //     socket = getGameSocket();
    //     dispatch(setIsChanged({ isChanged: true }));
    //     return () => {
    //         disconnectGameSocket();
    //         dispatch(setIsChanged({ isChanged: true }));
    //     };
    // }, []);

    // useEffect(() => {
    //     return () => {
    //         disconnectGameSocket();
    //     };
    // }, []);

    return <>{!isMathched ? <Matching /> : <Game />}</>;
};

const GameHome = () => {
    return (
        <>
            <Provider store={store}>
                <GameSocketProvider>
                    <GameHomeContent />
                    {/* 이러면 이 안에서 소켓 쓸 수 있음 리덕스마냥 */}
                </GameSocketProvider>
            </Provider>
        </>
    );
};

export default GameHome;
