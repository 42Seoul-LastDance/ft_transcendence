'use client';

import { Provider, useSelector } from 'react-redux';
import store, { RootState } from '../redux/store';
import ChattingTabs from './chattingTabs';
import ChattingContent from './chattingPage';
import ChatSocketProvider from '../context/chatSocketContext';
import SuperSocketProvider from '../context/superSocketContext';

const ChatHomeContent = () => {
  const isJoined = useSelector((state: RootState) => state.room.isJoined);

  return (
    <>
      <div style={{ display: 'flex' }}>
        <ChattingTabs />
        {isJoined ? <ChattingContent /> : <></>}
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
            <ChatHomeContent />
          </ChatSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default MainHome;
