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
import { useEffect } from 'react';
import { JoinStatus } from '../interface';
import { setIsMatched } from '../redux/matchSlice';
import AutoAlert from './alert';
import { CircularProgress } from '@mui/material';
// import DMPage from './(dm)/dmPage';

const HomeContent = () => {
  const joinStatus = useSelector((state: RootState) => state.user.join);
  const myName = useSelector((state: RootState) => state.user.userName);
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const superSocket = useSuperSocket();

  useEffect(() => {
    dispatch(setIsMatched({ isMatched: false }));
  }, []);

  return (
    <>
      {superSocket?.connected ? (
        <>
          <UserProfile targetName={myName!} />
          <br />

          <Link href="/game">
            <button>Play Game!</button>
          </Link>
          <br />

          <div style={{ display: 'flex' }}>
            <ChattingTabs />
            {joinStatus === JoinStatus.CHAT && (
              <ChattingPage socket={chatSocket} />
            )}
            {joinStatus === JoinStatus.DM && (
              <ChattingPage socket={superSocket} />
            )}
          </div>
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

const MainHome = () => {
  return (
    <>
      <Provider store={store}>
        <SuperSocketProvider>
          <ChatSocketProvider>
            <AutoAlert severity={'warning'} />
            <HomeContent />
          </ChatSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default MainHome;
