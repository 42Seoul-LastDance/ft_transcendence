'use client';
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Avatar, Divider } from '@mui/material';
import { useChatSocket } from '@/app/context/chatSocketContext';
import { setName } from '@/app/redux/userSlice';
import { useRouter } from 'next/navigation';
import sendRequest from '@/app/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { AxiosResponse } from 'axios';
import { UserProfileProps, FriendStatus } from '@/app/interface';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const UserProfile = (props: UserProfileProps) => {
  const chatSocket = useChatSocket();
  const router = useRouter();
  const myName = useSelector((state: RootState) => state.user.userName);
  const [open, setOpen] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(0);
  const [exp, setExp] = useState<number>(0);
  // const [userName, setUserName] = useState<string>(''); <-- 이거 안 보내주셔도요돼이 /user/profile/<name>의 username
  const [slackId, setSlackId] = useState<string>('');
  const [normalWin, setNormalWin] = useState<number>(0);
  const [normalLose, setNormalLose] = useState<number>(0);
  const [hardWin, setHardWin] = useState<number>(0);
  const [hardLose, setHardLose] = useState<number>(0);
  const [fNormalWin, setfNormalWin] = useState<number>(0);
  const [fNormalLose, setfNormalLose] = useState<number>(0);
  const [fHardWin, setfHardWin] = useState<number>(0);
  const [fHardLose, setfHardLose] = useState<number>(0);
  const [fRightWin, setfRightWin] = useState<number>(0);
  const [fRightLose, setfRightLose] = useState<number>(0);
  const [fLeftWin, setfLeftWin] = useState<number>(0);
  const [fLeftLose, setfLeftLose] = useState<number>(0);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>(
    FriendStatus.UNKNOWN,
  );
  const [friendRequestAvailable, setFriendRequestAvailable] =
    useState<boolean>(true);
  const [isBlocked, setIsBlocked] = useState<boolean>(true);

  const handleOpen = async () => {
    if (props.targetName === myName) chatSocket?.disconnect();
    setOpen(true);

    if (myName !== props.targetName) {
      const friendResp = await sendRequest(
        'get',
        `/friends/isFriend/${props.targetName}`,
        router,
      );
      console.log('이거 잘 오나요 ', friendResp.data);
      setFriendStatus(friendResp.data['status']);
      if (
        friendResp.data['status'] === FriendStatus.LAGGING ||
        friendResp.data['status'] === FriendStatus.REQUESTED
      )
        setFriendRequestAvailable(false);

      const blockedResp = await sendRequest(
        'get',
        `/block/isBlocked/${props.targetName}`,
        router,
      );
      console.log('이것도 잘 오나요', blockedResp);
      setIsBlocked(blockedResp.data['isBlocked']);
      const friendGameData = await sendRequest(
        'get',
        `games/getFriendGameData/${props.targetName}`,
        router,
      );
      setfNormalWin(friendGameData.data['normalWin']);
      setfNormalLose(friendGameData.data['normalLose']);
      setfHardWin(friendGameData.data['hardWin']);
      setfHardLose(friendGameData.data['hardLose']);
      setfRightWin(friendGameData.data['rightWin']);
      setfRightLose(friendGameData.data['rightLose']);
      setfLeftWin(friendGameData.data['leftWin']);
      setfLeftLose(friendGameData.data['leftLose']);
    }

    const response = await sendRequest(
      'get',
      `/users/profile/${props.targetName}`,
      router,
    );
    setLevel(response.data['level']);
    setExp(response.data['exp']);
    setSlackId(response.data['slackId']);

    const gameData = await sendRequest(
      'get',
      `/games/getGameData/${props.targetName}`,
      router,
    );
    setNormalWin(gameData.data['normalWin']);
    setNormalLose(gameData.data['normalLose']);
    setHardWin(gameData.data['hardWin']);
    setHardLose(gameData.data['hardLose']);
  };

  const handleClose = () => {
    if (props.targetName === myName) chatSocket?.connect();
    setOpen(false);
  };

  const requestBeFriend = async () => {
    const response = await sendRequest(
      'put',
      `/friends/request/${props.targetName}`,
      router,
    );
  };

  const removeFriend = async () => {
    const response = await sendRequest(
      'delete',
      `/friends/delete/${props.targetName}`,
      router,
    );
  };

  const block = async () => {
    const response = await sendRequest(
      'patch',
      `/block/blockUser/${props.targetName}`,
      router,
    );
  };

  const unBlock = async () => {
    const response = await sendRequest(
      'delete',
      `/block/unblockUser/${props.targetName}`,
      router,
    );
  };

  return (
    <div>
      <Button onClick={handleOpen}>See Profile</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {props.targetName}'s Profile
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            slackId : {slackId}
            <br />
            Level : {level}
            <br />
            Exp : {exp}({(exp / ((level + 1) * 500)) * 100}%)
            <br />
            <Divider />
            Total Ranking Game : {normalWin + normalLose + hardWin + hardLose}
            <br />
            Normal Ranking Game Winning Rate:{' '}
            {(normalWin / (normalWin + normalLose)) * 100}%
            <br />
            Hard Ranking Game Winning Rate:{' '}
            {(hardWin / (hardWin + hardLose)) * 100}%
            <br />
          </Typography>
          {myName !== props.targetName ? (
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <Divider />
              Total Friend Game :{' '}
              {fNormalWin + fNormalLose + fHardWin + fNormalLose}
              <br />
              Normal Friend Game Winning Rate:{' '}
              {(fNormalWin / (fNormalWin + fNormalLose)) * 100}%
              <br />
              Hard Friend Game Winning Rate:{' '}
              {(fHardWin / (fHardWin + fNormalLose)) * 100}%
              <br />
              Left Side Winning Rate:{' '}
              {(fLeftWin / (fLeftWin + fLeftLose)) * 100}%
              <br />
              Right Side Winning Rate:{' '}
              {(fRightWin / (fRightWin + fRightLose)) * 100}%
              <Divider />
            </Typography>
          ) : null}
          {myName !== props.targetName &&
            (friendStatus === FriendStatus.FRIEND ? (
              <button onClick={removeFriend}> 친구 해제 </button>
            ) : (
              <button
                onClick={requestBeFriend}
                disabled={friendRequestAvailable}
              >
                친구 추가
              </button>
            )) &&
            (isBlocked === true ? (
              <button onClick={unBlock}> 차단 해제 </button>
            ) : (
              <button onClick={block}>차단 하기</button>
            ))}
        </Box>
      </Modal>
    </div>
  );
};

export default UserProfile;
