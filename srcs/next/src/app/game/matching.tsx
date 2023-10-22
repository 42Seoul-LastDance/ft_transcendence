'use client';

import { useState, useEffect, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setIsMatchInProgress,
  setIsMatched,
  setSide,
} from '../redux/matchSlice';
import { GameJoinMode, GameMode, JoinStatus } from '../enums';
import { useGameSocket } from '../contexts/gameSocketContext';
import CircularProgress from '@mui/material/CircularProgress';
import { Button, Card, Grid, IconButton, Typography } from '@mui/material';
import { getDisplayName } from 'next/dist/shared/lib/utils';
import { useRouter } from 'next/navigation';

const Matching = () => {
  // const [isMatching, setIsMatching] = useState<boolean>(false);
  const router = useRouter();
  const customSet = useSelector((state: RootState) => state.match.customSet);
  const isMatchInProgress = useSelector(
    (state: RootState) => state.match.isMatchInProgress,
  );
  const dispatch = useDispatch();
  const gameSocket = useGameSocket();

  useEffect(() => {
    if (customSet.joinMode === GameJoinMode.CUSTOM_SEND)
      dispatch(setIsMatchInProgress({ isMatchInProgress: true }));
  }, []);

  const CirculStyle = {
    color: '#ffde80', // 노란색 배경
  };

  const cardContent = {
    margin: '40px',
    minWidth: '400px',
    height: '500px',
    borderRadius: '15px',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column', // 세로 중앙 정렬을 위한 설정
    alignItems: 'center', // 가로 중앙 정렬을 위한 설정
  };

  const buttonStyle = {
    width: '100px',
    height: '60px',
    borderRadius: '15px',
    fontWeight: 'bold', // 원하는 폰트 굵기로 설정 (예: 'bold')
  };

  return (
    <>
      {!isMatchInProgress ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Card sx={{ ...cardContent, bgcolor: '#ffde80' }}>
            <img
              src="/theme/easy.jpeg"
              width="350px"
              height="350px"
              style={{
                borderRadius: '8%',
                marginBottom: '20px',
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              size="large"
              className="yellow-hover"
              sx={{ ...buttonStyle }}
              onClick={() => {
                dispatch(setIsMatchInProgress({ isMatchInProgress: true }));
                gameSocket?.emit('pushQueue', {
                  gameMode: GameMode.NORMAL,
                });
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Normal
              </Typography>
            </Button>
          </Card>
          <Card sx={{ ...cardContent, bgcolor: '#ae5781' }}>
            <img
              src="/theme/hard.jpeg"
              width="350px"
              height="350px"
              style={{
                borderRadius: '8%',
                marginBottom: '20px',
              }}
            />
            <Button
              variant="contained"
              size="large"
              className="purple-hover"
              sx={{
                ...buttonStyle,
                color: 'black',
                bgcolor: '#ffbf06',
              }}
              onClick={() => {
                dispatch(setIsMatchInProgress({ isMatchInProgress: true }));
                gameSocket?.emit('pushQueue', {
                  gameMode: GameMode.HARD,
                });
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Hard
              </Typography>
            </Button>
          </Card>
        </div>
      ) : (
        <div>
          {/* 연습게임 넣을 예정 */}
          <CircularProgress sx={{ ...CirculStyle }} />
          {customSet.joinMode === GameJoinMode.CUSTOM_SEND ? (
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
                sx={{ ...buttonStyle, color: '#ffbf06' }}
                color="secondary"
                variant="contained"
                onClick={() => {
                  dispatch(setIsMatchInProgress({ isMatchInProgress: false }));
                  gameSocket?.emit('popQueue');
                }}
              >
                Cancel Matching
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Matching;
