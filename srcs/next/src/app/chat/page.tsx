'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../redux/store';
import ChattingTabs from './chattingTabs';
import ChattingContent from './chattingPage';
import {
  ChatSocketProvider,
  useChatSocket,
} from '../Context/ChatSocketContext';
import { setRoomNameList } from '../redux/roomSlice';

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

const ChatHome = () => {
  return (
    <>
      <Provider store={store}>
        <ChatSocketProvider>
          <ChatHomeContent />
        </ChatSocketProvider>
      </Provider>
    </>
  );
};

export default ChatHome;
