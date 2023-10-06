import { TokenType } from './interface';
import { useRouter } from 'next/navigation';
import { getCookie } from './Cookie';
import BACK_URL from './globals';
import axios from 'axios';
import { setToken } from './redux/userSlice';
import { useDispatch } from 'react-redux';

const tryAuth = async () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // refresh 토큰으로 access 토큰 재발급 로직
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) router.push('/');

  const response = await axios.get(`${BACK_URL}/auth/regenerateToken`, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (response.status == 200) {
    const accessToken = getCookie('access_token');
    dispatch(setToken(accessToken));
  } else if (response.status == 401) router.push('/');
  else console.log('refresh token: ', response.status);
};

export default tryAuth;
