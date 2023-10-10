'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '../../context/superSocketContext';
import { useDispatch } from 'react-redux';
import sendRequest from '../../api';
import { useRouter } from 'next/navigation';
import { setChatMessages } from '@/app/redux/roomSlice';
import { JoinStatus } from '@/app/interface';
import { setJoin } from '@/app/redux/userSlice';
// import { IoEventListener } from '../context/socket';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const FriendList: React.FC = () => {
  const superSocket = useSuperSocket();
  const dispatch = useDispatch();
  const [friendList, setFriendList] = useState<string[][]>([]);
  const router = useRouter();

  const handleResponse = async () => {
    const response = await sendRequest('get', '/friends/getFriendList', router);
    setFriendList(response.data);
  };

  const startDM = async (friendName: string) => {
    const prevMessages = await sendRequest(
      'get',
      `/DM/with/${friendName}`,
      router,
    ); // ChatMessages[] 로 올 예정
    dispatch(setChatMessages(prevMessages.data));
    dispatch(setJoin(JoinStatus.DM));
  };

  useEffect(() => {
    handleResponse();
  }, []);

  return (
    <>
      {friendList.map((curFriend: string[], rowIdx: number) => (
        <List key={rowIdx}>
          {curFriend.map((curFriendName: string, curIdx: number) => (
            <ListItem
              key={curIdx}
              divider
              onClick={() => {
                startDM(curFriendName);
              }}
            >
              <ListItemText primary={`친구 이름: ${curFriendName}`} />
              <ListItemText secondary={`친구 상태: ${curFriend[1]}`} />
            </ListItem>
          ))}
        </List>
      ))}
    </>
  );
};

export default FriendList;
