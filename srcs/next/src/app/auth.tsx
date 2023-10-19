import { getCookie, setCookie } from './Cookie';
import axios, { AxiosResponse } from 'axios';
import { BACK_URL } from './globals';

export const reGenerateToken = async (router: any): Promise<AxiosResponse> => {
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) {
    console.log('refresh token is not exist. login again!');
    router.push('/');
    return new Promise(() => {});
  }

  try {
    const response = await axios.get(`${BACK_URL}/auth/regenerateToken`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const xAccessToken = response.data['token'];
    setCookie('access_token', xAccessToken);
    console.log('reGenerateToken Success');
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      console.log('reGenerateToken Failure (Invalid refresh_token)', error);
      router.push('/');
    } else console.log('reGenerateToken Failure (What err??)', error.status);
    return new Promise(() => {});
  }
};

export default reGenerateToken;

// localStorage.setItem('myData', 'Hello, Local Storage!');
// const data = localStorage.getItem('myData');
