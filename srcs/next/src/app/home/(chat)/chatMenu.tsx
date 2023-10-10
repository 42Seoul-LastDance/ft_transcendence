import { useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import UserProfile from '../(profile)/userProfile';
import { UserPermission, UserProfileProps } from '@/app/interface';

const ChatMenu = (selectedMember: UserProfileProps) => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);

  // 프로필 버튼 클릭 핸들러
  const handleProfileClick = () => {
    setUserProfileOpen(true);
  };
  // 모달 닫기 핸들러
  const handleCloseProfileModal = () => {
    setUserProfileOpen(false);
  };

  const handleMuteClick = () => {
    console.log('mute');
  };
  const handleGameClick = () => {
    console.log('game');
  };
  const handleKickClick = () => {
    console.log('kick');
  };
  const handleBanClick = () => {
    console.log('ban');
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
        <Button key="mute" onClick={handleMuteClick}>
          Mute
        </Button>
        <Button key="game" onClick={handleGameClick}>
          Game
        </Button>
        {chatRoom?.userPermission === UserPermission.ADMIN && (
          <>
            <Button key="kick" onClick={handleKickClick}>
              Kick
            </Button>
            <Button key="ban" onClick={handleBanClick}>
              Ban
            </Button>
          </>
        )}
        {chatRoom?.userPermission === UserPermission.OWNER && (
          <Button key="makeOperator" onClick={handleMakeOperatorClick}>
            Make Operator
          </Button>
        )}
      </ButtonGroup>
      {isUserProfileOpen && (
        <UserProfile targetName={selectedMember.targetName} />
      )}
    </Box>
  );
};

export default ChatMenu;
