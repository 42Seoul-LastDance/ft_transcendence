'use client';

import { useState, useCallback, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { store, useAppSelector } from '../Redux/store';
import { getGameSocket, disconnectGameSocket } from '../SSock';
import { Socket } from 'socket.io-client';
import { setIsChanged } from '../Redux/socketSlice';
import { setSide } from '../Redux/matchSlice';
import { Unity, useUnityContext } from 'react-unity-webgl';
import Matching from './Matching';
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
                <GameHomeContent />
            </Provider>
        </>
    );
};

export default GameHome;
