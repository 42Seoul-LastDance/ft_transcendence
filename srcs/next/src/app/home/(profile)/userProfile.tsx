'use client';
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useRouter } from 'next/navigation';
import sendRequest from '@/app/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { setViewProfile } from '@/app/redux/viewSlice';
import { useSuperSocket } from '@/app/contexts/superSocketContext';
import { CircularProgress, Divider } from '@mui/material';
import { setJoin } from '@/app/redux/userSlice';
import { FriendStatus, JoinStatus } from '@/app/enums';

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

const UserProfile = () => {
  const superSocket = useSuperSocket();
  const router = useRouter();
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const viewProfile = useSelector((state: RootState) => state.view.viewProfile);
  const targetSlackId = useSelector(
    (state: RootState) => state.view.targetSlackId,
  );
  const [close, setClose] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(0);
  const [exp, setExp] = useState<number>(0);
  const [targetName, setTargetName] = useState<string>('');
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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const join = useSelector((state: RootState) => state.user.join);

  const dispatch = useDispatch();

  const requestIsFriend = async () => {
    const friendResp = await sendRequest(
      'get',
      `/friends/isFriend/${targetSlackId}`,
      router,
    );
    setFriendStatus(friendResp.data['status']);
    if (
      friendResp.data['status'] === FriendStatus.LAGGING ||
      friendResp.data['status'] === FriendStatus.REQUESTED
    )
      setFriendRequestAvailable(false);
    console.log('친구니?', friendResp.data['status']);
  };

  const requestIsBlocked = async () => {
    const blockedResp = await sendRequest(
      'get',
      `/block/isBlocked/${targetSlackId}`,
      router,
    );
    setIsBlocked(blockedResp.data['isBlocked']);
    console.log('블락이니?', blockedResp.data['isBlocked']);
  };

  const handleOpen = async () => {
    setClose(false);
    if (mySlackId !== targetSlackId) {
      await requestIsFriend();
      await requestIsBlocked();

      const friendGameData = await sendRequest(
        'get',
        `games/getFriendGameData/${targetSlackId}`,
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
      `/users/profile/${targetSlackId}`,
      router,
    );
    setTargetName(response.data['userName']);
    setLevel(response.data['level']);
    setExp(response.data['exp']);
    setSlackId(response.data['slackId']);

    const gameData = await sendRequest(
      'get',
      `/games/getGameData/${targetSlackId}`,
      router,
    );
    setNormalWin(gameData.data['normalWin']);
    setNormalLose(gameData.data['normalLose']);
    setHardWin(gameData.data['hardWin']);
    setHardLose(gameData.data['hardLose']);

    setTimeout(() => {
      setIsLoaded(true), 500;
    });
  };

  useEffect(() => {
    setIsLoaded(false);
    if (viewProfile === true) handleOpen();
  }, [viewProfile, targetSlackId]);

  useEffect(() => {
    setIsLoaded(false);
    if (close === true)
      dispatch(setViewProfile({ viewProfile: false, targetSlackId: null }));
  }, [close]);

  const handleClose = () => {
    setClose(true);
  };

  const requestBeFriend = async () => {
    await sendRequest('put', `/friends/request/`, router, {
      friendSlackId: targetSlackId,
    });
    requestIsFriend();
  };

  const removeFriend = async () => {
    await sendRequest('delete', `/friends/delete/${targetSlackId}`, router);
    superSocket?.emit('deleteFriend', {
      userSlackId: mySlackId,
      targetSlackId: targetSlackId,
    });
    requestIsFriend();
    if (join === JoinStatus.DM) dispatch(setJoin(JoinStatus.NONE));
    setClose(true);
  };

  const block = async () => {
    await sendRequest('patch', `/block/blockUser/${targetSlackId}`, router);
    requestIsBlocked();
  };

  const unBlock = async () => {
    await sendRequest('delete', `/block/unblockUser/${targetSlackId}`, router);
    requestIsBlocked();
  };

  // const logout = async () => {
  //   const response = await sendRequest('post', `/auth/logout`, router);
  //   if (response.status === 201) {
  //     superSocket?.disconnect();
  //     chatSocket?.disconnect();
  //     removeCookie('access_token');
  //     removeCookie('refresh_token');
  //     setTimeout(() => {
  //       router.push('/');
  //     }, 1000);
  //   }
  // };

  return (
    <>
      <Modal
        open={viewProfile}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {isLoaded ? (
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h1"
              color="CadetBlue"
            >
              {targetName}'s Profile
            </Typography>
            <Divider />
            <Typography
              id="modal-modal-description"
              component="h6"
              color="Grey"
              sx={{ mt: 2 }}
            >
              slackId: {slackId}
              <br />
              Level: {level}
              <br />
              Exp: {exp} ({((exp / ((level + 1) * 500)) * 100).toFixed(2)}%)
              <br />
              <Divider />
            </Typography>
            <Typography
              id="modal-modal-description"
              component="h6"
              sx={{ mt: 2 }}
            >
              {mySlackId !== targetSlackId && (
                <>
                  친선전 횟수:{' '}
                  {fNormalWin + fNormalLose + fHardWin + fNormalLose}
                  <br />
                  {fNormalWin + fNormalLose > 0 && (
                    <span>
                      NORMAL 모드 승률:{' '}
                      {(
                        (fNormalWin / (fNormalWin + fNormalLose)) *
                        100
                      ).toFixed(2)}
                      %<br />
                    </span>
                  )}
                  {fHardWin + fHardLose > 0 && (
                    <span>
                      HARD 모드 승률:{' '}
                      {((fHardWin / (fHardWin + fHardLose)) * 100).toFixed(2)}%
                      <br />
                    </span>
                  )}
                  {fLeftWin + fLeftLose > 0 && (
                    <span>
                      왼쪽에 있을 때 승률:{' '}
                      {((fLeftWin / (fLeftWin + fLeftLose)) * 100).toFixed(2)}%
                      <br />
                    </span>
                  )}
                  {fRightWin + fRightLose > 0 && (
                    <span>
                      오른쪽에 있을 때 승률:{' '}
                      {((fRightWin / (fRightWin + fRightLose)) * 100).toFixed(
                        2,
                      )}
                      %<br />
                    </span>
                  )}
                </>
              )}
            </Typography>
            <br />
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {mySlackId !== targetSlackId && (
                <>
                  {friendStatus === FriendStatus.FRIEND ? (
                    <Button onClick={removeFriend} color="error">
                      [ 친구 해제 ]
                    </Button>
                  ) : (
                    <Button
                      onClick={requestBeFriend}
                      disabled={!friendRequestAvailable}
                      color="success"
                    >
                      [ 친구 추가 ]
                    </Button>
                  )}
                  {isBlocked === true ? (
                    <Button onClick={unBlock} color="success">
                      [ 차단 해제 ]
                    </Button>
                  ) : (
                    <Button onClick={block} color="error">
                      [ 차단 하기 ]
                    </Button>
                  )}
                </>
              )}
            </Typography>
          </Box>
        ) : (
          <Box sx={style}>
            <CircularProgress />
          </Box>
        )}
      </Modal>
    </>
  );
};

export default UserProfile;
