'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameSocket } from '../../SSock';
import { Socket } from 'socket.io-client';
import { Provider, useDispatch } from 'react-redux';
import { store, useAppSelector } from '../../Redux/store';
import { setSide } from '../../Redux/matchSlice';

enum GameMode {
    NONE = -1,
    NORMAL = 0,
    HARD = 1,
}

const socket: Socket = getGameSocket();

const MatchingHomeContent = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    if (!socket.hasListeners('handShake')) {
        socket.on('handShake', (json: JSON) => {
            const str: string = JSON.stringify(json);
            dispatch(setSide({ side: str }));
            console.log(str);
            router.push('/game/room');
        });
    }

    return (
        <>
            <h1> Matching... </h1>
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
