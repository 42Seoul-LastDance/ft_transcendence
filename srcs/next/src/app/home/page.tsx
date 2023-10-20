'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import ChattingTabs from './(chat)/chattingTabs';
import ChattingPage from './(chat)/chattingPage';
import ChatSocketProvider, {
  useChatSocket,
} from '../contexts/chatSocketContext';
import SuperSocketProvider, {
  useSuperSocket,
} from '../contexts/superSocketContext';
import Link from 'next/link';
import UserProfile from './(profile)/userProfile';
import { useEffect, useState } from 'react';
import { setIsMatched } from '../redux/matchSlice';
import HeaderAlert from './alert';
import { Button, Grid, LinearProgress } from '@mui/material';
import { setJoin } from '../redux/userSlice';
import { useGameSocket } from '../contexts/gameSocketContext';
import { JoinStatus, RoomStatus } from '../enums';

const HomeContent = () => {
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const gameSocket = useGameSocket();
  const [render, setRender] = useState<boolean | undefined>(false);

  useEffect(() => {
    if (gameSocket?.connected) gameSocket.disconnect();
    dispatch(setIsMatched({ isMatched: false }));
    dispatch(setJoin(JoinStatus.NONE));
    chatSocket?.emit('getChatRoomList', {
      roomStatus: RoomStatus.PUBLIC,
    });
    setRender(true);
    return () => setRender(false);
  }, []);

  return (
    <>
      {render ? (
        <>
          <br />
          <Link href="/game">
            <Grid container justifyContent="center">
              <Button variant="contained" color="secondary">
                Start Game !
              </Button>
            </Grid>
          </Link>
          <br />
          <div>
            <ChattingTabs />
          </div>
        </>
      ) : (
        <LinearProgress />
      )}
    </>
  );
};

const MainHome = () => {
  return (
    <>
      <HeaderAlert severity={'warning'} />
      <HomeContent />
    </>
  );
};

export default MainHome;
