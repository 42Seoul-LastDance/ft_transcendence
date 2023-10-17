'use client';

import React, { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { Events, JoinStatus, UserStatus } from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Avatar, Grow, IconButton } from '@mui/material';
import { setFriend } from '@/app/redux/dmSlice';
import { clearSocketEvent, registerSocketEvent } from '@/app/context/socket';
import { RootState } from '@/app/redux/store';
import sendRequest from '@/app/api';
import { useRouter } from 'next/navigation';
import { myAlert } from '../alert';
import { FriendListType, setFriendList } from '@/app/redux/friendSlice';

const FriendList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();
  const friendList = useSelector((state: RootState) => state.friend.friendList);
  const myName = useSelector((state: RootState) => state.user.userName);
  const join = useSelector((state: RootState) => state.user.join);
  const router = useRouter();

  useEffect(() => {
    console.log('--------- friendList component ---------');
    const e: Events[] = [
      {
        event: 'getFriendStateList',
        callback: (data: string[][]) => {
          dispatch(setFriendList(data));
        },
      },
      {
        event: 'updateFriendList',
        callback: () => {
          superSocket?.emit('getFriendStateList', myName);
        },
      },
    ];

    registerSocketEvent(superSocket!, e);
    return () => {
      clearSocketEvent(superSocket!, e);
    };
  }, [join]);

  useEffect(() => {
    superSocket?.emit('getFriendStateList', myName);
  }, []);

  const deleteFriend = async (
    event: {
      preventDefault: () => void;
      stopPropagation: () => void;
    },
    selectFriend: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const response = await sendRequest(
      'delete',
      `/friends/delete/${selectFriend}`,
      router,
    );
    if (response.status === 200) {
      myAlert('info', `${selectFriend} 삭제 완료`, dispatch);
      superSocket?.emit('deleteFriend', {
        userName: myName,
        targetName: selectFriend,
      });
    } else if (response.status === 404) router.push('/404');
  };

  const handleStartDM = async (friendName: string) => {
    dispatch(setFriend(friendName));
    dispatch(setJoin(JoinStatus.DM));
  };

  return (
    <>
      {Array.isArray(friendList) ? (
        friendList?.map((curFriend: string[], rowIdx: number) => (
          <Grow in={true} timeout={400 * (rowIdx + 1)} key={rowIdx}>
            <ListItem
              key={rowIdx}
              divider
              onClick={() => {
                handleStartDM(curFriend[0]);
              }}
              className="list-item"
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
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(event: {
                  preventDefault: () => void;
                  stopPropagation: () => void;
                }) => deleteFriend(event, curFriend[0])}
              >
                <PersonRemoveIcon />
              </IconButton>
            </ListItem>
          </Grow>
        ))
      ) : (
        <></>
      )}
    </>
  );
};

export default FriendList;
