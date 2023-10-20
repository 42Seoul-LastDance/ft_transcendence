// ChatSetting.js
import React, { useState, MouseEvent, useEffect } from 'react';
import List from '@mui/material/List';
import {
  Button,
  ListSubheader,
  Menu,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CommonListItem from './CommonListItem';
import ChatMenu from './chatMenu';
import {
  Events,
  Member,
  UserInfoJson,
} from '@/app/interfaces';
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

const ChatSetting = () => {
  const dispatch = useDispatch();
  const superSocket = useSuperSocket();
  const chatSocket = useChatSocket();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [password, setPassword] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
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
    console.log('chatRoom', chatRoom);
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
    console.log('checkExistUser', inviteName);
    const response = await sendRequest('post', `/users/exist/`, router, {
      slackId: inviteName,
    });
    if (response.status > 300) {
      myAlert('error', '존재하지 않는 유저입니다', dispatch);
      return false;
    } else return true;
  };

  const inviteFriend = async () => {
    if (
      isValid('유저네임이', inviteName, maxUniqueNameLength, dispatch) === false
    )
      return;
    const exist = await checkExistUser();
    console.log('유저 있었나요', exist);
    memberList[0].slackId
    memberList.map((member, index)=> {
      console.log(member.slackId, member.userName);
    })

    console.log('memberlist:', memberList);
    if (!exist) return;
    console.log('초대 시 데이터 확인: ', chatRoom);
    superSocket?.emit('sendInvitation', {
      slackId: inviteName,
      inviteType: InviteType.CHAT,
      chatRoomName: chatRoom?.roomName,
      chatRoomType: chatRoom?.status,
      gameMode: GameMode.NONE,
    });
    myAlert('success', '초대 메시지를 보냈습니다', dispatch);
    //TODO 입력한 input창 clear해주세요 (juhoh)
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    isValid('비밀번호가', event.target.value, maxPasswordLength, dispatch);
    setPassword(event.target.value);
  };

  const submitPassword = () => {
    chatSocket?.emit('setRoomPassword', {
      roomName: chatRoom?.roomName,
      password: password,
    });
    //TODO 입력한 input창 clear해주세요 (juhoh)
  };

  const unBanUser = (targetSlackId: string) => {
    chatSocket?.emit('unbanUser', {
      roomName: chatRoom?.roomName,
      roomStatus: RoomStatus.PUBLIC,
      targetSlackId: targetSlackId,
    });
  };

  return (
    <>
      <List
        sx={{ width: 300, bgcolor: 'AntiqueWhite' }}
        subheader={<ListSubheader>대화 참여자</ListSubheader>}
      >
        {memberList?.map((member: Member, index: number) => (
          <CommonListItem
            key={index}
            primaryText={member.userName}
            secondText={member.slackId}
            permission={member.permission}
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              handleClick(event, member)
            }
          ></CommonListItem>
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
        sx={{ width: 300, bgcolor: 'Cadetblue' }}
        subheader={
          <ListSubheader>앞으로 채팅방에 못 들어오는 유저</ListSubheader>
        }
      >
        {banList?.map((member: UserInfoJson, index: number) => (
          <ListItem key={index}>
            <ListItemText primary={member.slackId} secondary="introduce" />
            {myPermission <= UserPermission.ADMIN && (
              <Button
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
          ): (
            <div
              style={{ display: 'flex', alignItems: 'center', padding: '8px' }}
            >
              <TextField
                fullWidth
                id="friendInvite"
                variant="outlined"
                label="slackId로 친구 초대하기"
                value={inviteName}
                onChange={handleInviteName}
              />
              <Button
                id="friendInviteBtn"
                variant="contained"
                color="primary"
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
