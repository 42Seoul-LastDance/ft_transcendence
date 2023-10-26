// ChatSetting.js
import React, { useState, MouseEvent, useEffect } from 'react';
import List from '@mui/material/List';
import {
  Button,
  Card,
  Divider,
  ListSubheader,
  Menu,
  Switch,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import ChatMenu from './chatMenu';
import { Events, Member, UserInfoJson } from '@/app/interfaces';
import { useChatSocket } from '@/app/contexts/chatSocketContext';
import { clearSocketEvent, registerSocketEvent } from '@/app/contexts/socket';
import {
  setBanList,
  setMyPermission,
  setRoomMemberList,
  setSelectedMember,
} from '@/app/redux/roomSlice';
import { isValid } from '../valid';
import { maxPasswordLength, maxUniqueNameLength } from '@/app/globals';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSuperSocket } from '@/app/contexts/superSocketContext';
import { myAlert } from '../alert';
import router from 'next/router';
import sendRequest from '@/app/api';
import { GameMode, InviteType, RoomStatus, UserPermission } from '@/app/enums';
import MenuItem from '@mui/material/MenuItem';

const ChatSetting = () => {
  const dispatch = useDispatch();
  const superSocket = useSuperSocket();
  const chatSocket = useChatSocket();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [password, setPassword] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const [isInputEnabled, setInputEnabled] = useState(false);
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const myPermission = useSelector(
    (state: RootState) => state.room.myPermission,
  );
  const memberList = useSelector(
    (state: RootState) => state.room.roomMemberList,
  );
  const banList = useSelector((state: RootState) => state.room.banList);
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
        event: 'getBanList',
        callback: (data: UserInfoJson[]) => dispatch(setBanList(data)),
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
    chatSocket?.emit('getMemberStateList', {
      roomName: chatRoom?.roomName,
      status: chatRoom?.status,
    });
    chatSocket?.emit('getBanList', {
      roomName: chatRoom?.roomName,
      roomStatus: chatRoom?.status,
    });
    return () => {
      clearSocketEvent(chatSocket!, e);
    };
  }, []);

  useEffect(() => {
    const e: Events[] = [
      {
        event: 'getMemberStateList',
        once: true,
        callback: (data: Member[]) => {
          if (anchorEl) setAnchorEl(null);
          dispatch(setRoomMemberList(data));
        },
      },
    ];
    registerSocketEvent(chatSocket!, e);
  }, [anchorEl, memberList]);

  const handleClick = (event: MouseEvent<HTMLDivElement>, member: Member) => {
    dispatch(setSelectedMember(member));
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInviteName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInviteName(event.target.value);
  };

  const checkExistUser = async () => {
    const response = await sendRequest('post', `/users/exist/`, router, {
      slackId: inviteName,
    });
    if (response.status > 300) {
      myAlert('error', '존재하지 않는 유저입니다', dispatch);
      return false;
    } else return true;
  };

  const inviteFriend = async () => {
    setInviteName('');
    if (mySlackId === inviteName) {
      myAlert('success', 'You are always welcome to yourself.', dispatch);
      return;
    }
    if (
      isValid('유저네임이', inviteName, maxUniqueNameLength, dispatch) === false
    )
      return;
    const exist = await checkExistUser();
    if (!exist) {
      myAlert('error', '존재하지 않는 유저입니다.', dispatch);
      return;
    }
    memberList.map((member, index) => {
      if (member.slackId === inviteName) {
        myAlert('error', '이미 채팅방에 존재하는 유저입니다.', dispatch);
        return;
      }
    });
    chatSocket?.emit('invitation', {
      roomName: chatRoom?.roomName,
      roomStatus: RoomStatus.PRIVATE,
      slackId: inviteName,
    });
    superSocket?.emit('sendInvitation', {
      slackId: inviteName,
      inviteType: InviteType.CHAT,
      chatRoomName: chatRoom?.roomName,
      chatRoomType: chatRoom?.status,
      gameMode: GameMode.NONE,
    });
    myAlert('success', '초대 메시지를 보냈습니다', dispatch);
  };

  const unBanUser = (targetSlackId: string) => {
    chatSocket?.emit('unbanUser', {
      roomName: chatRoom?.roomName,
      roomStatus: RoomStatus.PUBLIC,
      targetSlackId: targetSlackId,
    });
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const submitPassword = () => {
    if (isInputEnabled) {
      if (
        isValid('비밀번호가', password, maxPasswordLength, dispatch) === false
      )
        return;
      chatSocket?.emit('setRoomPassword', {
        roomName: chatRoom?.roomName,
        password: password,
      });
      setPassword('');
    } else {
      setPassword('');
      chatSocket?.emit('unsetRoomPassword', {
        roomName: chatRoom?.roomName,
      });
    }
  };

  const handleSwitchChange = () => {
    setInputEnabled((prev) => !prev);
  };

  return (
    <>
      <List
        sx={{ width: 300, bgcolor: '#f4dfff' }}
        subheader={<ListSubheader>대화 참여자</ListSubheader>}
      >
        {memberList?.map((member: Member, index: number) => (
          <ListItem
            alignItems="flex-start"
            onClick={(e: any) => {
              handleClick(e, member);
            }}
          >
            <Card
              className="purple-hover"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start', // 왼쪽 정렬
                padding: '8px',
                width: '460px',
                maxHeight: 'auto',
                borderRadius: '15px',
                opacity: '0.8',
              }}
            >
              <ListItemText
                primary={member.userName}
                secondary={member.slackId}
              />
            </Card>
          </ListItem>
        ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{}}
          // MenuListProps={{
          //   'aria-labelledby': 'basic-button',
          // }}
        >
          <ChatMenu />
        </Menu>
      </List>
      <List
        sx={{ width: 300, bgcolor: '#f4dfff' }}
        subheader={
          <ListSubheader>앞으로 채팅방에 못 들어오는 유저</ListSubheader>
        }
      >
        {banList?.map((member: UserInfoJson, index: number) => (
          <ListItem key={index}>
            <ListItemText
              primary={member.userName}
              secondary={member.slackId}
            />
            {myPermission <= UserPermission.ADMIN && (
              <Button
                color="secondary"
                onClick={() => {
                  unBanUser(member.slackId);
                }}
              >
                해제하기
              </Button>
            )}
          </ListItem>
        ))}
      </List>
      {myPermission === UserPermission.OWNER ? (
        <>
          {chatRoom?.status === RoomStatus.PUBLIC ? (
            <>
              <Switch
                onChange={handleSwitchChange}
                checked={isInputEnabled} // 스위치의 상태에 따라 체크 여부 변경
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                }}
              >
                <TextField
                  fullWidth
                  id="setPassword"
                  variant="outlined"
                  label="비밀번호 세팅하기"
                  color="secondary"
                  value={password}
                  onChange={handlePassword}
                  disabled={!isInputEnabled}
                />
                <Button
                  id="setPasswordBtn"
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={submitPassword}
                  style={{ marginLeft: '8px' }}
                >
                  OK
                </Button>
              </div>
            </>
          ) : (
            <div
              style={{ display: 'flex', alignItems: 'center', padding: '8px' }}
            >
              <TextField
                fullWidth
                id="friendInvite"
                variant="outlined"
                label="slackId로 친구 초대하기"
                color="secondary"
                value={inviteName}
                onChange={handleInviteName}
              />
              <Button
                id="friendInviteBtn"
                variant="contained"
                color="secondary"
                size="large"
                onClick={inviteFriend}
                style={{ marginLeft: '8px' }}
              >
                send
              </Button>
            </div>
          )}
        </>
      ) : null}
    </>
  );
};

export default ChatSetting;
