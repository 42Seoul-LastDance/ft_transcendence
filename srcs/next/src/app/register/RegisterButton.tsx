'use client'

import React from 'react';
import axios, { AxiosResponse } from 'axios';
import { CookiesProvider } from 'react-cookie';
import { getCookie } from '../Cookie';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { userState } from '../redux/userSlice';
import store from '../redux/store';

const RegisterButtonContent = () => {
	const name = useSelector((state: userState) => state.name);
	const imageUrl = useSelector((state: userState) => state.imageUrl);
	const register = async () => {
		const enrollToken = getCookie("enroll_token");
		console.log(enrollToken);
		if (enrollToken != undefined)
		{
			const postRes :AxiosResponse = await axios.post("http://10.19.9.4:3000/signup", {
				headers: {	
					Authorization: `Bearer ${enrollToken}`
				},
			});
			const nameRes :AxiosResponse = await axios.patch("http://10.19.9.4:3000/signup/username", {
				headers: {	
					Authorization: `Bearer ${enrollToken}`
				},
				data: {
					username: name,
				}
			});
			const imageRes :AxiosResponse = await axios.patch("http://10.19.9.4:3000/signup/profileImage", {
				headers: {	
					Authorization: `Bearer ${enrollToken}`
				},
				data: {
					profileImage: imageUrl,
				}
			});
		}
  }

//   @Post('/signup') // DB ㅅ생ㅅ 크토크만
//   @Patch('/signup/username') // ㅌㅌㅌ큰 + username
//   @Patch('/signup/profileImage') / 크토크
  return (
    <button onClick={register}> Register </button>
  )
};

const RegisterButton = () => {
	return (
		<Provider store={store}>
			<CookiesProvider>
				<RegisterButtonContent/>
			</CookiesProvider>
		</Provider>
	)
};

export default RegisterButton;