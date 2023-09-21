'use client';

import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { CookiesProvider } from 'react-cookie';
import { getCookie } from '../Cookie';
import { Provider, useSelector } from 'react-redux';
import { userState } from '../redux/userSlice';
import { RootState } from '../redux/store';
import store from '../redux/store';
import { redirect, useRouter } from 'next/navigation';
import ipaddr from '../page';

const RegisterButtonContent = () => {
    const name = useSelector((state: userState) => state.name);
    const imageUrl = useSelector((state: userState) => state.imageUrl);
    const isAvailable = useSelector(
        (state: RootState) => state.user.isAvailable,
    );
    const backAddr = process.env.BACK_ADDR;
    const { push } = useRouter();
    const [success, setSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        if (success === true) push('/main');
        else if (success === false) push('/');
    }, [success]);

    const register = async () => {
        const enrollToken = getCookie('enroll_token');
        console.log('enroll Token: ', enrollToken);
        try {
            await axios.post(
                'http://10.14.3.1:3000/users/signup',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${enrollToken}`,
                    },
                },
            );
            await axios.patch(
                'http://10.14.3.1:3000/users/username',
                {
                    username: name,
                },
                {
                    headers: {
                        Authorization: `Bearer ${enrollToken}`,
                    },
                },
            );
            await axios.patch(
                `http://10.14.3.1:3000/users/signup/profileImage`,
                {
                    profileImage: imageUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${enrollToken}`,
                    },
                },
            );
            setSuccess(true);
        } catch (error) {
            console.log('Register error: ', error);
            setSuccess(false);
        }
    };

    return (
        <button onClick={register} disabled={!isAvailable}>
            Register
        </button>
    );
};

const RegisterButton = () => {
    return (
        <Provider store={store}>
            <CookiesProvider>
                <RegisterButtonContent />
            </CookiesProvider>
        </Provider>
    );
};

export default RegisterButton;
