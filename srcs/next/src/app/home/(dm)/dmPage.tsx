// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Container,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
// } from '@mui/material';
// import { RootState } from '../../redux/store';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   ChattingPageProps,
//   JoinStatus,
//   SendMessageJson,
//   receiveMessage,
// } from '../../interface';

// import { clearChatMessages, setChatMessages } from '@/app/redux/roomSlice';
// import { IoEventListener } from '@/app/context/socket';
// import { isValid } from '../valid';
// import { setJoin } from '@/app/redux/userSlice';
// import { myAlert } from '../alert';

// const DMPage = (props: ChattingPageProps) => {
//   const [message, setMessage] = useState('');
//   const chatMessages = useSelector(
//     (state: RootState) => state.room.chatMessages,
//   );
//   const dispatch = useDispatch();
//   const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
//   const myName = useSelector((state: RootState) => state.user.userName);
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const join = useSelector((state: RootState) => state.user.join);
//   const friend = useSelector((state: RootState) => state.dm.friendName);

//   useEffect(() => {
//     console.log('--------- DM Page component ---------');
//     if (join !== JoinStatus.DM) {
//       return;
//     }
//     if (listRef.current) {
//       listRef.current.scrollTop = listRef.current.scrollHeight;
//     }
//     const eventListeners = [
//       {
//         event: 'sendMessage',
//         callback: (data: SendMessageJson) => {
//           props.socket?.emit('receiveMessage', {
//             userName: data.userName,
//             content: data.content,
//           });
//         },
//       },
//       {
//         event: 'receiveMessage',
//         callback: (data: receiveMessage) => {
//           if (data.canReceive === false) return;
//           dispatch(setChatMessages([...chatMessages, data]));
//         },
//       },
//       {
//         event: 'explodeRoom',
//         callback: handleExitRoom,
//       },
//     ];

//     // 소켓 이벤트 등록
//     eventListeners.forEach((listener) => {
//       IoEventListener(props.socket!, listener.event, listener.callback);
//     });
//     // 이벤트 삭제
//     return () => {
//       eventListeners.forEach((listener) => {
//         props.socket!.off(listener.event, listener.callback);
//       });
//     };
//   }, [join, chatMessages]);

//   // 메세지 보내기
//   const SendMessage = () => {
//     if (!message) return;
//     if (!chatRoom) throw new Error('chatRoom is null');

//     setChatMessages([
//       ...chatMessages,
//       {
//         userName: myName!,
//         content: message,
//       },
//     ]);

//     props.socket?.emit('sendMessage', {
//       roomName: chatRoom.roomName,
//       userName: myName!,
//       content: message,
//       status: chatRoom.status,
//     });

//     setMessage('');
//   };

//   const handleKeyDown = (event: React.KeyboardEvent) => {
//     if (event.key === 'Enter') {
//       SendMessage();
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (isValid('메세지가', e.target.value + ' ⏎', 50, dispatch)) {
//       setMessage(e.target.value);
//     }
//   };

//   const handleExitRoom = () => {
//     props.socket?.emit('exitChatRoom');
//     dispatch(setJoin(JoinStatus.NONE));
//     dispatch(clearChatMessages([]));
//     myAlert('success', '나가졌어요 펑 ~', dispatch);
//     props.socket?.emit('getRoomNameList');
//   };

//   return join === JoinStatus.DM ? (
//     <Container
//       maxWidth="sm"
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         height: '100vh',
//       }}
//     >
//       <Card
//         className="mt-4"
//         style={{
//           height: '700px',
//           width: '35rem',
//           margin: 'auto',
//           alignItems: 'center',
//         }}
//       >
//         <CardContent
//           style={{ overflowY: 'auto', height: 'calc(100% - 105px)' }}
//         >
//           {chatRoom?.roomName}
//           <List
//             ref={listRef as React.RefObject<HTMLUListElement>}
//             style={{ maxHeight: '550px', overflowY: 'auto' }}
//           >
//             {chatMessages?.map((msg, index) => (
//               <ListItem key={index}>
//                 <ListItemText
//                   primary={msg.userName} //undefiend userName
//                   secondary={msg.content}
//                   style={{
//                     textAlign: myName === msg.userName ? 'right' : 'left', // 방 폭파되고 undefined되어있는 이슈
//                     paddingRight: '8px',
//                     paddingLeft: '8px',
//                   }}
//                 />
//                 <div
//                   style={{
//                     textAlign: myName === msg.userName ? 'left' : 'right',
//                     fontSize: '12px',
//                     color: 'gray',
//                   }}
//                 ></div>
//               </ListItem>
//             ))}
//           </List>
//         </CardContent>
//         <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
//           {/* 채팅 입력 필드와 전송 버튼 */}
//           <TextField
//             fullWidth
//             id="msgText"
//             variant="outlined"
//             label="Message"
//             value={message}
//             onChange={handleInputChange}
//             onKeyPress={handleKeyDown}
//           />
//           <Button
//             id="sendBtn"
//             variant="contained"
//             color="primary"
//             size="large"
//             onClick={SendMessage}
//             style={{ marginLeft: '8px' }}
//           >
//             Send
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   ) : null;
// };

// export default DMPage;
