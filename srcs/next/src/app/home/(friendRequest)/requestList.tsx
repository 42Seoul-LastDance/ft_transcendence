'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useDispatch } from 'react-redux';
import sendRequest from '../../api';
import { useRouter } from 'next/navigation';
// import { setChatMessages } from '@/app/redux/roomSlice';
import { JoinStatus } from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';
import { Button } from '@mui/material';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const RequestList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();
  const [requestList, setRequestList] = useState<string[]>([]);
  const router = useRouter();

  const handleResponse = async () => {
    const response = await sendRequest('get', '/friends/getInvitation', router);
    setRequestList(response.data);
  };

  const declineInvitation = async (friendName: string) => {
    const requestUnblock = await sendRequest(
      'delete',
      `/friends/decline/${friendName}`,
      router,
    );
    if (requestUnblock.status === 200) handleResponse();
  };

  const acceptInvitation = async (friendName: string) => {
    const requestUnblock = await sendRequest(
      'patch',
      `/friends/saYes/${friendName}`,
      router,
    );
    if (requestUnblock.status === 200) handleResponse();
  };

  useEffect(() => {
    handleResponse();
  }, []);
  return (
    <>
      <List>
        {requestList.map((friendName: string) => (
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
        ))}
      </List>
    </>
  );
};

export default RequestList;
