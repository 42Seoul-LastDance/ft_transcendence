import { useDispatch, useSelector } from 'react-redux';
import { useChatSocket } from '../Context/ChatSocketContext';
import { RootState } from '../redux/store';
import { setRoomNameList } from '../redux/roomSlice';
import { useEffect } from 'react';
import { RoomStatus } from '../DTO/RoomInfo.dto';

const setChatRoomList: React.FC = () => {
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const roomNameList = useSelector(
    (state: RootState) => state.room.roomNameList,
  );

  if (!chatSocket.hasListeners('getChatRoomList')) {
    chatSocket.on('getChatRoomList', (data) => {
      dispatch(setRoomNameList(data));
    });
  }

  useEffect(() => {
    chatSocket.emit('getChatRoomList', {
      roomStatus: RoomStatus.PUBLIC,
    });
  }, []);
  return <></>;
};

export default setChatRoomList;
