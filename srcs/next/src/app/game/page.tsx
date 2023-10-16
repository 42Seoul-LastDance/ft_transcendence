'use client';

import { Provider, useSelector, useDispatch } from 'react-redux';
import store, { RootState } from '../redux/store';
import Matching from './Matching';
import GameSocketProvider, {
  useGameSocket,
} from '../context/gameSocketContext';
import Game from './Game';
import { useSearchParams } from '../../../node_modules/next/navigation';
import { GameJoinMode, HandShakeJson } from '../Enums';
import { useEffect } from 'react';
import { setIsMatched, setSide } from '../redux/matchSlice';

const GameHomeContent = () => {
  const isMatched = useSelector((state: RootState) => state.match.isMatched);
  const dispatch = useDispatch();
  const gameSocket = useGameSocket();
  const searchParams = useSearchParams();
  const customSet = useSelector((state: RootState) => state.match.customSet);

  useEffect(() => {
    if (!gameSocket?.hasListeners('handShake')) {
      gameSocket?.on('handShake', (json: HandShakeJson) => {
        dispatch(setSide({ side: json.side }));
        dispatch(setIsMatched({ isMatched: true }));
      });
    }

    if (customSet.joinMode === GameJoinMode.CUSTOM_SEND) {
      dispatch(setIsMatched({ isMatched: false }));
      gameSocket?.emit('inviteGame', {
        gameMode: customSet.gameMode,
        friendName: customSet.opponentName,
      });
    } else if (customSet.joinMode === GameJoinMode.CUSTOM_RECV) {
      gameSocket?.emit('agreeInvite', {
        friendName: customSet.opponentName,
      });
    } else dispatch(setIsMatched({ isMatched: false }));

    console.log('/game url data', customSet);
  }, []);

  return (
    <>
      {isMatched === false && <Matching />}
      {isMatched === true && <Game />}
    </>
  );
};

const GameHome = () => {
  return (
    <>
      <Provider store={store}>
        {/* <SuperSocketProvider> */}
        <GameSocketProvider>
          <GameHomeContent />
        </GameSocketProvider>
        {/* </SuperSocketProvider> */}
      </Provider>
    </>
  );
};

export default GameHome;
