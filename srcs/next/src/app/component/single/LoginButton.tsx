'use client'

import React from 'react';
import axios, { AxiosResponse, Method } from 'axios';

const LoginButton = () => {
  const login = async () => {
    try {
    //   const response: AxiosResponse<any, any> = await axios({
	// 		method: 'get',
	// 		url: 'http://10.14.9.4:3000/auth/42login',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Access-Control-Allow-Origin': '*', // 혹은 특정 도메인으로 설정
	// 	'Access-Control-Allow-Credentials': 'true', // 인증 정보 전송 허용
	// 		}
	// 	});
      //console.log('서버 응답 데이터:', response.data);
    } catch (error) {
      console.error('서버 요청 실패:', error);
    }
  };

  return (
    <button onClick={login}> 42 Login </button>
  )
};

export default LoginButton;

