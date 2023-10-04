export const enum Emoji {
    NONE = -1,
    HI = 0,
    THUMBUP = 1,
    SUNGLASSES = 2,
    FANFARE = 3,
    TONGUE = 4,
    BADWORDS = 5,
}

export const enum PlayerSide {
	NONE = -1,
    LEFT = 0,
    RIGHT = 1,
}

export const enum GameMode {
    NONE = -1,
    NORMAL = 0,
    HARD = 1,
}

export interface StartGameJson{
	side: PlayerSide,
	ballDirX: number,
	ballDirY: number,
	ballDirZ: number,
	isFirst: boolean
}

export interface SendEmojiJson{
	type: Emoji
}

export interface HandShakeJson{
	side: PlayerSide
}

export interface EmojiScreenProps {
	screenSide : PlayerSide
}