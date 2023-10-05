'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../redux/store';
import ChattingTabs from './chattingTabs';
import ChattingContent from './chattingPage';
import {
  ChatSocketProvider,
  useChatSocket,
} from '../context/chatSocketContext';
import {
  SuperSocketProvider,
  useSuperSocket,
} from '../context/superSocketContext';
import { useEffect } from 'react';

const ChatHomeContent = () => {
  const dispatch = useDispatch();
  const isJoined = useSelector((state: RootState) => state.room.isJoined);
  const chatSocket = useChatSocket();

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
  window.onpopstate = function(event) {
    window.history.pushState(null, '', window.location.href);
  }

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
