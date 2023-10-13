import { useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import UserProfile from '../(profile)/userProfile';
import { MemberList, UserPermission, UserProfileProps } from '@/app/interface';
import { useChatSocket } from '@/app/context/chatSocketContext';
import { myAlert } from '../alert';
import { useRouter } from 'next/navigation';

const ChatMenu = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const selectedMember = useSelector(
    (state: RootState) => state.room.selectedMember,
  );
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
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
    if (selectedMember?.userName === 'jaejkim') {
      myAlert(
        'error',
        `${selectedMember?.userName}: 하 하 ~ 어림도 없죠? `,
        dispatch,
      );
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  const handleGameClick = () => {
    console.log('game');
    console.log('selectMember.userName', selectedMember?.userName);
  };

  const handleKickClick = () => {
    console.log('selectMember.userName', selectedMember?.userName);
    isSuper();
    chatSocket?.emit('kickUser', {
      roomname: chatRoom?.roomName,
      targetname: selectedMember?.userName,
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
      targetName: selectedMember?.userName,
      time: 60,
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
        <Button key="kick" onClick={handleKickClick}>
          Kick
        </Button>
        <Button key="ban" onClick={handleBanClick}>
          Ban
        </Button>
        <Button key="mute" onClick={handleMuteClick}>
          Mute
        </Button>
        <Button key="makeOperator" onClick={handleMakeOperatorClick}>
          Make Operator
        </Button>
      </ButtonGroup>
      {isUserProfileOpen && (
        <UserProfile targetName={selectedMember!.userName} />
      )}
    </Box>
  );
};

export default ChatMenu;
