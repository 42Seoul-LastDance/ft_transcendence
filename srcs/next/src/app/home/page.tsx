'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import ChattingTabs from './(chat)/chattingTabs';
import ChattingPage from './(chat)/chattingPage';
import ChatSocketProvider, {
  useChatSocket,
} from '../context/chatSocketContext';
import SuperSocketProvider, {
  useSuperSocket,
} from '../context/superSocketContext';
import Link from 'next/link';
import UserProfile from './(profile)/userProfile';
import { useEffect, useState } from 'react';
import { JoinStatus, RoomStatus } from '../interface';
import { setIsMatched } from '../redux/matchSlice';
import HeaderAlert from './alert';
import { Button, Grid, LinearProgress } from '@mui/material';
import { setJoin } from '../redux/userSlice';
import { useGameSocket } from '../context/gameSocketContext';

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
  }, []);

  // useEffect(() => {
  //   setRender(superSocket?.connected);
  // }, [superSocket]);

  return (
    <>
      {/* {render ? ( */}
      <>
        <br />
        <Link href="/game">
          <Grid container justifyContent="center">
            <Button variant="outlined" color="secondary">
              버튼
            </Button>
          </Grid>
        </Link>
        <br />
        <div>
          <ChattingTabs />
        </div>
      </>
      {/* ) : (
        <LinearProgress />
      )} */}
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
