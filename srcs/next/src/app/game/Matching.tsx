'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { Provider, useDispatch } from 'react-redux';
import { store, useAppSelector } from '../Redux/store';
import { setIsMatched, setSide } from '../Redux/matchSlice';
import { useGameSocket } from '../Contexts/GameSocketContext';

enum GameMode {
    NONE = -1,
    NORMAL = 0,
    HARD = 1,
}

interface MatchingProps {
    socket: Socket | undefined;
}

//const Matching: React.FC<MatchingProps> = (props) => {
const Matching = () => {
    const [isMatching, setIsMatching] = useState<boolean>(false);
    const isCustomGame = useAppSelector((state) => state.match.isCustom);
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
                                username: 'kwsong',
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
                                username: 'kwsong',
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
