'use client';

import { useState, useCallback, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { store } from '../Redux/store';
import { Socket } from 'socket.io-client';
import { setSide, MatchState } from '../Redux/matchSlice';
import { Unity, useUnityContext } from 'react-unity-webgl';
import Matching from './Matching';
import { GameSocketProvider } from '../Contexts/GameSocketContext';
import Game from './Game';

const GameHomeContent = () => {
    const isMatched = useSelector((state: MatchState) => state.isMatched);

    return <>{!isMatched ? <Matching /> : <Game />}</>;
};

const GameHome = () => {
    return (
        <>
            <Provider store={store}>
                <GameSocketProvider>
                    <GameHomeContent />
                </GameSocketProvider>
            </Provider>
        </>
    );
};

export default GameHome;
