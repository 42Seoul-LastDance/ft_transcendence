'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useEffect } from 'react';
import { useGameSocket } from '../context/gameSocketContext';
import { setEmoji } from '../redux/matchSlice';
import { Emoji, UserPannelProps, PlayerSide, SendEmojiJson } from '../Enums';

const imageStyle = {
  width: '50px', // 이미지의 너비를 조정
  height: 'auto', // 높이를 자동으로 조정하여 비율 유지
};

const UserPannel: React.FC<UserPannelProps> = ({ screenSide }) => {
  const mySide = useSelector((state: RootState) => state.match.side);
  const emoji = useSelector((state: RootState) => state.match.emoji);
  const leftName = useSelector((state: RootState) => state.match.leftName);
  const rightName = useSelector((state: RootState) => state.match.rightName);

  return (
    <>
      {mySide !== screenSide && <img src={emoji} style={imageStyle} />}
      {screenSide === PlayerSide.LEFT ? (
        <div>{leftName}</div>
      ) : (
        <div>{rightName}</div>
      )}
    </>
  );
};

export default UserPannel;
