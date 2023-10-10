'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Avatar } from '@mui/material';
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
  // const [userName, setUserName] = useState<string>('');
  const [slackId, setSlackId] = useState<string>('');
  const [friendStatus, setFriendStatus] = useState<FriendStatus>(
    FriendStatus.UNKNOWN,
  );
  const [friendRequestAvailable, setFriendRequestAvailable] =
    useState<boolean>(true);
  const [isBlocked, setIsBlocked] = useState<boolean>(true);
  // const [slackId, setSlackId] = useState<string>('');

  const handleOpen = async () => {
    chatSocket?.disconnect();
    setOpen(true);

    if (myName !== props.targetName) {
      const friendResp = await sendRequest(
        'get',
        `/friends/isFriend/${props.targetName}`,
        router,
      );
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
      setIsBlocked(blockedResp.data['isBlocked']);
    }

    const response = await sendRequest(
      'get',
      `/users/profile/${props.targetName}`,
      router,
    );
    setLevel(response.data['level']);
    setExp(response.data['exp']);
    setSlackId(response.data['slackId']);
  };

  const handleClose = () => {
    chatSocket?.connect();
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
            level : {level}
            <br />
            exp : {exp}
            <br />
            slackId : {slackId}
            <br />
          </Typography>
          {myName !== props.targetName &&
            (friendStatus !== FriendStatus.FRIEND ? (
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
