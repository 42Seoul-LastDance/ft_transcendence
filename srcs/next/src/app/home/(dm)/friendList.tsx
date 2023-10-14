'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { JoinStatus, UserStatus } from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';
import { Avatar, Grow, makeStyles } from '@mui/material';
import { setFriend } from '@/app/redux/dmSlice';
import { clearSocketEvent, registerSocketEvent } from '@/app/context/socket';
import { RootState } from '@/app/redux/store';

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
        once: true,
        callback: (data: string[][]) => {
          setFriendList(data);
        },
      },
      {
        event: 'updateFriendStateList',
        once: true,
        callback: () => {
          superSocket?.emit('getFriendStateList', myName);
        },
      },
    ];

    registerSocketEvent(superSocket!, eventListeners);
    superSocket?.emit('getFriendStateList', myName);
    return () => {
      clearSocketEvent(superSocket!, eventListeners);
    };
  }, [join]);

  const handleStartDM = (friendName: string) => {
    dispatch(setFriend(friendName));
    dispatch(setJoin(JoinStatus.DM));
  };

  return (
    <>
      {friendList.map((curFriend, rowIdx) => (
        <Grow in={true} timeout={500 * (rowIdx + 1)} key={rowIdx}>
          <ListItem
            divider
            onClick={() => {
              handleStartDM(curFriend[0]);
            }}
          >
            <ListItemText primary={curFriend[0]} />
            <Avatar
              sx={{
                width: 15,
                height: 15,
                bgcolor:
                  curFriend[1] === UserStatus.ONLINE
                    ? '#4caf50'
                    : curFriend[1] === UserStatus.GAME
                    ? '#ffeb3b'
                    : curFriend[1] === UserStatus.OFFLINE
                    ? '#9e9e9e'
                    : 'transparent',
              }}
            >
              {' '}
            </Avatar>
          </ListItem>
        </Grow>
      ))}
    </>
  );
};

export default FriendList;
