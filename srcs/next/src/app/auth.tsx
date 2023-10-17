import { getCookie, setCookie } from './Cookie';
import axios, { AxiosResponse } from 'axios';
import { BACK_URL } from './globals';

export const reGenerateToken = async (router: any): Promise<AxiosResponse> => {
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) {
    console.log('refresh token is not exist');
    router.push('/');
    return new Promise(() => {});
  }
  const response = await axios.get(`${BACK_URL}/auth/regenerateToken`, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  if (response.status === 200) {
    const xAccessToken = response.data['token'];
    setCookie('access_token', xAccessToken);
    console.log('reGenerateToken Success');
  } else console.log('reGenerateToken Failure');
  return response;
};

export default reGenerateToken;
