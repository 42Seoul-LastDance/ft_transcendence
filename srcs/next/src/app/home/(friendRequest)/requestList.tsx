'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from 'react-redux';
import sendRequest from '../../api';
import { useRouter } from 'next/navigation';
import { Button, Grow, IconButton, TextField } from '@mui/material';
import { isValid } from '../valid';
import { maxUniqueNameLength } from '@/app/globals';
import { myAlert } from '../alert';
import FriendList from '../(dm)/friendList';
import { FriendStatus } from '@/app/interface';
import CachedIcon from '@mui/icons-material/Cached';
import { useSuperSocket } from '@/app/context/superSocketContext';
import { RootState } from '@/app/redux/store';
const RequestList: React.FC = () => {
  const [requestList, setRequestList] = useState<string[]>([]);
  const router = useRouter();
  const [friendRequestName, setFriendRequestName] = useState<string>('');
  const myName = useSelector((state: RootState) => state.user.userName);
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    handleGetFriendInvitation();
  }, []);

  const handleGetFriendInvitation = async () => {
    const response = await sendRequest('get', '/friends/getInvitation', router);
    setRequestList(response.data);
  };

  const declineInvitation = async (friendName: string) => {
    const requestUnblock = await sendRequest(
      'delete',
      `/friends/decline/${friendName}`,
      router,
    );
    if (requestUnblock.status === 200) handleGetFriendInvitation();
  };

  const acceptInvitation = async (friendName: string) => {
    const requestUnblock = await sendRequest(
      'patch',
      `/friends/saYes/${friendName}`,
      router,
    );
    if (requestUnblock.status === 200) {
      handleGetFriendInvitation();
      superSocket?.emit('acceptFriend', {
        userName: myName,
        targetName: friendName,
      });
    }
  };

  const checkAlreadyFriend = async () => {
    const response = await sendRequest(
      'get',
      `/friends/isFriend/${friendRequestName}`,
      router,
    );
    if (
      response.status === 200 &&
      response.data.status === FriendStatus.FRIEND
    ) {
      myAlert('error', '이미 친구입니다.', dispatch);
      return true;
    } else return false;
  };

  const sendFriendRequest = async () => {
    if (
      isValid('검색 값이', friendRequestName, maxUniqueNameLength, dispatch) ===
      false
    )
      return;
    const isFriend = await checkAlreadyFriend();
    if (isFriend) return;
    const response = await sendRequest(
      'put',
      `/friends/request/${friendRequestName}`,
      {},
      router,
    );
    if (response.status === 200) {
      myAlert('success', '친구 요청을 보냈습니다.', dispatch);
      handleGetFriendInvitation();
    }
  };

  const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFriendRequestName(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') sendFriendRequest();
  };

  return (
    <>
      <p>친구 요청 보내기</p>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
        <TextField
          fullWidth
          id="friendRequest"
          variant="outlined"
          label="친구 요청 보내기"
          value={friendRequestName}
          onChange={handleInputValue}
          onKeyPress={handleKeyDown}
        />
        <Button
          id="sendBtn"
          variant="contained"
          color="primary"
          size="large"
          onClick={sendFriendRequest}
          style={{ marginLeft: '8px' }}
        >
          send
        </Button>
      </div>
      <List>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ marginRight: '8px' }}>받은 친구 요청 리스트</p>
          <IconButton aria-label="refresh" onClick={handleGetFriendInvitation}>
            <CachedIcon />
          </IconButton>
        </div>
        {requestList.map((friendName: string, index: number) => (
          <Grow in={true} timeout={500 * (index + 1)} key={index}>
            <ListItem key={friendName} divider>
              <ListItemText primary={`유저 이름: ${friendName}`} />
              <Button
                variant="contained"
                onClick={() => acceptInvitation(friendName)}
              >
                친구수락
              </Button>
              <Button
                variant="contained"
                onClick={() => declineInvitation(friendName)}
              >
                거절
              </Button>
            </ListItem>
          </Grow>
        ))}
      </List>
    </>
  );
};

export default RequestList;
