'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import ChattingTabs from './(chat)/chattingTabs';
import ChatSocketProvider, { useChatSocket } from '../contexts/chatSocketContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { setCustomSet, setIsMatchInProgress, setIsMatched } from '../redux/matchSlice';
import HeaderAlert from './alert';
import {
  Button,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import { setJoin } from '../redux/userSlice';
import { useGameSocket } from '../contexts/gameSocketContext';
import { GameJoinMode, GameMode, JoinStatus, RoomStatus } from '../enums';
import { useRouter } from 'next/navigation';
import RocketIcon from '@mui/icons-material/Rocket';

const HomeContent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const chatSocket = useChatSocket();
  const gameSocket = useGameSocket();
  const [render, setRender] = useState<boolean | undefined>(false);

  const disconnectGame = () => {
	if (gameSocket?.connected) gameSocket.disconnect();
    dispatch(setIsMatched({ isMatched: false }));
	dispatch(setIsMatchInProgress({isMatchInProgress: false}));
    dispatch(setJoin(JoinStatus.NONE));
  }

  const clickGame = () => {
	chatSocket?.disconnect();
	dispatch(
		setCustomSet({
		  joinMode: GameJoinMode.MATCH,
		  gameMode: GameMode.NONE,
		  opponentName: undefined,
		  opponentSlackId: undefined,
		}),
	  );
	router.push('/game');
  }

  useEffect(() => {
	disconnectGame();
    setRender(true);
    chatSocket?.emit('getChatRoomList', {
      roomStatus: RoomStatus.PUBLIC,
    });
    return () => setRender(false);
  }, []);

  return (
    <>
      {render ? (
        <>
          <br />
          <Grid container justifyContent="center" sx={{ margin: '20px' }}>
            <Button
              className={'game-button'}
              sx={{ borderRadius: '15px' }}
              variant="contained"
              color="secondary"
              onClick={clickGame}
            >
              <Typography variant="h5" sx={{ color: '#a8336c' }}>
                Game
              </Typography>
              <RocketIcon sx={{ ml: '10px', color: '#a8336c' }} />
            </Button>
          </Grid>
          <br />
          <div>
            <ChattingTabs />
          </div>
        </>
      ) : (
        <LinearProgress sx={{ color: '#ffbf06' }} />
      )}
    </>
  );
};

const MainHome = () => {
  return (
    <>
      <HomeContent />
      <HeaderAlert severity={'warning'} />
    </>
  );
};

export default MainHome;
