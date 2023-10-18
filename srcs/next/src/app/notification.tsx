// import { useEffect, useState } from 'react';
// import { useSuperSocket } from './context/superSocketContext';
// import { GetInvitationListJson, InviteType } from './Enums';
// import { IoEventListener } from './context/socket';
// import * as React from 'react';
// import Button from '@mui/material/Button';
// import ClickAwayListener from '@mui/material/ClickAwayListener';
// import Grow from '@mui/material/Grow';
// import Paper from '@mui/material/Paper';
// import Popper from '@mui/material/Popper';
// import MenuItem from '@mui/material/MenuItem';
// import MenuList from '@mui/material/MenuList';
// import Stack from '@mui/material/Stack';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from './redux/store';
// import { setViewNoti } from './redux/viewSlice';

// const Notification = () => {
//   const [open, setOpen] = useState(false);
//   const anchorRef = React.useRef<HTMLButtonElement>(null);
//   const superSocket = useSuperSocket();
//   const [invitaionList, setInvitationList] = useState<GetInvitationListJson[]>(
//     [],
//   );
//   const viewNoti = useSelector((state: RootState) => state.view.viewNoti);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const e = [
//       {
//         event: 'getInvitationList',
//         callback: (data: GetInvitationListJson[]) => setInvitationList(data),
//       },
//     ];
//     e.forEach(({ event, callback }) => {
//       IoEventListener(superSocket!, event, callback);
//     });
//     return () => {
//       e.forEach(({ event, callback }) => {
//         superSocket?.off(event, callback);
//       });
//     };
//   }, []);

//   const declineInvitation = (invitation: GetInvitationListJson) => {
//     console.log('--- 거절함 ---', invitation);
//     //TODO emit 'declineInvite' (juhoh) => { 프론트 체크 필요 }
//     superSocket?.emit('declineInvite', { hostName: invitation.hostName });
//   };

//   const acceptInvitation = (invitation: GetInvitationListJson) => {
//     console.log('--- 수락함 ---', invitation);
//     //TODO emit 'agreeInvite' (juhoh) => { 프론트 체크 필요 }
//     superSocket?.emit('agreeInvite', { hostName: invitation.hostName });
//   };

//   const handleClose = (event: Event | React.SyntheticEvent) => {
//     if (
//       anchorRef.current &&
//       anchorRef.current.contains(event.target as HTMLElement)
//     ) {
//       return;
//     }

//     dispatch(setViewNoti(false));
//   };

//   function handleListKeyDown(event: React.KeyboardEvent) {
//     if (event.key === 'Escape') {
//       dispatch(setViewNoti(false));
//     }
//   }

//   useEffect(() => {
//     if (viewNoti === false) setOpen(false);
//     else setOpen(true);
//   }, [viewNoti]);

//   const prevOpen = React.useRef(open);
//   useEffect(() => {
//     if (open === true) superSocket?.emit('getInvitationList');
//     if (prevOpen.current === true && open === false) {
//       anchorRef.current!.focus();
//     }
//     prevOpen.current = open;
//   }, [open]);

//   return (
//     <Stack direction="row">
//       {/* <Button
//         ref={anchorRef}
//         id="composition-button"
//         aria-controls={open ? 'composition-menu' : undefined}
//         aria-expanded={open ? 'true' : undefined}
//         aria-haspopup="true"
//         onClick={handleToggle}
//       >
//         버-튼
//       </Button> */}
//       <div>
//         <Popper
//           open={viewNoti}
//           anchorEl={anchorRef.current}
//           role={undefined}
//           placement="bottom-start"
//           transition
//           disablePortal
//         >
//           {({ TransitionProps, placement }) => (
//             <Grow
//               {...TransitionProps}
//               style={{
//                 transformOrigin:
//                   placement === 'bottom-start' ? 'left top' : 'left bottom',
//               }}
//             >
//               <Paper>
//                 <ClickAwayListener onClickAway={handleClose}>
//                   <MenuList
//                     autoFocusItem={open}
//                     id="composition-menu"
//                     aria-labelledby="composition-button"
//                     onKeyDown={handleListKeyDown}
//                   >
//                     열렸어요
//                     {invitaionList.map((invitation: GetInvitationListJson) => {
//                       return (
//                         <MenuItem>
//                           {invitation.inviteType === InviteType.CHAT
//                             ? `${invitation.hostName}님이 ${invitation.chatRoomType}방인 ${invitation.chatRoomName}에 초대하셨습니다`
//                             : `${invitation.hostName}님이 ${invitation.gameType}모드로 게임을 초대하셨습니다`}
//                           <Button
//                             variant="contained"
//                             onClick={() => acceptInvitation(invitation)}
//                           >
//                             수락
//                           </Button>
//                           <Button
//                             variant="contained"
//                             onClick={() => declineInvitation(invitation)}
//                           >
//                             거절
//                           </Button>
//                         </MenuItem>
//                       );
//                     })}
//                   </MenuList>
//                 </ClickAwayListener>
//               </Paper>
//             </Grow>
//           )}
//       </div>
//     </Stack>
//   );
// };

// export default Notification;
