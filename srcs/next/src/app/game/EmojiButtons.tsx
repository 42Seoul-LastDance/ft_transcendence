'use client';
import React, { useState } from 'react';
import { useGameSocket } from '../context/gameSocketContext';
import { Emoji } from '../Enums';
import { useDispatch } from 'react-redux';
import { setMyEmoji } from '../redux/matchSlice';

const EmojiButtons = () => {
  const socket = useGameSocket();
  const dispatch = useDispatch();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const buttonStyle = {
    background: 'transparent', // 투명 배경 설정
    border: 'none', // 테두리 없음
    cursor: 'pointer', // 마우스 커서를 포인터로 변경
  };

  const imageStyle = {
    width: '50px', // 이미지의 너비를 조정
    height: 'auto', // 높이를 자동으로 조정하여 비율 유지
  };

  return (
    <div>
      <button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.HI });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_HI.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={buttonStyle}
      >
        <img src="/emoji/emoji_HI.png" style={imageStyle} />
      </button>

      <button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.THUMBUP });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_THUMBUP.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={buttonStyle}
      >
        <img src="/emoji/emoji_THUMBUP.png" style={imageStyle} />
      </button>

      <button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.FANFARE });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_FANFARE.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={buttonStyle}
      >
        <img src="/emoji/emoji_FANFARE.png" style={imageStyle} />
      </button>

      <button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.TONGUE });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_TONGUE.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={buttonStyle}
      >
        <img src="/emoji/emoji_TONGUE.png" style={imageStyle} />
      </button>

      <button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.SUNGLASSES });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_SUNGLASSES.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={buttonStyle}
      >
        <img src="/emoji/emoji_SUNGLASSES.png" style={imageStyle} />
      </button>

      <button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.BADWORDS });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_BADWORDS.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={buttonStyle}
      >
        <img src="/emoji/emoji_BADWORDS.png" style={imageStyle} />
      </button>
    </div>
  );
};

export default EmojiButtons;
