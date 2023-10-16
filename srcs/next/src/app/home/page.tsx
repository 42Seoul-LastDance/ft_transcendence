'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../redux/store';
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
import { JoinStatus } from '../interface';
import { setIsMatched } from '../redux/matchSlice';
import AutoAlert from './alert';
import { Button, CircularProgress, LinearProgress } from '@mui/material';
// import DMPage from './(dm)/dmPage';

const HomeContent = () => {
  const myName = useSelector((state: RootState) => state.user.userName);
  const dispatch = useDispatch();
  const [render, setRender] = useState<boolean | undefined>(false);

  useEffect(() => {
    dispatch(setIsMatched({ isMatched: false }));
  }, []);

  // useEffect(() => {
  //   setRender(superSocket?.connected);
  // }, [superSocket]);

  return (
    <>
      {/* {render ? ( */}
      <>
        <UserProfile targetName={myName!} />
        <br />
        <Link href="/game">
          <Button variant="outlined" color="secondary">
            Play Game!
          </Button>
        </Link>
        <br />
        <div style={{ display: 'flex' }}>
          <ChatSocketProvider>
            <ChattingTabs />
          </ChatSocketProvider>
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
      <Provider store={store}>
        <SuperSocketProvider>
          {/* <ChatSocketProvider> */}
          <AutoAlert severity={'warning'} />
          <HomeContent />
          {/* </ChatSocketProvider> */}
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default MainHome;
