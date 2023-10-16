import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import UserProfile from '../(profile)/userProfile';
import { useChatSocket } from '@/app/context/chatSocketContext';
import { myAlert } from '../alert';
import { useRouter } from 'next/navigation';
import { GameJoinMode, GameMode } from '@/app/Enums';
import { clearSocketEvent, registerSocketEvent } from '@/app/context/socket';
import Link from 'next/link';
import { Events, UserPermission } from '@/app/interface';
import { setMyPermission } from '@/app/redux/roomSlice';
import { setCustomSet } from '@/app/redux/matchSlice';

const ChatMenu = () => {
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const selectedMember = useSelector(
    (state: RootState) => state.room.selectedMember,
  );
  const memberList = useSelector(
    (state: RootState) => state.room.roomMemberList,
  );
  const myPermission = useSelector(
    (state: RootState) => state.room.myPermission,
  );
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const chatSocket = useChatSocket();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const e: Events[] = [
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
  }, []);

  // getMyPermission
  // roomName, roomStatus

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
      }, 3000);
    }
  };

  const handleGameClick = (mode: GameMode) => {
    dispatch(
      setCustomSet({
        joinMode: GameJoinMode.CUSTOM_SEND,
        gameMode: mode,
        opponentName: selectedMember?.userName,
      }),
    );
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

        <Link href={'/game'}>
          <Button
            key="gameNormal"
            onClick={() => {
              handleGameClick(GameMode.NORMAL);
            }}
          >
            Invite Game Normal
          </Button>
        </Link>
        <Link href={'/game'}>
          <Button
            key="gameHard"
            onClick={() => {
              handleGameClick(GameMode.HARD);
            }}
          >
            Invite Game Hard
          </Button>
        </Link>

        {myPermission <= UserPermission.ADMIN &&
        myPermission < selectedMember!.permission ? (
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
        ) : null}
        {myPermission === UserPermission.OWNER ? (
          <Button key="makeOperator" onClick={handleMakeOperatorClick}>
            Make Operator
          </Button>
        ) : null}
      </ButtonGroup>
      {isUserProfileOpen && (
        <UserProfile targetName={selectedMember!.userName} />
      )}
    </Box>
  );
};

export default ChatMenu;
