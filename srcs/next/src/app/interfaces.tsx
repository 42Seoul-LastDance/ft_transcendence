import { RoomStatus, UserPermission, UserStatus, Emoji, PlayerSide, GameMode, InviteType, GameJoinMode } from './enums';
import { Socket } from 'socket.io-client';

export interface ChatRoomDto {
  roomName: string;
  ownerName: string;
  status: RoomStatus;
}

export interface ChatMessage {
  userName: string;
  content: string;
}

export interface SendMessageDto {
  roomName: string;
  status: RoomStatus;
  userName: string;
  content: string;
}

export interface receiveMessage {
  userName: string;
  content: string;
  canReceive: boolean;
}

export interface EmitResult {
  result: boolean;
  reason: string;
}


export interface UserProfileProps {
  targetName: string;
  // targetSlackId: string;
}

export interface ChattingPageProps {
  socket: Socket | undefined;
}

export interface Member {
  userName: string;
  slackId: string;
  permission: UserPermission;
}

export interface Events {
  event: string;
  once?: boolean;
  callback: (data: any) => void;
}

export interface GetChatRoomListJSON {
  roomName: string;
  requirePassword: boolean;
}

export interface FriendListJson {
  userName: string;
  slackId: string;
  userStatus: UserStatus;
}

export interface UserInfoJson {
  userName: string;
  slackId: string;
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
  
  export interface GetInvitationListJson {
	hostName: string;
	hostSlackId: string;
	inviteType: InviteType;
	chatRoomName: string;
	chatRoomType: RoomStatus;
	gameMode: GameMode;
  }
  
  export interface CustomGameSet {
	joinMode: GameJoinMode;
	gameMode: GameMode;
	opponentName: string | undefined;
	opponentSlackId: string | undefined;
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