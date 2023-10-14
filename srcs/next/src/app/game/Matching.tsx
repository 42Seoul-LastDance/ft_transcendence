'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setIsMatched, setSide } from '../redux/matchSlice';
import { useGameSocket } from '../context/gameSocketContext';
import { GameMode, HandShakeJson } from '../Enums';
import CircularProgress from '@mui/material/CircularProgress';
import { Button } from '@mui/material';

const Matching = () => {
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const isCustomGame = useSelector((state: RootState) => state.match.isCustom);
  const isMatched = useSelector((state: RootState) => state.match.isCustom);
  const dispatch = useDispatch();

  const socket = useGameSocket();

  if (!socket?.hasListeners('handShake')) {
    socket?.on('handShake', (json: HandShakeJson) => {
      dispatch(setSide({ side: json.side }));
      dispatch(setIsMatched({ isMatched: true }));
    });
  }

  return (
    <>
      {!isMatching && !isCustomGame ? (
        <>
          <Button
            onClick={() => {
              setIsMatching(true);
              socket?.emit('pushQueue', {
                gameMode: GameMode.NORMAL,
              });
            }}
          >
            Normal Matching
          </Button>
          <Button
            onClick={() => {
              setIsMatching(true);
              socket?.emit('pushQueue', {
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
            <h1> Matching... </h1>
            <CircularProgress />
          </div>
          <Button
            onClick={() => {
              setIsMatching(false);
              socket?.emit('popQueue');
            }}
          >
            Cancel Matching
          </Button>
        </>
      )}
    </>
  );
};

export default Matching;
