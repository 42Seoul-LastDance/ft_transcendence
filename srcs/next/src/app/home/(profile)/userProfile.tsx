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
import { Card, CircularProgress, Divider } from '@mui/material';
import { setJoin, setUserImg } from '@/app/redux/userSlice';
import {
  FriendStatus,
  JoinStatus,
  PlayerSide,
  GameEndStatus,
  MyHistory,
  GameType,
} from '@/app/enums';
import { GameHistoryJson } from '@/app/interfaces';
import Avatar from '@mui/material/Avatar';
import sendRequestImage from '@/app/imageApi';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AxiosHeaderValue from 'axios';

const UserProfile = () => {
  const superSocket = useSuperSocket();
  const router = useRouter();
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const viewProfile = useSelector((state: RootState) => state.view.viewProfile);
  const targetSlackId = useSelector(
    (state: RootState) => state.view.targetSlackId,
  );
  const [close, setClose] = useState<boolean>(false);
  //* users profile
  const [level, setLevel] = useState<number>(0);
  const [exp, setExp] = useState<number>(0);
  const [targetName, setTargetName] = useState<string>('');
  const [slackId, setSlackId] = useState<string>('');
  //* users profileImg
  const [mimeType, setMimeType] = useState<AxiosHeaderValue | undefined>('');
  const [imageFile, setImageFile] = useState<string | undefined>('');
  //* game ranking
  const [normalWin, setNormalWin] = useState<number>(0);
  const [normalLose, setNormalLose] = useState<number>(0);
  const [hardWin, setHardWin] = useState<number>(0);
  const [hardLose, setHardLose] = useState<number>(0);
  //* game friend
  const [fNormalWin, setfNormalWin] = useState<number>(0);
  const [fNormalLose, setfNormalLose] = useState<number>(0);
  const [fHardWin, setfHardWin] = useState<number>(0);
  const [fHardLose, setfHardLose] = useState<number>(0);
  const [fRightWin, setfRightWin] = useState<number>(0);
  const [fRightLose, setfRightLose] = useState<number>(0);
  const [fLeftWin, setfLeftWin] = useState<number>(0);
  const [fLeftLose, setfLeftLose] = useState<number>(0);
  //* game history
  const [gameHistory, setGameHistory] = useState<MyHistory[]>([]);
  //* ////////////////////
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
    const friendResp = await sendRequest('post', `/friends/isFriend/`, router, {
      friendSlackId: targetSlackId,
    });
    setFriendStatus(friendResp.data['status']);
    if (
      friendResp.data['status'] === FriendStatus.LAGGING ||
      friendResp.data['status'] === FriendStatus.REQUESTED
    )
      setFriendRequestAvailable(false);
  };

  const requestIsBlocked = async () => {
    const blockedResp = await sendRequest(
      'get',
      `/block/isBlocked/${targetSlackId}`,
      router,
    );
    setIsBlocked(blockedResp.data['isBlocked']);
  };

  const getAndSetMyHistory = (data: GameHistoryJson[]) => {
    let newHistrories: MyHistory[] = [];

    data?.forEach((inputHistory) => {
      let newHistory: MyHistory = {
        leftName: '',
        rightName: '',
        score: '',
        gameEnd: '',
        gameType: '',
        win: '',
      };

      if (inputHistory.mySide === PlayerSide.LEFT) {
        newHistory.leftName = `${targetSlackId}`;
        newHistory.rightName = `${inputHistory.rivalName}(${inputHistory.rivalSlackId})`;
        newHistory.score = `${inputHistory.myScore} : ${inputHistory.rivalScore}`;
      } else {
        newHistory.leftName = `${inputHistory.rivalName}(${inputHistory.rivalSlackId})`;
        newHistory.rightName = `${targetSlackId}`;
        newHistory.score = `${inputHistory.rivalScore} : ${inputHistory.myScore}`;
      }

      newHistory.win = `${
        inputHistory.myScore > inputHistory.rivalScore ? 'Win' : 'Lose'
      }`;
      newHistory.gameEnd = newHistory.win;
      switch (inputHistory.gameEnd) {
        case GameEndStatus.CHEATING:
          newHistory.gameEnd += ' (Cheated)';
          break;
        case GameEndStatus.DISCONNECT:
          newHistory.gameEnd += ' (Disconnected)';
          break;
        case GameEndStatus.OUTGAME:
          newHistory.gameEnd += ' (Got lazy)';
          break;
      }
      newHistory.gameType =
        inputHistory.gameType === GameType.MATCH ? 'Rank' : 'Custom';

      newHistrories.push(newHistory);
    });
    setGameHistory(newHistrories);
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

    const responseImg = await sendRequestImage(
      'get',
      `/users/profileImg/${targetSlackId}`,
      router,
    );
    setMimeType(responseImg.headers['Content-Type']);
    const image = Buffer.from(responseImg.data, 'binary').toString('base64');
    setImageFile(`data:${mimeType};base64,${image}`);
    dispatch(setUserImg(`data:${mimeType};base64,${image}`));

    const gameData = await sendRequest(
      'get',
      `/games/getGameData/${targetSlackId}`,
      router,
    );
    setNormalWin(gameData.data['normalWin']);
    setNormalLose(gameData.data['normalLose']);
    setHardWin(gameData.data['hardWin']);
    setHardLose(gameData.data['hardLose']);

    const gameHistory = await sendRequest(
      'get',
      `/games/getGameHistory/${targetSlackId}`,
      router,
    );
    getAndSetMyHistory(gameHistory.data);

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
    dispatch(setViewProfile({ viewProfile: false, targetSlackId: null }));
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

  const cardStyle = {
    width: '300px',
    height: 'auto',
    padding: '20px',
    margin: '22px',
    borderRadius: '15px',
    display: 'flex',
    // left: 0,
    // alignItems: 'left',
    opacity: '0.8',
    bgcolor: 'white',
    flexDirection: 'column',
  };

  const commonStyle = {
    variant: 'h6',
    color: 'black',
    fontSize: '18px',
    marginRight: '8px',
    display: 'inline',
    flexDirection: 'column',
  };

  const valueStyle = {
    variant: 'h6',
    color: '#a0b8cf',
    fontSize: '18px',
    display: 'inline',
    flexDirection: 'column',
  };

  const buttonStyle = {
    marginLeft: '8px',
    borderRadius: '15px',
    width: '80px',
    height: '40px',
  };

  return (
    <Modal
      className="modal"
      open={viewProfile}
      onClose={handleClose}
      style={{
        marginTo: '100px',
        display: 'flex',
        justifyContent: 'center', // 수평 중앙 정렬
        alignItems: 'center', // 수직 중앙 정렬
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {isLoaded ? (
        <Box className="modal-content" style={{ marginTop: '1000px' }}>
          {/* ------------------------------  프로필  -------------------------------*/}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Card style={{ ...cardStyle }}>
              <Typography>{targetName}'s Profile</Typography>
              <Avatar
                src={imageFile || undefined}
                alt={`${slackId}`}
                style={{ width: 80, height: 80, borderRadius: '25%' }}
              />
              <div>
                {mySlackId !== targetSlackId && (
                  <div>
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
                  </div>
                )}
              </div>
            </Card>
            {/* 아이디, 레벨, exp */}
            {/* ------------------------------   인트라 아이디   -------------------------------*/}
            <Card style={{ ...cardStyle, display: 'flex' }}>
              <div>
                <Typography style={{ ...commonStyle }}>intra Id: </Typography>
                <Typography style={{ ...valueStyle }}>{slackId}</Typography>
              </div>
              <div>
                <Typography style={{ ...commonStyle }}> Level :</Typography>
                <Typography style={{ ...valueStyle }}> {level}</Typography>
              </div>
              <div>
                <Typography style={{ ...commonStyle }}> Exp :</Typography>
                <Typography style={{ ...valueStyle }}>
                  {' '}
                  {exp} ({((exp / ((level + 1) * 500)) * 100).toFixed(2)}
                  %)
                </Typography>
              </div>
            </Card>
          </div>
          {/* ------------------------------   승률   -------------------------------*/}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Card style={{ ...cardStyle }}>
              <div>
                <Typography style={{ ...commonStyle }}>
                  RANK 게임 수:
                </Typography>
                <Typography style={{ ...valueStyle }}>
                  {normalWin + normalLose + hardWin + hardLose}
                </Typography>
              </div>
              <div>
                <Typography style={{ ...commonStyle }}>
                  NORMAL 모드 승률:
                </Typography>
                <Typography style={{ ...valueStyle }}>
                  {normalWin + normalLose
                    ? ((normalWin / (normalWin + normalLose)) * 100).toFixed(
                        2,
                      ) + '%'
                    : null}
                </Typography>
              </div>
              <div>
                <Typography style={{ ...commonStyle }}>
                  HARD 모드 승률:
                </Typography>
                <Typography style={{ ...valueStyle }}>
                  {hardWin + hardLose
                    ? ((hardWin / (hardWin + hardLose)) * 100).toFixed(2) + '%'
                    : null}
                </Typography>
              </div>
            </Card>

            {/* ------------------------------   친구랑 승률   -------------------------------*/}
            <div>
              {mySlackId !== targetSlackId ? (
                <Card
                  style={{
                    ...cardStyle,
                  }}
                >
                  <div>
                    <Typography style={{ ...commonStyle }}>
                      친선전 횟수:
                    </Typography>
                    <Typography style={{ ...valueStyle }}>
                      {fNormalWin + fNormalLose + fHardWin + fNormalLose}
                    </Typography>
                  </div>
                  <div>
                    <Typography style={{ ...commonStyle }}>
                      NORMAL 모드 승률:
                    </Typography>
                    {fNormalWin + fNormalLose
                      ? (
                          (fNormalWin / (fNormalWin + fNormalLose)) *
                          100
                        ).toFixed(2) + '%'
                      : null}
                    <Typography style={{ ...valueStyle }}></Typography>
                  </div>
                  <div>
                    <Typography style={{ ...commonStyle }}>
                      HARD 모드 승률:
                    </Typography>
                    <Typography style={{ ...valueStyle }}>
                      {fHardWin + fHardLose
                        ? ((fHardWin / (fHardWin + fLeftLose)) * 100).toFixed(
                            2,
                          ) + '%'
                        : null}
                    </Typography>
                  </div>
                  <div>
                    <Typography style={{ ...commonStyle }}>
                      왼쪽에 있을 때 승률:
                    </Typography>
                    <Typography style={{ ...valueStyle }}>
                      {fLeftWin + fLeftLose
                        ? ((fLeftWin / (fLeftWin + fLeftLose)) * 100).toFixed(
                            2,
                          ) + '%'
                        : null}
                    </Typography>
                  </div>
                  <div>
                    <Typography style={{ ...commonStyle }}>
                      오른쪽에 있을 때 승률:
                    </Typography>
                    <Typography style={{ ...valueStyle }}>
                      {fRightWin + fRightLose
                        ? (
                            (fRightWin / (fRightWin + fRightLose)) *
                            100
                          ).toFixed(2) + '%'
                        : null}
                    </Typography>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
          {/* ------------------------------   전적테이블  -------------------------------*/}
          <Card sx={{ ...cardStyle, width: '650' }}>
            <Typography style={{ ...commonStyle }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="middle">Left Player</TableCell>
                      <TableCell align="middle">Score</TableCell>
                      <TableCell align="middle">Right Player</TableCell>
                      <TableCell align="middle">Game Type</TableCell>
                      <TableCell align="middle">End Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gameHistory.map((gameHistory, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row" align="middle">
                          <p style={{ textAlign: 'center' }}>
                            {gameHistory.leftName}
                          </p>
                        </TableCell>
                        <TableCell align="middle">
                          {gameHistory.score}
                        </TableCell>
                        <TableCell align="middle">
                          <p style={{ textAlign: 'center' }}>
                            {gameHistory.rightName}
                          </p>
                        </TableCell>
                        <TableCell align="middle">
                          {gameHistory.gameType === 'Rank' ? (
                            <p
                              style={{
                                color: 'magenta',
                                textAlign: 'center',
                              }}
                            >
                              {gameHistory.gameType}
                            </p>
                          ) : (
                            <p
                              style={{
                                color: 'skyblue',
                                textAlign: 'center',
                              }}
                            >
                              {gameHistory.gameType}
                            </p>
                          )}
                        </TableCell>
                        <TableCell align="middle">
                          {gameHistory.win === 'Win' ? (
                            <p style={{ color: 'blue', textAlign: 'center' }}>
                              {gameHistory.gameEnd}
                            </p>
                          ) : (
                            <p style={{ color: 'red', textAlign: 'center' }}>
                              {gameHistory.gameEnd}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <br />
            </Typography>
          </Card>
        </Box>
      ) : (
        <CircularProgress />
      )}
    </Modal>
  );
};

export default UserProfile;
