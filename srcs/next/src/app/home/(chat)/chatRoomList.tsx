'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CreateRoomButton from './createRoomButton';
import { useChatSocket } from '../../context/chatSocketContext';
import { ChatRoomDto, JoinStatus, RoomStatus } from '../../interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { setChatRoom, setJoin } from '../../redux/userSlice';
import { IoEventListener, IoEventOnce } from '../../context/socket';
import { isValid } from '../valid';
import { myAlert } from '../alert';
import { setRoomNameList } from '@/app/redux/roomSlice';

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
    const handleGetChatRoom = (data: ChatRoomDto) => {
      console.log('getChatRoomInfo Data', data);
      let password: string | null = null;
      if (data.requirePassword === true) {
        password = prompt('비밀번호를 입력하세요');
        console.log('password:', password);
        if (
          !password ||
          isValid('비밀번호가', password, 20, dispatch) === false
        )
          return;
      }

      chatSocket?.emit(
        'joinPublicChatRoom',
        { roomName, password },
        checkPassword,
      );
      dispatch(setChatRoom(data));
    };

    const checkPassword = (data: any) => {
      if (data.result === true) {
        dispatch(setJoin(JoinStatus.CHAT));
        myAlert('success', '채팅방에 입장하였습니다.', dispatch);
      } else if (data.result === false) {
        dispatch(setJoin(JoinStatus.NONE));
        myAlert('error', '비밀번호가 틀렸습니다.', dispatch);
      }
    };

    chatSocket?.emit('getChatRoomInfo', {
      roomName: roomName,
      status: RoomStatus.PUBLIC,
    });

    IoEventOnce(chatSocket!, 'getChatRoomInfo', handleGetChatRoom);
    IoEventOnce(chatSocket!, 'joinPublicChatRoom', checkPassword);
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
