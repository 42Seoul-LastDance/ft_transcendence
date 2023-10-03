'use client';

import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useRouter } from 'next/navigation';
import { useChatSocket } from '../Context/ChatSocketContext';
import { RoomStatus } from '../DTO/RoomInfo.dto'; // ChatRoomDto 및 ChatRoomListDto는 사용되지 않으므로 import 제거
import { ChatRoomListDto, ChatRoomDto } from '../DTO/ChatRoom.dto';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useDispatch } from 'react-redux';
import { push } from '../redux/roomSlice';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const chatSocket = useChatSocket();
  const router = useRouter();

  const [roomNameList, setRoomNameList] = useState<string[]>([]);

  useEffect(() => {
	if (!chatSocket.hasListeners('getChatRoomList')){
		chatSocket.on('getChatRoomList', (data) => {
			setRoomNameList(data);
		});
	}
	chatSocket.emit('getChatRoomList', {
	  roomStatus: RoomStatus.PUBLIC,
	});
    // 컴포넌트 언마운트 시에 소켓 이벤트 핸들러 제거
    return () => {
      chatSocket.off('getChatRoomList');
    };
  }, [chatSocket]);

  const joinRoom = (roomName: string) => {
	var curRoomInfo : ChatRoomDto;

	if (!chatSocket.hasListeners('getChatRoomInfo')){
		chatSocket.on('getChatRoomInfo', (data: ChatRoomDto) => {
			curRoomInfo = data;
			if (curRoomInfo.requirePassword == true) {
				const password = prompt('비밀번호를 입력하세요');
				console.log('password: ', curRoomInfo.password);
				if (password === curRoomInfo.password) {
				  router.push('/chatRoom');
				} else {
				  alert('비밀번호가 틀렸습니다');
				}
			} else if (curRoomInfo.requirePassword == false) {
				router.push('/chatRoom');
			}
		});
	}
	chatSocket.emit('getChatRoomInfo', {
		'roomName': roomName,
		'status': RoomStatus.PUBLIC
	});
  };

  return (
    <>
      <List sx={style} component="nav" aria-label="mailbox folders">
        {roomNameList.map((roomName) => (
          <ListItem
            key={roomName}
            divider
            onClick={() => {
              joinRoom(roomName);
            }}
          >
            <ListItemText
              primary={`방 이름: ${roomName}`}
              // secondary={`잠금 여부: ${roomName}`}
            />
          </ListItem>
        ))}
      </List>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
