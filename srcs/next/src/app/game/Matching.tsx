'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setIsMatched, setSide } from '../redux/matchSlice';
import { useGameSocket } from '../context/gameSocketContext';
import { GameMode, HandShakeJson } from '../Enums';
import CircularProgress from '@mui/material/CircularProgress';

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
          <button
            onClick={() => {
              setIsMatching(true);
              socket?.emit('pushQueue', {
                gameMode: GameMode.NORMAL,
              });
            }}
          >
            Normal Matching
          </button>
          <button
            onClick={() => {
              setIsMatching(true);
              socket?.emit('pushQueue', {
                gameMode: GameMode.HARD,
              });
            }}
          >
            Hard Matching
          </button>
        </>
      ) : (
        <>
          <div>
            <h1> Matching... </h1>
            <CircularProgress />
          </div>
          <button
            onClick={() => {
              setIsMatching(false);
              socket?.emit('popQueue');
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
