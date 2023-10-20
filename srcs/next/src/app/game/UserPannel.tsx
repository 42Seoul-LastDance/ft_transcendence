'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { PlayerSide } from '../enums';
import { UserPannelProps } from '../interfaces';

const imageStyle = {
  width: '50px', // 이미지의 너비를 조정
  height: 'auto', // 높이를 자동으로 조정하여 비율 유지
};

const UserPannel: React.FC<UserPannelProps> = ({ screenSide }) => {
  const mySide = useSelector((state: RootState) => state.match.side);
  const emoji = useSelector((state: RootState) => state.match.emoji);
  const myEmoji = useSelector((state: RootState) => state.match.myEmoji);
  const leftName = useSelector((state: RootState) => state.match.leftName);
  const rightName = useSelector((state: RootState) => state.match.rightName);

  return (
    <>
      {/* {mySide !== screenSide && <img src={emoji} style={imageStyle} />} */}
      {/* {mySide === screenSide && <img src={myEmoji} style={imageStyle} />} */}
      {screenSide === PlayerSide.LEFT ? (
        mySide === PlayerSide.LEFT ? (
          <img src={myEmoji} style={imageStyle} />
        ) : (
          <img src={emoji} style={imageStyle} />
        )
      ) : null}
      {screenSide === PlayerSide.LEFT ? (
        <div>{leftName}</div>
      ) : (
        <div>{rightName}</div>
      )}
      {screenSide === PlayerSide.RIGHT ? (
        mySide === PlayerSide.RIGHT ? (
          <img src={myEmoji} style={imageStyle} />
        ) : (
          <img src={emoji} style={imageStyle} />
        )
      ) : null}
    </>
  );
};

export default UserPannel;
