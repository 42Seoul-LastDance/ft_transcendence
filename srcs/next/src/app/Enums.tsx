import { RoomStatus } from './interface';

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

export const enum GameJoinMode {
  NONE = -1,
  MATCH = 0,
  CUSTOM_SEND = 1,
  CUSTOM_RECV = 2,
}

export interface CustomGameSet {
  joinMode: GameJoinMode;
  gameMode: GameMode;
  opponentName: string | undefined;
}

export interface StartGameJson {
  side: PlayerSide;
  ballDirX: number;
  ballDirY: number;
  ballDirZ: number;
  leftScore: number;
  rightScore: number;
  ballSpeed: number;
  isFirst: boolean;
  leftName: string;
  rightName: string;
}

export interface SendEmojiJson {
  type: Emoji;
}

export interface HandShakeJson {
  side: PlayerSide;
}

export interface UserPannelProps {
  screenSide: PlayerSide;
}

export interface InviteGameJson {
  gameMode: GameMode;
  friendName: string | null;
}

export interface AgreeInviteJson {
  friendName: string | null;
}

export enum InviteType {
  NONE = -1,
  CHAT = 0,
  GAME = 1,
}

export interface GetInvitationListJson {
  hostName: string;
  hostSlackId: string;
  inviteType: InviteType;
  chatRoomName: string;
  chatRoomType: RoomStatus;
  gameMode: GameMode;
}
