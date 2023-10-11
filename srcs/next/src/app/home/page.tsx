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
import { IoEventListener } from '../context/socket';
import HeaderAlert, { myAlert } from './alert';
import { setChatMessages } from '../redux/roomSlice';
import { setChatRoom, setJoin } from '../redux/userSlice';
import { LinearProgress } from '@mui/material';

const HomeContent = () => {
  const joinStatus = useSelector((state: RootState) => state.user.join);
  const myName = useSelector((state: RootState) => state.user.userName);
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const superSocket = useSuperSocket();
  const Loading = true;

  IoEventListener(chatSocket!, 'explodeRoom', () => {
    myAlert('info', '방장이 방을 폭파했습니다.', dispatch);
    dispatch(setJoin(JoinStatus.NONE));
    dispatch(setChatRoom(null));
    dispatch(setChatMessages([]));
  });

  useEffect(() => {
    dispatch(setIsMatched({ isMatched: false }));
  }, []);

  return Loading ? (
    <div>
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
    </div>
  ) : (
    <LinearProgress />
  );
};

const MainHome: React.FC = () => {
  return (
    <>
      <Provider store={store}>
        <SuperSocketProvider>
          <ChatSocketProvider>
            <HeaderAlert severity={'warning'} />
            <HomeContent />
          </ChatSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default MainHome;
