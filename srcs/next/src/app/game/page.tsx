'use client';

import { Provider, useSelector, useDispatch } from 'react-redux';
import store, { RootState } from '../redux/store';
import Matching from './Matching';
import GameSocketProvider, {
  useGameSocket,
} from '../contexts/gameSocketContext';
import Game from './Game';
import { GameJoinMode, InviteType } from '../enums';
import { useEffect } from 'react';
import {
  setIsMatchInProgress,
  setIsMatched,
} from '../redux/matchSlice';
import SuperSocketProvider, {
  useSuperSocket,
} from '../contexts/superSocketContext';
import AutoAlert, { myAlert } from '../home/alert';

const GameHomeContent = () => {
  const isMatched = useSelector((state: RootState) => state.match.isMatched);
  const dispatch = useDispatch();
  const customSet = useSelector((state: RootState) => state.match.customSet);
  const superSocket = useSuperSocket();

  useEffect(() => {
    if (customSet.joinMode === GameJoinMode.CUSTOM_SEND) {
      dispatch(setIsMatched({ isMatched: false }));
      dispatch(setIsMatchInProgress({ isMatchInProgress: true }));

      superSocket?.emit('sendInvitation', {
        slackId: customSet.opponentSlackId,
        inviteType: InviteType.GAME,
        chatRoomName: undefined,
        chatRoomType: undefined,
        gameMode: customSet.gameMode,
      });
      myAlert('success', '상대방을 게임에 초대했습니다', dispatch);
    } else if (customSet.joinMode === GameJoinMode.CUSTOM_RECV) {
      dispatch(setIsMatched({ isMatched: undefined }));
      myAlert('success', '게임 초대를 수락했습니다', dispatch);
    } else dispatch(setIsMatched({ isMatched: false }));
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
        <SuperSocketProvider>
          <GameSocketProvider>
            <AutoAlert severity={'warning'} />
            <GameHomeContent />
          </GameSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default GameHome;
