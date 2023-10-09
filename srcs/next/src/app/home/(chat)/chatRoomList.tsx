'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useChatSocket } from '../../context/chatSocketContext';
import { ChatRoomDto, RoomStatus } from '../../interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { setIsJoined } from '../../redux/roomSlice';
import { setChatRoom } from '../../redux/userSlice';
import { IoEventListner } from '../../context/socket';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const ChatRoomList: React.FC = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomNameList = useSelector(
    (state: RootState) => state.room.roomNameList,
  );

  const joinRoom = (roomName: string) => {
    const handleJoinRoom = (data: any) => {
      if (data.result === true) {
        dispatch(setIsJoined(true));
      } else {
        dispatch(setIsJoined(false));
        alert('비밀번호가 틀렸습니다.');
      }
    };

    const handleGetChatRoom = (data: ChatRoomDto) => {
      console.log('getChatRoomInfo Data', data);
      let password: string | null = null;
      if (data.requirePassword === true) {
        password = prompt('비밀번호를 입력하세요');
        if (!password) return;
      }
      chatSocket?.emit('joinPublicChatRoom', { roomName, password }, () => {
        dispatch(setChatRoom(data));
      });
    };

    IoEventListner(chatSocket!, 'getChatRoomInfo', handleGetChatRoom);
    IoEventListner(chatSocket!, 'joinPublicChatRoom', handleJoinRoom);

    chatSocket?.emit('getChatRoomInfo', {
      roomName: roomName,
      status: RoomStatus.PUBLIC,
    });
  };

  return (
    <>
      <List sx={style} component="nav" aria-label="mailbox folders">
        {roomNameList.map((roomName: string) => {
          return roomName !== chatRoom?.roomName ? (
            <ListItem
              key={roomName}
              divider
              onClick={() => {
                joinRoom(roomName);
              }}
            >
              <ListItemText primary={`방 이름: ${roomName}`} />
            </ListItem>
          ) : null;
        })}
      </List>
      <CreateRoomButton />
    </>
  );
};

export default ChatRoomList;
