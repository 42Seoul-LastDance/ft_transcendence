'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import sendRequest from '../../api';
import { useRouter } from 'next/navigation';
import { JoinStatus, UserStatus } from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';
import { Avatar } from '@mui/material';
import { setFriend } from '@/app/redux/dmSlice';
import { IoEventListener, IoEventOnce } from '@/app/context/socket';
import { RootState } from '@/app/redux/store';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const FriendList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();
  const [friendList, setFriendList] = useState<string[][]>([]);
  const myName = useSelector((state: RootState) => state.user.userName);
  const join = useSelector((state: RootState) => state.user.join);

  useEffect(() => {
    console.log('--------- friendList component ---------');
    const eventListeners = [
      {
        event: 'getFriendStateList',
        callback: (data: string[][]) => {
          setFriendList(data);
        },
      },
    ];

    // 소켓 이벤트 등록
    eventListeners.forEach((listener) => {
      IoEventOnce(superSocket!, listener.event, listener.callback);
    });

    superSocket?.emit('getFriendStateList', myName);
    return () => {};
  }, [join]);

  IoEventListener(superSocket!, 'updateFriendList', () => {
    console.log('mymymym', myName);
    superSocket?.emit('getFriendStateList', myName);
  });

  return (
    <>
      {friendList.map((curFriend: string[], rowIdx: number) => (
        <List key={rowIdx}>
          <ListItem
            key={rowIdx}
            divider
            onClick={() => {
              dispatch(setFriend(curFriend[0]));
              dispatch(setJoin(JoinStatus.DM));
            }}
          >
            <ListItemText primary={`친구 이름: ${curFriend[0]}`} />
            {curFriend[1] === UserStatus.ONLINE ? (
              <Avatar sx={{ bgcolor: '#4caf50', width: 24, height: 24 }}>
                {' '}
              </Avatar>
            ) : null}
            {curFriend[1] === UserStatus.GAME ? (
              <Avatar sx={{ bgcolor: '#ffeb3b', width: 24, height: 24 }}>
                {' '}
              </Avatar>
            ) : null}
            {curFriend[1] === UserStatus.OFFLINE ? (
              <Avatar sx={{ bgcolor: '#9e9e9e', width: 24, height: 24 }}>
                {' '}
              </Avatar>
            ) : null}
          </ListItem>
        </List>
      ))}
    </>
  );
};

export default FriendList;
