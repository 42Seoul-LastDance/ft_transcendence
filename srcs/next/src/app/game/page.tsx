'use client';

import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../redux/store';
import Matching from './Matching';
import { GameSocketProvider } from '../Contexts/gameSocketContext';
import Game from './Game';

const GameHomeContent = () => {
    const isMatched = useSelector((state: RootState) => state.match.isMatched);

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
