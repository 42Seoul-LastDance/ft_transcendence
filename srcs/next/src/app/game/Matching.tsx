'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setIsMatchInProgress,
  setIsMatched,
  setSide,
} from '../redux/matchSlice';
import { GameJoinMode, GameMode, HandShakeJson } from '../Enums';
import { useGameSocket } from '../context/gameSocketContext';
import CircularProgress from '@mui/material/CircularProgress';
import { Button } from '@mui/material';

const Matching = () => {
  // const [isMatching, setIsMatching] = useState<boolean>(false);
  const customSet = useSelector((state: RootState) => state.match.customSet);
  const isMatchInProgress = useSelector(
    (state: RootState) => state.match.isMatchInProgress,
  );
  const dispatch = useDispatch();
  const gameSocket = useGameSocket();

  useEffect(() => {
    if (
      customSet.joinMode === GameJoinMode.CUSTOM_RECV ||
      customSet.joinMode === GameJoinMode.CUSTOM_SEND
    )
      dispatch(setIsMatchInProgress({ isMatchInProgress: true }));
  }, []);

  return (
    <>
      {!isMatchInProgress ? (
        <>
          <Button
            onClick={() => {
              dispatch(setIsMatchInProgress({ isMatchInProgress: true }));
              gameSocket?.emit('pushQueue', {
                gameMode: GameMode.NORMAL,
              });
            }}
          >
            Normal Matching
          </Button>
          <Button
            onClick={() => {
              dispatch(setIsMatchInProgress({ isMatchInProgress: true }));
              gameSocket?.emit('pushQueue', {
                gameMode: GameMode.HARD,
              });
            }}
          >
            Hard Matching
          </Button>
        </>
      ) : (
        <>
          <div>
            {/* 연습게임 넣을 예정 */}
            <CircularProgress />
          </div>
          {customSet.joinMode === GameJoinMode.CUSTOM_RECV ||
          customSet.joinMode === GameJoinMode.CUSTOM_SEND ? (
            <>
              <h1> Waiting... </h1>
              <Button
                onClick={() => {
                  dispatch(setIsMatchInProgress({ isMatchInProgress: false }));
                  gameSocket?.emit('quitInvite');
                }}
              >
                Cancel Invite
              </Button>
            </>
          ) : (
            <>
              <h1> Matching... </h1>
              <Button
                onClick={() => {
                  dispatch(setIsMatchInProgress({ isMatchInProgress: false }));
                  gameSocket?.emit('popQueue');
                }}
              >
                Cancel Matching
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Matching;
