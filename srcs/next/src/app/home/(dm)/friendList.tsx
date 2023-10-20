'use client';

import React, { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../contexts/superSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  Events,
  FriendListJson,
} from '@/app/interfaces';
import { setJoin } from '@/app/redux/userSlice';
import { Avatar, ButtonGroup, Grow, IconButton } from '@mui/material';
import { setFriend, setFriendSlackId } from '@/app/redux/dmSlice';
import { clearSocketEvent, registerSocketEvent } from '@/app/contexts/socket';
import { RootState } from '@/app/redux/store';
import { useRouter } from 'next/navigation';
import { setFriendList } from '@/app/redux/friendSlice';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserProfile from '../(profile)/userProfile';
import { setViewProfile } from '@/app/redux/viewSlice';
import MessageIcon from '@mui/icons-material/Message';
import { JoinStatus, UserStatus } from '@/app/enums';

const FriendList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();
  const friendList = useSelector((state: RootState) => state.friend.friendList);
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
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
          superSocket?.emit('getFriendStateList', mySlackId);
        },
      },
    ];
    registerSocketEvent(superSocket!, e);
    return () => {
      clearSocketEvent(superSocket!, e);
    };
  }, [join]);

  useEffect(() => {
    superSocket?.emit('getFriendStateList', mySlackId);
  }, []);

  const handleProfile = (selectFriendSlackId: string) => {
    setTargetUser(selectFriendSlackId);
    dispatch(
      setViewProfile({ viewProfile: true, targetSlackId: selectFriendSlackId }),
    );
  };

  const handleStartDM = async (friendName: string, friendSlackId: string) => {
    dispatch(setFriend(friendName));
    dispatch(setFriendSlackId(friendSlackId));
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
              className="list-item"
              sx={{
                width: 450,
              }}
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
              <ButtonGroup sx={{ gap: 2 }}>
                <IconButton
                  edge="start"
                  aria-label="chat"
                  onClick={() =>
                    handleStartDM(curFriend.userName, curFriend.slackId)
                  }
                >
                  <MessageIcon />
                </IconButton>
                <IconButton
                  edge="start"
                  aria-label="account"
                  onClick={() => handleProfile(curFriend.slackId)}
                >
                  <AccountCircleIcon />
                </IconButton>
              </ButtonGroup>
              {targetUser && <UserProfile />}
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
