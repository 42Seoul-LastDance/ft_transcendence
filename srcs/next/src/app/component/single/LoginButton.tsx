'use client'

import React from 'react';
import axios, { AxiosResponse } from 'axios';

const LoginButton = () => {
  const login = async () => {
    try {
      const response: AxiosResponse<any, any> = await axios.get("http://10.14.9.1:3000/auth/42login");
      console.log('서버 응답 데이터:', response.data);
			{/* <Link href="/register"> button to register </Link>*/}
    } catch (error) {
      console.error('서버 요청 실패:', error);
    }
  };

  return (
    <button onClick={login}> Submit </button>
  )
};

export default LoginButton;
