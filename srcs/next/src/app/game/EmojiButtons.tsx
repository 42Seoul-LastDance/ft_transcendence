'use client'

import { useGameSocket } from "../Contexts/gameSocketContext";
import {Emoji} from "../Enums"

const EmojiButtons = () => {
	const socket = useGameSocket();

	const buttonStyle = {
		background: 'transparent', // 투명 배경 설정
		border: 'none',           // 테두리 없음
		cursor: 'pointer',        // 마우스 커서를 포인터로 변경
	};

	const imageStyle = {
		width: '50px',  // 이미지의 너비를 조정
		height: 'auto',  // 높이를 자동으로 조정하여 비율 유지
	};

	return (
		<div>
				<button onClick={() => {
					socket.emit('sendEmoji', {type: Emoji.HI})
				}} style={buttonStyle}>
					<img src='/emoji/emoji_HI.png' style={imageStyle}/>
				</button>

				<button onClick={() => {
					socket.emit('sendEmoji', {type: Emoji.THUMBUP})
				}} style={buttonStyle}>
					<img src='/emoji/emoji_THUMBUP.png' style={imageStyle}/>
				</button>

				<button onClick={() => {
					socket.emit('sendEmoji', {type: Emoji.FANFARE})
				}} style={buttonStyle}>
					<img src='/emoji/emoji_FANFARE.png' style={imageStyle}/>
				</button>

				<button onClick={() => {
					socket.emit('sendEmoji', {type: Emoji.TONGUE})
				}} style={buttonStyle}>
					<img src='/emoji/emoji_TONGUE.png' style={imageStyle}/>
				</button>

				<button onClick={() => {
					socket.emit('sendEmoji', {type: Emoji.SUNGLASSES})
				}} style={buttonStyle}>
					<img src='/emoji/emoji_SUNGLASSES.png' style={imageStyle}/>
				</button>

				<button onClick={() => {
					socket.emit('sendEmoji', {type: Emoji.BADWORDS})
				}} style={buttonStyle}>
					<img src='/emoji/emoji_BADWORDS.png' style={imageStyle}/>
				</button>
			</div>
	)
}

export default EmojiButtons