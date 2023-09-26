'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { setIsMatched } from '../Redux/matchSlice';
import { useGameSocket } from '../Contexts/GameSocketContext';

enum GameMode {
    NONE = -1,
    NORMAL = 0,
    HARD = 1,
}

const Matching = () => {
    const [isMatching, setIsMatching] = useState<boolean>(false);
    const isCustomGame = useSelector((state: RootState) => state.match.isCustom);
	const isMatched = useSelector((state: RootState) => state.match.isCustom);
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
