'use client';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { PlayerSide } from '../enums';
import { UserPannelProps } from '../interfaces';
import { Typography, ImageList } from '@mui/material';
const newspaperSpinning = [
  { transform: 'rotate(0) scale(1)' },
  { transform: 'rotate(360deg) scale(0)' },
];

const newspaperTiming = {
  duration: 2000,
  iterations: 1,
};

const imageStyle = {
  width: '60px', // 이미지의 너비를 조정
  height: 'auto', // 높이를 자동으로 조정하여 비율 유지
  Animation: 'animate',
};

const UserPannel: React.FC<UserPannelProps> = ({ screenSide }) => {
  const mySide = useSelector((state: RootState) => state.match.side);
  const emoji = useSelector((state: RootState) => state.match.emoji);
  const myEmoji = useSelector((state: RootState) => state.match.myEmoji);
  const leftName = useSelector((state: RootState) => state.match.leftName);
  const rightName = useSelector((state: RootState) => state.match.rightName);

  return (
    <>
      <div>
        {screenSide === PlayerSide.LEFT ? (
          <Typography
            variant="h5"
            style={{
              textAlign: 'center',
              marginRight: '40px',
              marginBottom: '10px',
              color: 'white',
            }}
          >
            {leftName}
          </Typography>
        ) : (
          <Typography
            variant="h5"
            style={{
              textAlign: 'center',
              marginLeft: '40px',
              marginBottom: '10px',
              color: 'white',
            }}
          >
            {rightName}
          </Typography>
        )}
        {/* emoji */}
        {/* <View style={styles.container}>
        <Animated.Image
          style={{transform: [{rotate: spin}] }}
          source={require(${my})} />
      </View> */}
        {screenSide === PlayerSide.LEFT ? (
          mySide === PlayerSide.LEFT ? (
            <img src={myEmoji} style={imageStyle} />
          ) : (
            <img src={emoji} style={imageStyle} />
          )
        ) : null}
        {screenSide === PlayerSide.RIGHT ? (
          mySide === PlayerSide.RIGHT ? (
            <div>
              <img src={myEmoji} style={imageStyle} />
            </div>
          ) : (
            <div>
              <img src={emoji} style={imageStyle} />
            </div>
          )
        ) : null}
      </div>
    </>
  );
};

export default UserPannel;
