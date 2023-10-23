'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from 'react-redux';
import sendRequest from '../../api';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Divider,
  Grow,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { isValid } from '../valid';
import { maxUniqueNameLength } from '@/app/globals';
import { myAlert } from '../alert';
import { UserInfoJson } from '@/app/interfaces';
import CachedIcon from '@mui/icons-material/Cached';
import { useSuperSocket } from '@/app/contexts/superSocketContext';
import { RootState } from '@/app/redux/store';
import { FriendStatus } from '@/app/enums';

const RequestList: React.FC = () => {
  const [requestList, setRequestList] = useState<UserInfoJson[]>([]);
  const router = useRouter();
  const [friendRequestSlackId, setfriendRequestSlackId] = useState<string>('');
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    handleGetFriendInvitation();
  }, []);

  const handleGetFriendInvitation = async () => {
    const response = await sendRequest('get', '/friends/getInvitation', router);
    setRequestList(response.data);
  };

  const declineInvitation = async (friendSlackId: string) => {
    const requestUnblock = await sendRequest(
      'delete',
      `/friends/decline/${friendSlackId}`,
      router,
    );
    if (requestUnblock.status === 200) handleGetFriendInvitation();
  };

  const acceptInvitation = async (friendSlackId: string) => {
    const requestUnblock = await sendRequest(
      'patch',
      `/friends/saYes/${friendSlackId}`,
      router,
    );
    if (requestUnblock.status < 300) {
      handleGetFriendInvitation();
      superSocket?.emit('acceptFriend', {
        userSlackId: mySlackId,
        targetSlackId: friendSlackId,
      });
    }
  };

  const checkExistUser = async () => {
    try {
      const response = await sendRequest('post', `/users/exist/`, router, {
      slackId: friendRequestSlackId,
      });
      if (response.status === 400) {
        myAlert('error', '존재하지 않는 유저입니다', dispatch);
        return false;
      }
    } catch(e) {
      console.log(e);
    }
    return true;
  };

  const checkAlreadyFriend = async () => {
    const response = await sendRequest('post', `/friends/isFriend/`, router, {
      friendSlackId: friendRequestSlackId,
    });
    console.log('res checkAlreadyFriend', response.data);
    if (
      response.status < 300 &&
      response.data['status'] === FriendStatus.FRIEND
    ) {
      myAlert('error', '이미 친구입니다.', dispatch);
      return true;
    } else return false;
  };

  const sendFriendRequest = async () => {
    if (
      isValid(
        '검색 값이',
        friendRequestSlackId,
        maxUniqueNameLength,
        dispatch,
      ) === false
    )
      return;
    const isExist = await checkExistUser();
    if (!isExist) return;
    const isFriend = await checkAlreadyFriend();
    if (isFriend) return;
    const response = await sendRequest('put', `/friends/request/`, router, {
      friendSlackId: friendRequestSlackId,
    });
    if (response.status < 300) {
      myAlert('success', '친구 요청을 보냈습니다.', dispatch);
      handleGetFriendInvitation();
    }
  };

  const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setfriendRequestSlackId(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') sendFriendRequest();
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // 왼쪽 정렬
    padding: '8px',
    opacity: '0.8',
    width: '460px',
    maxHeight: 'auto',
    borderRadius: '15px',
    marginTop: '20px',
  };

  return (
    <>
      <Card sx={{ ...cardStyle }} >
        <div style={{ marginBottom: '8px'}} >
          <Typography id="modal-modal-description" variant="body1" marginLeft={2} >
            친구요청 보내기
          </Typography>
        </div>
        <div style={{ display: 'flex', alignItems: 'center',}} >
          <TextField
            id="friendRequest"
            label="상대의 Slack ID를 입력하세요"
            color="secondary"
            value={friendRequestSlackId}
            onChange={handleInputValue}
            onKeyUp={handleKeyDown}
            sx = {{
              width: '240px',
              textAlign: 'center',
        }}
            InputProps={{
              style: {
                backgroundColor: '#f1f1f1',
                borderRadius: '15px',
                width: '240px',
                height: '50px',
              },
            }}
          />
          <Button
            id="sendBtn"
            variant="contained"
            color="secondary"
            size="large"
            onClick={sendFriendRequest}
            sx={{
              marginLeft: '8px',
              borderRadius: '15px',
              width: '80px',
              height: '40px',
            }}
          >
            send
          </Button>
        </div>
      </Card>

      <Card sx={{ ...cardStyle }}>
        <List>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='body2'>
                받은 친구 요청 리스트
              </Typography>
              <IconButton
                aria-label="refresh"
                onClick={handleGetFriendInvitation}
              >
                <CachedIcon />
              </IconButton>
            </div>
            {requestList.map((info: UserInfoJson, index: number) => (
              <Grow in={true} timeout={500 * (index + 1)} key={index}>
                <ListItem key={info.userName} divider>
                  <ListItemText
                    primary={`유저 이름: ${info.userName}`}
                    secondary={info.slackId}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      marginLeft: '80px',
                      marginRight: '3px',
                      borderRadius: '15px',
                      width: '90px',
                      height: '40px',
                      
                    }}
                    onClick={() => acceptInvitation(info.slackId)}
                  >
                    친구수락
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      marginLeft: '8px',
                      marginRight: '8px',
                      borderRadius: '15px',
                      width: '60px',
                      height: '40px',
                      
                    }}
                    onClick={() => declineInvitation(info.slackId)}
                  >
                    거절
                  </Button>
                </ListItem>
              </Grow>
            ))}
        </List>
      </Card>
    </>
  );
};

export default RequestList;
