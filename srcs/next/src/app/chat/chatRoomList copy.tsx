// 'use client';

// import React, { useEffect, useState } from 'react';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import CreateRoomButton from './createRoomButton';
// import { useRouter } from 'next/navigation';
// import { useChatSocket } from '../Context/ChatSocketContext';
// import { RoomStatus } from '../DTO/RoomInfo.dto'; // ChatRoomDto 및 ChatRoomListDto는 사용되지 않으므로 import 제거
// import { ChatRoomDto } from '../DTO/ChatRoom.dto';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/store';
// import { useDispatch } from 'react-redux';

// const style = {
//   width: '100%',
//   maxWidth: 360,
//   bgcolor: 'background.paper',
// };

// const ChatRoomList: React.FC = () => {
//   const chatSocket = useChatSocket();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   // const chatRoomList = useSelector((state: RootState) => state.room.roomList);

//   // chatRoomList를 ChatRoomListDto 형식으로 초기화
//   const [chatRoomList, setChatRoomList] = useState<ChatRoomListDto>({});

//   useEffect(() => {
//     chatSocket.emit('getChatRoomList', {
//       roomStatus: RoomStatus.PUBLIC,
//     });

//     chatSocket.on('getChatRoomList', (data) => {
//       console.log('!! room list: ', data);
//       try {
//         //기존 data : ChatRoomListDto list 인 string (stringfy(JSON) 의 결과)
//         //바꿀 data  = Array<string> (roomName)
//         const parsedData = JSON.parse(data);
//         console.log('parsedData: ', parsedData);

//         if (Array.isArray(parsedData)) {
//           const rooms: ChatRoomListDto = {};

//           parsedData.forEach((roomDataArray) => {
//             if (Array.isArray(roomDataArray) && roomDataArray.length === 2) {
//               const roomName = roomDataArray[0];
//               const roomData = roomDataArray[1];

//               rooms[roomName] = {
//                 operatorList: roomData.operatorList,
//                 memberList: roomData.memberList,
//                 inviteList: roomData.inviteList,
//                 banList: roomData.banList,
//                 muteList: roomData.muteList,
//                 roomName: roomData.roomName,
//                 ownerName: roomData.ownerName,
//                 status: roomData.status,
//                 password: roomData.password,
//                 requirePassword: roomData.requirePassword,
//               };
//             } else {
//               console.error('잘못된 데이터 형식 (innerArray)');
//             }
//             console.log('chatRoomList: ', rooms);
//           });
//           // dispatch(push(rooms));
//           setChatRoomList(rooms); // chatRoomList 업데이트
//         } else {
//           console.error('잘못된 데이터 형식 (parsedData)');
//         }
//       } catch (error) {
//         console.error('데이터 파싱 오류:', error);
//       }
//     });

//     // 컴포넌트 언마운트 시에 소켓 이벤트 핸들러 제거
//     return () => {
//       chatSocket.off('getChatRoomList');
//     };
//   }, [chatSocket]);

//   const joinRoom = (roomName: string) => {
//     const chatRoom: ChatRoomDto = chatRoomList[roomName];
//     if (chatRoom.requirePassword == true) {
//       const password = prompt('비밀번호를 입력하세요');
//       console.log('password: ', chatRoom.password);
//       if (password === chatRoom.password) {
//         router.push('/chatRoom');
//       } else {
//         alert('비밀번호가 틀렸습니다');
//       }
//     } else if (chatRoom.requirePassword == false) {
//       router.push('/chatRoom');
//     }
//   };

//   return (
//     <>
//       <List sx={style} component="nav" aria-label="mailbox folders">
//         {Object.keys(chatRoomList).map((roomName) => (
//           <ListItem
//             key={roomName}
//             divider
//             onClick={() => {
//               joinRoom(roomName);
//             }}
//           >
//             <ListItemText
//               primary={`방 이름: ${roomName}`}
//               // secondary={`잠금 여부: ${roomName}`}
//             />
//           </ListItem>
//         ))}
//       </List>
//       <CreateRoomButton />
//     </>
//   );
// };

// export default ChatRoomList;
