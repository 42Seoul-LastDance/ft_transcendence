import React from 'react';
import Button from '@mui/material/Button';
import { getChatSocket } from '../SSock';
import { Socket } from 'socket.io-client';
import { RoomStatus } from '../redux/roomSlice';

const CreateRoomButton: React.FC = () => {

  const makePublic = () => { 
    console.log('makePublic');
    const chatSocket: Socket = getChatSocket();

    chatSocket.emit('sendMessage', {
      roomName: 'default room',
      status: 'PUBLIC',
      userName: 'kwsong',
      content: 'hello world!',
    });
    
    chatSocket.on('sendMessage', (content: string) => {
        // console.log('who am I ? :' , chatSocket.id );
      console.log(content);
    })
  };

  const makePrivate = () => {
    console.log('makePrivate');
    const chatSocket: Socket = getChatSocket();

    chatSocket.emit('getChatRoomList', 'getChatRoomList');

    chatSocket.on('getChatRoomList', (data) => {
      console.log('getChatRoomList 여 기  를  확  인  해  보  세  요요: ', data); // 'temp'를 '{}'로 변경하여 복사
    });
  }

  return (
    <div>
      <Button 
        variant="contained"
        onClick={makePublic} // 함수 이름만 넘기면 됩니다.
      > public
      </Button>
      <Button 
        variant="contained"
        onClick={makePrivate} // 함수 이름만 넘기면 됩니다.
      > private
      </Button>
    </div>
  );
};

export default CreateRoomButton;