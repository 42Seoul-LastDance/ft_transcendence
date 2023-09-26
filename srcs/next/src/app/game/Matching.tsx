'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from '../Redux/store';
import { setIsMatched, setSide, MatchState } from '../Redux/matchSlice';
import { useGameSocket } from '../Contexts/GameSocketContext';

enum GameMode {
    NONE = -1,
    NORMAL = 0,
    HARD = 1,
}

const Matching = () => {
    const [isMatching, setIsMatching] = useState<boolean>(false);
    const isCustomGame = useSelector((state: MatchState) => state.isCustom);
    const dispatch = useDispatch();

    const socket = useGameSocket();

    if (!socket.hasListeners('handShake')) {
        socket.on('handShake', () => {
            dispatch(setIsMatched({ isMatched: true }));
        });
    }

    return (
        <>
            {!isMatching && !isCustomGame ? (
                <>
                    <button
                        onClick={() => {
                            setIsMatching(true);
                            socket.emit('pushQueue', {
                                gameMode: GameMode.NORMAL,
                                // userSlice에서 받아온 ID
                                userId: 'kwsong',
                            });
                        }}
                    >
                        Normal Matching
                    </button>
                    <button
                        onClick={() => {
                            setIsMatching(true);
                            socket.emit('pushQueue', {
                                gameMode: GameMode.HARD,
                                // userSlice에서 받아온 ID
                                userId: 'kwsong',
                            });
                        }}
                    >
                        Hard Matching
                    </button>
                </>
            ) : (
                <>
                    <h1> Matching... </h1>
                    <button
                        onClick={() => {
                            setIsMatching(false);
                            socket.emit('popQueue');
                        }}
                    >
                        Cancel Matching
                    </button>
                </>
            )}
        </>
    );
};

export default Matching;
