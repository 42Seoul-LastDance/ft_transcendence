'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MainHome from './page';
import { Provider, useDispatch, useSelector } from 'react-redux';
import SuperSocketProvider, {
  useSuperSocket,
} from '../contexts/superSocketContext';
import ChatSocketProvider, {
  useChatSocket,
} from '../contexts/chatSocketContext';
import store, { RootState } from '../redux/store';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import UserProfile from './(profile)/userProfile';
import { setViewProfile } from '../redux/viewSlice';
import { useRouter } from 'next/navigation';
import { clearSocketEvent, registerSocketEvent } from '../contexts/socket';
import { useEffect } from 'react';
import { Events, GetInvitationListJson } from '../interfaces';
import { GameJoinMode, GameMode, InviteType, JoinStatus } from '../enums';
import { Button } from '@mui/material';
import { setAlreadyPlayed, setCustomSet } from '../redux/matchSlice';
import HomeIcon from '@mui/icons-material/Home';

const HeaderNavigationBarContent = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const notiCount = useSelector((state: RootState) => state.user.notiCount);
  const invitationList = useSelector(
    (state: RootState) => state.user.invitationList,
  );
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const dispatch = useDispatch();
  const router = useRouter();
  const chatSocket = useChatSocket();
  const superSocket = useSuperSocket();
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileOpen = () => {
    dispatch(setViewProfile({ viewProfile: true, targetSlackId: mySlackId }));
  };

  const handleSettingOpen = () => {
    chatSocket?.disconnect();
    superSocket?.disconnect();
    router.push('/setting');
  };

  const handleNotiOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    superSocket?.emit('getInvitationList');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const declineInvitation = (hostSlackId: string) => {
    superSocket?.emit('declineInvite', { hostSlackId: hostSlackId });
  };

  const acceptGameInvitation = (hostSlackId: string, hostName: string) => {
    dispatch(
      setCustomSet({
        joinMode: GameJoinMode.CUSTOM_RECV,
        gameMode: GameMode.NONE,
        opponentName: hostName,
        opponentSlackId: hostSlackId,
      }),
    );
    dispatch(setAlreadyPlayed({ alreadyPlayed: false }));
    chatSocket?.disconnect();
    router.push('/game');
    superSocket?.emit('agreeInvite', { hostSlackId: hostSlackId });
  };

  const acceptChatInvitation = (
    hostSlackId: string,
    hostName: string,
    chatRoomName: string,
  ) => {
    if (!chatSocket?.connected) chatSocket?.connect();
    superSocket?.emit('agreeInvite', { hostSlackId: hostSlackId });
    chatSocket?.emit('joinPrivateChatRoom', { roomName: chatRoomName });
  };

  const handleSubmitInvite = (invitation: GetInvitationListJson) => {
    if (invitation.inviteType === InviteType.GAME) {
      acceptGameInvitation(invitation.hostSlackId, invitation.hostName);
    } else if (invitation.inviteType === InviteType.CHAT) {
      acceptChatInvitation(
        invitation.hostSlackId,
        invitation.hostName,
        invitation.chatRoomName,
      );
    }
  };

  const menuId = 'primary-search-account-menu';
  const renderNoti = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {invitationList.length === 0 ? (
        <Typography
          style={{
            fontSize: '15px',
            padding: '10px',
            backgroundColor: '#f4dfff',
            font: 'sans serif',
          }}
        >
          받은 초대가 없습니다
        </Typography>
      ) : (
        invitationList?.map(
          (invitation: GetInvitationListJson, index: number) => (
            <MenuItem key={index}>
              {invitation.inviteType === InviteType.CHAT
                ? `${invitation.hostName}님이 ${invitation.chatRoomType} 방인 ${invitation.chatRoomName}에 초대하셨습니다 ! `
                : `${invitation.hostName}님이 ` +
                  (invitation.gameMode === GameMode.NORMAL
                    ? 'NORMAL'
                    : 'HARD') +
                  ` 모드로 게임을 초대하셨습니다! `}
              <Button
                variant="contained"
                style={{
                  backgroundColor: '#f4dfff',
                  color: 'black',
                  margin: '8px',
                }}
                onClick={() => handleSubmitInvite(invitation)}
              >
                수락
              </Button>
              <Button
                variant="contained"
                style={{
                  backgroundColor: '#f4dfff',
                  color: 'black',
                  margin: '8px',
                }}
                onClick={() => declineInvitation(invitation.hostSlackId)}
              >
                거절
              </Button>
            </MenuItem>
          ),
        )
      )}
    </Menu>
  );

  return (
    <>
      <AppBar
        component="nav"
        position="static"
        sx={{
          flexGrow: 1,
          background: 'black',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <HomeIcon
              sx={{ marginRight: '5px' }}
              onClick={() => {
                window.location.reload();
              }}
            />
            <Typography align="left" variant="h6" noWrap component="div">
              Home
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              aria-label="Notification Menu"
              size="large"
              edge="end"
              onClick={handleNotiOpen}
              color="inherit"
            >
              <Badge badgeContent={notiCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              aria-label="Profile modal"
              size="large"
              edge="end"
              onClick={handleProfileOpen}
              color="inherit"
            >
              <AccountCircle />
              <UserProfile />
            </IconButton>
            <IconButton
              aria-label="Setting page"
              size="large"
              edge="end"
              onClick={handleSettingOpen}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderNoti}
      <MainHome />
    </>
  );
};

const HeaderNavigationBar = () => {
  return (
    <>
      <Provider store={store}>
        <SuperSocketProvider>
          <ChatSocketProvider>
            <HeaderNavigationBarContent />
          </ChatSocketProvider>
        </SuperSocketProvider>
      </Provider>
    </>
  );
};

export default HeaderNavigationBar;
