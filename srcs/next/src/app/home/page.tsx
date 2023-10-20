'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import ChattingTabs from './(chat)/chattingTabs';
import {
  useChatSocket,
} from '../contexts/chatSocketContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { setIsMatched } from '../redux/matchSlice';
import HeaderAlert from './alert';
import { Button, Grid, LinearProgress } from '@mui/material';
import { setJoin } from '../redux/userSlice';
import { useGameSocket } from '../contexts/gameSocketContext';
import { JoinStatus, RoomStatus } from '../enums';
import { useRouter } from 'next/navigation';

const HomeContent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
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
            <Grid container justifyContent="center">
              <Button variant="contained" color="secondary" onClick={()=>{
				router.push('/game')
			  }}>
                Start Game !
              </Button>
            </Grid>
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
