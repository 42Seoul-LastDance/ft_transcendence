'use client';

import { Provider, useSelector } from 'react-redux';
import store, { RootState } from '../redux/store';
import Matching from './Matching';
import GameSocketProvider from '../context/gameSocketContext';
import Game from './Game';
import { io } from 'socket.io-client';
import { BACK_URL } from '../globals';

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
