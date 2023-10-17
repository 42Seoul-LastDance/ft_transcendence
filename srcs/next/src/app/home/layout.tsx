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
} from '../context/superSocketContext';
import ChatSocketProvider, {
  useChatSocket,
} from '../context/chatSocketContext';
import store, { RootState } from '../redux/store';
import SettingsIcon from '@mui/icons-material/Settings';
// import Notification from '../notification';
import UserProfile from './(profile)/userProfile';
import { setViewNoti, setViewProfile } from '../redux/viewSlice';
import { useRouter } from 'next/navigation';

const HeaderNavigationBarContent = () => {
  const myName = useSelector((state: RootState) => state.user.userName);
  const dispatch = useDispatch();
  const viewProfile = useSelector((state: RootState) => state.view.viewProfile);
  const router = useRouter();
  const chatSocket = useChatSocket();
  const superSocket = useSuperSocket();

  const handleProfileOpen = () => {
    dispatch(setViewProfile(true));
  };

  const handleNotiOpen = () => {
    dispatch(setViewNoti(true));
  };

  const handleSettingOpen = () => {
    chatSocket?.disconnect();
    superSocket?.disconnect();
    setTimeout(() => {
      router.push('/setting');
    }, 500);
  };
  //   dispatch();
  // };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar component="nav" position="static">
          <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              onClick={handleNotiOpen}
              color="inherit"
            >
              <Badge badgeContent={1} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              onClick={handleProfileOpen}
              color="inherit"
            >
              <AccountCircle />
              <UserProfile targetName={myName!} />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="setting page of current user"
              onClick={handleSettingOpen}
              color="inherit"
              sx={{ paddingLeft: '3px' }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
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
