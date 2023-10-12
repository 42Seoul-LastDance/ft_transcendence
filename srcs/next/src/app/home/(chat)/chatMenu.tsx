import { useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import UserProfile from '../(profile)/userProfile';
import { UserPermission, UserProfileProps } from '@/app/interface';
import { useChatSocket } from '@/app/context/chatSocketContext';
import { myAlert } from '../alert';
import { useRouter } from 'next/navigation';

const ChatMenu = (selectedMember: UserProfileProps) => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const target = selectedMember.targetName;
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const router = useRouter();

  // 프로필 버튼 클릭 핸들러
  const handleProfileClick = () => {
    setUserProfileOpen(true);
  };
  // 모달 닫기 핸들러
  const handleCloseProfileModal = () => {
    setUserProfileOpen(false);
  };

  const isSuper = () => {
    if (target === 'jaejkim') {
      myAlert('error', `${target}: 하 하 ~ 어림도 없죠? `, dispatch);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  const handleGameClick = () => {
    console.log('game');
  };

  const handleKickClick = () => {
    console.log('kick');
    isSuper();
    chatSocket?.emit('kickUser', {
      roomname: chatRoom?.roomName,
      targetname: target,
    });
  };

  const handleBanClick = () => {
    console.log('ban');
    isSuper();
  };

  const handleMuteClick = () => {
    console.log('mute');
    isSuper();
    chatSocket?.emit('muteUser', {
      status: chatRoom?.status,
      roomName: chatRoom?.roomName,
      targetName: target,
      time: 30,
    });
  };

  const handleMakeOperatorClick = () => {
    console.log('make operator');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        '& > *': {
          m: 1,
        },
      }}
    >
      <ButtonGroup
        key="chatMenu"
        orientation="vertical"
        aria-label="vertical outlined button group"
      >
        <Button key="profile" onClick={handleProfileClick}>
          Profile
        </Button>
        <Button key="game" onClick={handleGameClick}>
          Game
        </Button>
        {chatRoom!.userPermission <= UserPermission.ADMIN && (
          <>
            <Button key="kick" onClick={handleKickClick}>
              Kick
            </Button>
            <Button key="ban" onClick={handleBanClick}>
              Ban
            </Button>
            <Button key="mute" onClick={handleMuteClick}>
              Mute
            </Button>
          </>
        )}
        {chatRoom!.userPermission <= UserPermission.OWNER && (
          <Button key="makeOperator" onClick={handleMakeOperatorClick}>
            Make Operator
          </Button>
        )}
      </ButtonGroup>
      {isUserProfileOpen && <UserProfile targetName={target} />}
    </Box>
  );
};

export default ChatMenu;
