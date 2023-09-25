'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameSocket } from '../../SSock';
import { Socket } from 'socket.io-client';
import { Provider, useDispatch } from 'react-redux';
import { store, useAppSelector } from '../../Redux/store';
import { start, setSide } from '../../Redux/matchSlice';

enum GameMode {
    NONE = -1,
    NORMAL = 0,
    HARD = 1,
}

// var socket: Socket;

const socket: Socket = getGameSocket();
socket.emit('pushQueue', {
    gameMode: GameMode.NORMAL,
    username: 'kwsong',
});

const MatchingHomeContent = () => {
    const isStarted = useAppSelector((state) => state.match.isStarted);
    const side = useAppSelector((state) => state.match.side);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        router.push('/game/room');
    }, [side]);

    useEffect(() => {
        if (!socket.hasListeners('handShake')) {
            socket.on('handShake', (json: JSON) => {
                const str: string = JSON.stringify(json);
                dispatch(setSide({ side: str }));
            });
        }
    }, [router]);

    return (
        <>
            <h1> 매칭 중입니다... </h1>
        </>
    );
};

const MatchingHome = () => {
    return (
        <>
            <Provider store={store}>
                <MatchingHomeContent />
            </Provider>
        </>
    );
};

export default MatchingHome;

// useEffect(() => {
//     socket = getGameSocket();
//     socket.on('handShake', (json: JSON) => {
//         router.push({
//     pathname: '../room',
//     query: { data: JSON.stringify(json) },
// });
//     });
//     socket.emit('pushQueue', {
//         gameMode: GameMode.NORMAL,
//         username: 'kwsong',
//     });
// }, []);
