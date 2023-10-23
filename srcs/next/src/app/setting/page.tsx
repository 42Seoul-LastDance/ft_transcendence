'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import sendRequest from '../api';
import { useRouter } from 'next/navigation';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import store, { RootState } from '../redux/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import HeaderAlert, { myAlert } from '../home/alert';
import { setName, setUserImg } from '../redux/userSlice';
import { styled } from '@mui/material/styles';
import { maxUniqueNameLength } from '../globals';
import { isValid } from '../home/valid';
import { removeCookie } from '@/app/cookie';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ButtonGroup, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import sendRequestImage from '../imageApi';
import { AxiosHeaderValue } from 'axios';

const SettingInfo = () => {
  const [require2fa, setRequire2fa] = useState<boolean>(false);
  const [switchOn, setSwitchOn] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>('');
  const [thumbImg, setThumbImg] = useState<string | null>(null);
  const [newImg, setNewImg] = useState<File | null>(null);
  const [mimeType, setMimeType] = useState<AxiosHeaderValue | undefined>('');
  const [curImage, setCurImage] = useState<string | undefined>(undefined);
  const userImg = useSelector((state: RootState) => state.user.userImg);
  const dispatch = useDispatch();
  const myName = useSelector((state: RootState) => state.user.userName);
  const mySlackId = useSelector((state: RootState) => state.user.userSlackId);
  const router = useRouter();

  useEffect(() => {
    if (mySlackId) {
      getUserInfo();
      getUserProfileImg();
    } else {
      router.push('/home');
    }
  }, []);

  const getUserInfo = async () => {
    const response = await sendRequest('get', '/users/userInfo/', router);
    if (response.status === 200)
    {
      setRequire2fa(response.data['require2fa']);
      setSwitchOn(response.data['require2fa']);
    }
    else
    {
      console.log('/users/userInfo/ 실패함')
    }
  };

  const getUserProfileImg = async () => {
    const responseImg = await sendRequestImage(
      'get',
      `/users/profileImg/${mySlackId}`,
      router,
    );
    setMimeType(responseImg.headers['Content-Type']);
    const image = Buffer.from(responseImg.data, 'binary').toString('base64');
    setCurImage(`data:${mimeType};base64,${image}`);
    dispatch(setUserImg(`data:${mimeType};base64,${image}`));
  };

  const checkDuplicate = async (): Promise<boolean> => {
    const response = await sendRequest('post', `/users/username/`, router, {
      name: inputName,
    });
    if (response.status < 300) 
		return true;
    else if (response.status === 404) router.push('/notFound');
    else if (response.status === 400) myAlert('error', '이미 존재하는 유저네임입니다.', dispatch);
    return false;
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if ((file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') ||
        file.size > 2 * 1024 * 1024
        ) {
        myAlert('error', '2MB 이하 jpg, jpeg, png 파일만 가능해요!', dispatch);
        event.target.value = '';
        return;
      }
      try {
        setNewImg(file);
        const imageUrl = URL.createObjectURL(file);
        if (imageUrl) setThumbImg(imageUrl);
        //하기 alert있으면 적용하기 안누를거같아서... 주석처리했습니다
		// myAlert('success', '성공적으로 업로드 되었습니다.', dispatch);
      } catch (error) {
        myAlert('error', '에러 발생! 다시 시도해주세요', dispatch);
        event.target.value = '';
      }
    }
  };

  const updateUserInfo = async () => {
    if (
      inputName !== '' &&
      (isValid('유저네임이', inputName, maxUniqueNameLength, dispatch) === false ||
      (await checkDuplicate()) === false)
    ) {
      setInputName('');
      return;
    }
    //기존 값과 같은지 확인
    if (inputName === '' && switchOn === require2fa && newImg === null) 
	{
		myAlert('error', '변경사항이 없어용', dispatch);
		return;
	}
    const formData = new FormData();
    if (inputName) formData.append('userName', inputName);
	if (switchOn) formData.append('require2fa', 'true');
	else formData.append('require2fa', 'false');
    if (newImg) formData.append('profileImage', newImg);

    const response = await sendRequestImage(
      'patch',
      '/users/update/',
      router,
      formData,
    );
    if (response.status < 300) {
      await getUserInfo();
      dispatch(setName(inputName));
	  //   getUserProfileImg();
      //   dispatch(setUserImg(inputImg!));
	    myAlert('success', '성공적으로 변경되었습니다.', dispatch);
    } else {
      myAlert('error', 'sth went wrong', dispatch);
    }
    setInputName('');
	setNewImg(null);
  };

  const handle2faChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwitchOn(!switchOn);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const logout = async () => {
    try {
      const response = await sendRequest('post', `/auth/logout`, router);
      removeCookie('access_token');
      removeCookie('refresh_token');
      router.push('/');
    } catch (error) {
      console.log('로그아웃 실패!', error);
    }
  };

  return (
    <>
      <HeaderAlert severity='warning'/>
      <IconButton
        onClick={() => {
          router.push('/home');
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <List style={{backgroundColor: '#f4dfff', padding: '30px'}}>
        <Typography style={{textAlign: 'center', font: 'sans-serif'}}> 개인정보 수정 </Typography>
        
      <ListItem key="userImg" divider>
      <Typography style={{textAlign: 'center', marginRight: '15px'}}> Profile </Typography>
          {thumbImg ? (<Avatar src={thumbImg} />) : (<Avatar src={curImage || undefined} alt={`${mySlackId}`} />)}
          <Button
            style={{ marginLeft:'30px'}}
            component="label"
            variant="contained"
            color="secondary"
            startIcon={<CloudUploadIcon />
          }
          >
            이미지 업로드 하기
            <VisuallyHiddenInput type="file" onChange={handleImageUpload} />
          </Button>
        </ListItem>
        <ListItem key="userName" divider>
          <ListItemText primary={`유저 이름: ${myName ? myName : ''}`} />
          <TextField
            id="outlined-basic"
            style={{width: '220px'}}
            label="변경할 닉네임을 입력하세요"
            variant="outlined"
            color="secondary"
            value={inputName}
            onChange={handleNameChange}
          />
        </ListItem>
        {/* <Button={}></Button=> */}
        <ListItem key="require2fa" divider>
          <ListItemText primary={`2fa 설정: `} />
          <Typography>Off</Typography>
          <Switch checked={switchOn} color="secondary" onChange={handle2faChange} />
          <Typography>On</Typography>
        </ListItem>
       
      </List>
      <ButtonGroup sx={{ gap: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => updateUserInfo()}
        >
          적용하기
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={logout}>
          로그아웃
        </Button>
      </ButtonGroup>
</>
  );
};

const Setting = () => {
  return (
    <Provider store={store}>
      <SettingInfo />
    </Provider>
  );
};

export default Setting;
