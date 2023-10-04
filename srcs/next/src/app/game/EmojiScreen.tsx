'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { useEffect } from 'react';
import { useGameSocket } from '../Contexts/GameSocketContext';
import { setEmoji } from '../Redux/matchSlice';
import { Emoji, EmojiScreenProps, PlayerSide, SendEmojiJson } from '../Enums';

const imageStyle = {
    width: '50px', // 이미지의 너비를 조정
    height: 'auto', // 높이를 자동으로 조정하여 비율 유지
};

const EmojiScreen: React.FC<EmojiScreenProps> = ({ screenSide }) => {
    const side = useSelector((state: RootState) => state.match.side);
    const emoji = useSelector((state: RootState) => state.match.emoji);
    const dispatch = useDispatch();
    const socket = useGameSocket();

    useEffect(() => {
        console.log('socket listener on');
        if (!socket.hasListeners('sendEmoji')) {
            socket.on('sendEmoji', (json: SendEmojiJson) => {
                console.log(side, screenSide);
                // if ((side === PlayerSide.RIGHT && screenSide === PlayerSide.LEFT)
                // || (side === PlayerSide.LEFT && screenSide === PlayerSide.RIGHT))
                // {
                console.log('sendEmoji Event Detected');
                if (json.type === Emoji.HI)
                    dispatch(setEmoji({ emoji: '/emoji/emoji_HI.png' }));
                else if (json.type === Emoji.THUMBUP)
                    dispatch(setEmoji({ emoji: '/emoji/emoji_THUMBUP.png' }));
                else if (json.type === Emoji.FANFARE)
                    dispatch(setEmoji({ emoji: '/emoji/emoji_FANFARE.png' }));
                else if (json.type === Emoji.TONGUE)
                    dispatch(setEmoji({ emoji: '/emoji/emoji_TONGUE.png' }));
                else if (json.type === Emoji.SUNGLASSES)
                    dispatch(
                        setEmoji({ emoji: '/emoji/emoji_SUNGLASSES.png' }),
                    );
                else if (json.type === Emoji.BADWORDS)
                    dispatch(setEmoji({ emoji: '/emoji/emoji_BADWORDS.png' }));
                else console.log(json);
                console.log('emoji : ', emoji);
                //}
            });
        }
    }, [side]);

    return (
        <>
            <img src={emoji} style={imageStyle} />
            {/* <img src='/emoji/emoji_BADWORDS.png' style={imageStyle} /> */}
        </>
    );
};

export default EmojiScreen;
