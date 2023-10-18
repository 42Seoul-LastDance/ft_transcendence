// ChatSetting.js
import React, { useState, MouseEvent, useEffect } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import {
  Button,
  ListItem,
  ListSubheader,
  Menu,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CommonListItem from './CommonListItem';
import ChatMenu from './chatMenu';
import { ChatRoomDto, Events, Member, UserPermission } from '@/app/interface';
import { useChatSocket } from '@/app/context/chatSocketContext';
import {
  IoEventListener,
  clearSocketEvent,
  registerSocketEvent,
} from '@/app/context/socket';
import {
  setMyPermission,
  setRoomMemberList,
  setSelectedMember,
} from '@/app/redux/roomSlice';

const ChatSetting = () => {
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [password, setPassword] = useState<string>('');
  const [InviteName, setInviteName] = useState<string>('');
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const myPermission = useSelector(
    (state: RootState) => state.room.myPermission,
  );
  const memberList = useSelector(
    (state: RootState) => state.room.roomMemberList,
  );
  const selectedMember = useSelector(
    (state: RootState) => state.room.selectedMember,
  );

  useEffect(() => {
    console.log('--------- chatSetting component ---------');

    const e: Events[] = [
      {
        event: 'getMemberStateList',
        callback: (data: Member[]) => dispatch(setRoomMemberList(data)),
      },
      {
        event: 'getMyPermission',
        callback: (data: UserPermission) => {
          dispatch(setMyPermission(data));
        },
      },
    ];
    registerSocketEvent(chatSocket!, e);
    chatSocket?.emit('getMyPermission', {
      roomName: chatRoom?.roomName,
      roomStatus: chatRoom?.status,
    });
    return () => {
      clearSocketEvent(chatSocket!, e);
    };
    // 소켓 이벤트 등록
  }, [memberList]);

  const handleClick = (event: MouseEvent<HTMLDivElement>, member: Member) => {
    dispatch(setSelectedMember(member));
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInviteName = (event: React.ChangeEvent<HTMLInputElement>) => {};
  const inviteFriend = () => {};

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {};
  const submitPassword = () => {};

  return (
    <>
      <List
        sx={{ width: 300, bgcolor: 'green' }}
        subheader={<ListSubheader>유저리스트</ListSubheader>}
      >
        {memberList.map((member: Member, index: number) => (
          <CommonListItem
            key={index}
            text={member.userName}
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              handleClick(event, member)
            }
          />
        ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <ChatMenu />
        </Menu>
        {/* ChatMenu 컴포넌트에 선택한 멤버 정보 전달 */}
      </List>
      <List
        sx={{ width: 300, bgcolor: 'orange' }}
        subheader={<ListSubheader>뮤트리스트</ListSubheader>}
      ></List>
      <List
        sx={{ width: 300, bgcolor: 'blue' }}
        subheader={<ListSubheader>밴리스트</ListSubheader>}
      ></List>
      {myPermission === UserPermission.OWNER ? (
        <>
          <div
            style={{ display: 'flex', alignItems: 'center', padding: '8px' }}
          >
            <TextField
              fullWidth
              id="setPassword"
              variant="outlined"
              label="비밀번호 세팅하기"
              value={password}
              onChange={handlePassword}
            />
            <Button
              id="setPasswordBtn"
              variant="contained"
              color="primary"
              size="large"
              onClick={submitPassword}
              style={{ marginLeft: '8px' }}
            >
              send
            </Button>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', padding: '8px' }}
          >
            <TextField
              fullWidth
              id="friendInvite"
              variant="outlined"
              label="친구 초대하기"
              value={InviteName}
              onChange={handleInviteName}
            />
            <Button
              id="setInviteBtn"
              variant="contained"
              color="primary"
              size="large"
              onClick={inviteFriend}
              style={{ marginLeft: '8px' }}
            >
              send
            </Button>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ChatSetting;
