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
import { JoinStatus, RoomStatus } from '../interface';
import { setIsMatched } from '../redux/matchSlice';
import { IoEventListener } from '../context/socket';
import { setChatRoom, setJoin } from '../redux/userSlice';
import AutoAlert, { myAlert } from './alert';
import { setChatMessages, setRoomNameList } from '../redux/roomSlice';

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
      <UserProfile targetName={myName!} />
      <br />

      <Link href="/game">
        <button>Play Game!</button>
      </Link>
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
            <AutoAlert severity={'warning'} />
            <HomeContent />
          </ChatSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default MainHome;
