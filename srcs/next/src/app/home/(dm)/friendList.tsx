'use client';

import React, { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  Events,
  FriendListJson,
  JoinStatus,
  UserStatus,
} from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';
import { Avatar, Grow, IconButton } from '@mui/material';
import { setFriend } from '@/app/redux/dmSlice';
import { clearSocketEvent, registerSocketEvent } from '@/app/context/socket';
import { RootState } from '@/app/redux/store';
import sendRequest from '@/app/api';
import { useRouter } from 'next/navigation';
import { myAlert } from '../alert';
import { setFriendList } from '@/app/redux/friendSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserProfile from '../(profile)/userProfile';
import { setViewProfile } from '@/app/redux/viewSlice';
const FriendList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();
  const friendList = useSelector((state: RootState) => state.friend.friendList);
  const myName = useSelector((state: RootState) => state.user.userName);
  const join = useSelector((state: RootState) => state.user.join);
  const [targetUser, setTargetUser] = useState<string | null>(null); // [targetName, targetStatus
  const router = useRouter();

  useEffect(() => {
    console.log('--------- friendList component ---------');
    const e: Events[] = [
      {
        event: 'getFriendStateList',
        callback: (data: FriendListJson[]) => {
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

  const handleProfile = (
    event: {
      preventDefault: () => void;
      stopPropagation: () => void;
    },
    selectFriend: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setTargetUser(selectFriend);
    dispatch(setViewProfile(true));
  };

  const handleStartDM = async (friendName: string) => {
    dispatch(setFriend(friendName));
    dispatch(setJoin(JoinStatus.DM));
  };

  return (
    <>
      {Array.isArray(friendList) ? (
        friendList?.map((curFriend: FriendListJson, rowIdx: number) => (
          <Grow in={true} timeout={400 * (rowIdx + 1)} key={rowIdx}>
            <ListItem
              key={rowIdx}
              divider
              onClick={() => {
                handleStartDM(curFriend.userName);
              }}
              className="list-item"
            >
              <Avatar
                sx={{
                  width: 15,
                  height: 15,
                  margin: '15px',
                  bgcolor:
                    curFriend.userStatus === UserStatus.ONLINE
                      ? '#4caf50'
                      : curFriend.userStatus === UserStatus.GAME
                      ? '#ffeb3b'
                      : curFriend.userStatus === UserStatus.OFFLINE
                      ? '#9e9e9e'
                      : 'transparent',
                }}
              >
                {' '}
              </Avatar>
              <ListItemText
                primary={curFriend.userName}
                secondary={curFriend.slackId}
              />
              <IconButton
                edge="start"
                aria-label="account"
                onClick={(event: {
                  preventDefault: () => void;
                  stopPropagation: () => void;
                }) => handleProfile(event, curFriend.userName)}
              >
                <AccountCircleIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(event: {
                  preventDefault: () => void;
                  stopPropagation: () => void;
                }) => deleteFriend(event, curFriend.userName)}
              >
                <DeleteIcon />
              </IconButton>
              {targetUser && <UserProfile targetName={targetUser} />}
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
