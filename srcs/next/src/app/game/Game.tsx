'use client';

import { useState, useEffect, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setIsMatched, setSide, setNames } from '../redux/matchSlice';
import { useGameSocket } from '../context/gameSocketContext';
import { ReactUnityEventParameter } from 'react-unity-webgl/distribution/types/react-unity-event-parameters';
import { deflateSync } from 'zlib';
import EmojiButtons from './EmojiButtons';
import UserPannel from './UserPannel';
import { PlayerSide, StartGameJson, SendEmojiJson, Emoji } from '../Enums';
import { setEmoji } from '../redux/matchSlice';

const Game = () => {
  const { unityProvider, sendMessage, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: '/build/Pong.loader.js',
      dataUrl: '/build/Pong.data.unityweb',
      frameworkUrl: '/build/Pong.framework.js.unityweb',
      codeUrl: '/build/Pong.wasm.unityweb',
    });

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();
  // const isCustomGame = useSelector((state: RootState) => state.match.isCustom);
  const socket = useGameSocket();
  var mySide: PlayerSide = PlayerSide.NONE;

  // react to unity
  const Init = () => {
    setIsReady(false);
    if (!socket?.hasListeners('startGame')) {
      socket?.on('startGame', (json: StartGameJson) => {
        if (json.isFirst) mySide = json.side;
        dispatch(
          setNames({
            leftName: json.leftName,
            rightName: json.rightName,
          }),
        );
        sendMessage('GameManager', 'StartGame', JSON.stringify(json));
        console.log('! startGame Event Detected : ', json);
      });
    }
    if (!socket?.hasListeners('kickout')) {
      socket?.on('kickout', () => {
        alert('kickout Event Detected');
        dispatch(setIsMatched({ isMatched: false }));
      });
    }
    if (!socket?.hasListeners('movePaddle')) {
      socket?.on('movePaddle', (json: JSON) => {
        if (mySide === PlayerSide.LEFT)
          sendMessage(
            'RightPaddle',
            'MoveOpponentPaddle',
            JSON.stringify(json),
          );
        else if (mySide === PlayerSide.RIGHT)
          sendMessage('LeftPaddle', 'MoveOpponentPaddle', JSON.stringify(json));
        else
          console.log(
            'err : movePaddle event detected but, player side is NONE',
          );
      });
    }
    if (!socket?.hasListeners('gameOver')) {
      socket?.on('gameOver', (json: JSON) => {
        console.log('! gameOver Event Detected : ', json);
        sendMessage('GameManager', 'GameOver', JSON.stringify(json));
        setGameOver(true);
        // if (isCustomGame) setIsReady(false);
        // else
        // 	dispatch(setIsMatched({ isMatched: false }));
      });
    }
    if (!socket?.hasListeners('ballHit')) {
      socket?.on('ballHit', (json: JSON) => {
        console.log('! ballHit Event Detected : ', json);
        sendMessage('Ball', 'SynchronizeBallPos', JSON.stringify(json));
      });
    }
  };

  const handleUnityException = useCallback((data: ReactUnityEventParameter) => {
    alert('Unity Exception : ' + data);
  }, []);
  const handleValidCheck = useCallback((data: ReactUnityEventParameter) => {
    socket?.emit('validCheck', JSON.parse(data as string));
  }, []);
  const handleMovePaddle = useCallback((data: ReactUnityEventParameter) => {
    socket?.emit('movePaddle', JSON.parse(data as string));
  }, []);
  const handleBallHit = useCallback((data: ReactUnityEventParameter) => {
    socket?.emit('ballHit', JSON.parse(data as string));
  }, []);

  // unity to react
  useEffect(() => {
    addEventListener('Init', Init);
    addEventListener('MovePaddle', handleMovePaddle);
    addEventListener('ValidCheck', handleValidCheck);
    addEventListener('BallHit', handleBallHit);
    addEventListener('UnityException', handleUnityException);
    return () => {
      removeEventListener('Init', Init);
      removeEventListener('MovePaddle', handleMovePaddle);
      removeEventListener('ValidCheck', handleValidCheck);
      removeEventListener('BallHit', handleBallHit);
      removeEventListener('UnityException', handleUnityException);
    };
  }, [
    addEventListener,
    removeEventListener,
    handleUnityException,
    handleValidCheck,
    handleMovePaddle,
    Init,
    handleBallHit,
  ]);

  if (!socket?.hasListeners('sendEmoji')) {
    socket?.on('sendEmoji', (json: SendEmojiJson) => {
      if (json.type === Emoji.HI) {
        dispatch(setEmoji({ emoji: '/emoji/emoji_HI.png' }));
      } else if (json.type === Emoji.THUMBUP)
        dispatch(setEmoji({ emoji: '/emoji/emoji_THUMBUP.png' }));
      else if (json.type === Emoji.FANFARE)
        dispatch(setEmoji({ emoji: '/emoji/emoji_FANFARE.png' }));
      else if (json.type === Emoji.TONGUE)
        dispatch(setEmoji({ emoji: '/emoji/emoji_TONGUE.png' }));
      else if (json.type === Emoji.SUNGLASSES)
        dispatch(setEmoji({ emoji: '/emoji/emoji_SUNGLASSES.png' }));
      else if (json.type === Emoji.BADWORDS)
        dispatch(setEmoji({ emoji: '/emoji/emoji_BADWORDS.png' }));
      if (timeoutId) clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => {
        dispatch(setEmoji({ emoji: '' }));
      }, 2000);
      setTimeoutId(newTimeoutId);
    });
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      <div style={containerStyle}>
        <UserPannel screenSide={PlayerSide.LEFT} />
        <Unity
          unityProvider={unityProvider}
          style={{ width: 1024, height: 576 }}
        />
        <UserPannel screenSide={PlayerSide.RIGHT} />
      </div>

      <EmojiButtons />

      <button
        onClick={() => {
          setIsReady(true);
          socket?.emit('getReady');
        }}
        disabled={isReady}
      >
        {' '}
        Get Ready
      </button>
    </>
  );
};

export default Game;
