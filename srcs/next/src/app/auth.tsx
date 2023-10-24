'use client';

import { getCookie, removeCookie, setCookie } from './cookie';
import axios, { AxiosResponse } from 'axios';
import { BACK_URL } from './globals';

// export const getToken = (tokenType: string): string | null => {
//   if (typeof window === 'undefined') return null;

//   let token = localStorage.getItem(tokenType);
//   // 로컬에 있음
//   if (token) return token;

//   // 로컬에 없어서 쿠키에서 찾기
//   token = getCookie(tokenType);
//   if (!token) {
//     console.log('token is empty : ', tokenType);
//     return null;
//   }

//   // 로컬에 없고 쿠키에는 있음
//   if (tokenType === 'access_token') {
//     localStorage.setItem('access_token', token);
//     removeCookie('access_token');

//     // refresh_token도 같이 해주기
//     const refreshToken = getCookie('refresh_token');
//     if (!refreshToken) {
//       console.log('token is empty : ', 'refresh_token');
//       return null;
//     }
//     localStorage.setItem('refresh_token', refreshToken);
//     removeCookie('refresh_token');
//   } else if (tokenType === 'refresh_token') {
//     localStorage.setItem('refresh_token', token);
//     removeCookie('refresh_token');
//   } else {
//     console.log('getToken() : invalid tokenType :', tokenType);
//     return null;
//   }
//   return token;
// };

export const reGenerateToken = async (router: any): Promise<AxiosResponse> => {
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) {
    removeCookie('access_token');
    removeCookie('refresh_token');
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
      console.log('reGenerateToken Failure (Invalid refresh_token)');
      removeCookie('access_token');
      removeCookie('refresh_token');
      router.push('/');
    } else {
      console.log('reGenerateToken Failure (What err??)', error.status);
      removeCookie('access_token');
      removeCookie('refresh_token');
      router.push('/');
    }
    return new Promise(() => {});
  }
};

export default reGenerateToken;
