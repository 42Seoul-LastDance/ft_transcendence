'use client';

import { Provider, useSelector } from 'react-redux';
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
import { use, useEffect } from 'react';
import { ChattingPageProps, JoinStatus } from '../interface';

const HomeContent = () => {
  const joinStatus = useSelector((state: RootState) => state.user.join);
  const myName = useSelector((state: RootState) => state.user.userName);
  const chatSocket = useChatSocket();
  const superSocket = useSuperSocket();
  const nullMessages: string[] = [];

  return (
    <>
      {/* <Link href="../profile">
        <button>My Profile</button>
      </Link> */}
      <UserProfile targetName={myName!} />
      <br />
      <br />

      <div style={{ display: 'flex' }}>
        <ChattingTabs />
        {joinStatus === JoinStatus.CHAT && <ChattingPage socket={chatSocket} />}
        {joinStatus === JoinStatus.DM && <ChattingPage socket={superSocket} />}
      </div>
    </>
  );
};

const MainHome = () => {
  return (
    <>
      <Provider store={store}>
        <SuperSocketProvider>
          <ChatSocketProvider>
            <HomeContent />
          </ChatSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default MainHome;
