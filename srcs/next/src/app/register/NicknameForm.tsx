'use client';

import React, { useState, useEffect, SyntheticEvent } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store, { RootState } from '../redux/store';
import { setAvailable, setName } from '../redux/userSlice';
import axios from 'axios';
import Link from 'next/link';

const NicknameFormContent = () => {
  const dispatch = useDispatch();
  const userName = useSelector((state: RootState) => state.user.name);
  const [isClickable, setIsClickable] = useState<boolean>(false);
  const [viewName, setViewName] = useState<string>('');
  const backAddr = process.env.BACK_URL;

  useEffect(() => {
    checkDuplicate();
  }, [userName]);

  const checkDuplicate = async () => {
    if (!isClickable) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/users/username/${userName}`,
      );
      dispatch(setAvailable(true));
    } catch (error) {
      dispatch(setAvailable(false));
      console.log(error);
    }
  };

  const dispatchName = (event: SyntheticEvent) => {
    event.preventDefault();
    dispatch(setName(viewName));
  };

  const dataOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = event.target.value;

    if (inputName.trim() !== '') {
      setViewName(inputName);
      setIsClickable(true);
    } else {
      setViewName('');
      setIsClickable(false);
    }
  };

  const printResult = (): string => {
    const isAvailable = useSelector(
      (state: RootState) => state.user.isAvailable,
    );

    if (isAvailable === null) return '';
    else
      return isAvailable
        ? ' 사용 가능한 닉네임입니다!'
        : ' 중복된 닉네임입니다!';
  };

  return (
    <div>
      <label> Nickname : </label>
      <input
        type="text"
        id="nickname"
        value={viewName}
        onChange={dataOnChange}
        placeholder="type your nickname"
      />
      <button onClick={dispatchName} disabled={isClickable === false}>
        Check Duplicate
      </button>
      <span> {printResult()} </span>
    </div>
  );
};

const NicknameForm = () => {
  return (
    <Provider store={store}>
      <NicknameFormContent />
    </Provider>
  );
};

export default NicknameForm;
