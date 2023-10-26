'use client';
import React, { useState } from 'react';
import { useGameSocket } from '../contexts/gameSocketContext';
import { Emoji } from '../enums';
import { useDispatch } from 'react-redux';
import { setMyEmoji } from '../redux/matchSlice';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
const EmojiButtons = () => {
  const socket = useGameSocket();
  const dispatch = useDispatch();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const ButtonStyle = {
    background: 'transparent', // 투명 배경 설정
    border: 'none', // 테두리 없음
    cursor: 'pointer', // 마우스 커서를 포인터로 변경
  };

  const imageStyle = {
    width: '60px', // 이미지의 너비를 조정
    height: 'auto', // 높이를 자동으로 조정하여 비율 유지
  };

  return (
    <ButtonGroup
      sx={{ display: 'flex', justifyContent: 'center', mt: '20px', mb: '20px' }}
    >
      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.HI });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_HI.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_HI.png" style={imageStyle} />
      </Button>

      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.THUMBUP });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_THUMBUP.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_THUMBUP.png" style={imageStyle} />
      </Button>

      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.FANFARE });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_FANFARE.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_FANFARE.png" style={imageStyle} />
      </Button>

      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.TONGUE });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_TONGUE.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_TONGUE.png" style={imageStyle} />
      </Button>

      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.SUNGLASSES });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_SUNGLASSES.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_SUNGLASSES.png" style={imageStyle} />
      </Button>

      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.BADWORDS });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_BADWORDS.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_BADWORDS.png" style={imageStyle} />
      </Button>

      <Button
        onClick={() => {
          socket?.emit('sendEmoji', { type: Emoji.WITCH });
          dispatch(setMyEmoji({ myEmoji: '/emoji/emoji_witch.png' }));
          if (timeoutId) clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            dispatch(setMyEmoji({ myEmoji: '' }));
          }, 2000);
          setTimeoutId(newTimeoutId);
        }}
        style={ButtonStyle}
      >
        <img src="/emoji/emoji_witch.png" style={imageStyle} />
      </Button>
    </ButtonGroup>
  );
};

export default EmojiButtons;
