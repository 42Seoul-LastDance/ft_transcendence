// RoomInfoInnerDto
export interface ChatRoomDto {
  operatorList: string[];
  memberList: string[];
  inviteList: string[];
  banList: string[];
  muteList: string[];
  roomName: string;
  ownerName: string;
  status: RoomStatus; // 또는 RoomStatus 타입으로 정의
  password: string | null;
  requirePassword: boolean;
  userName: string;
  userPermission: UserPermission;
}
// chatRoom Service.ts 저장 한번만 해주세용 intell
// complete

//createRoomDto
export interface RoomInfoDto {
  roomName: string;
  password: string | null;
  requirePassword: boolean;
  status: RoomStatus;
}

export enum RoomStatus {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum UserPermission {
  MEMBER = 0,
  OPERATOR = 1,
  OWNER = 2,
}

export interface ChatMessage {
	userName: string;
	content: string;
}

export interface SendMessageDto {
	roomName : string,
	status: RoomStatus,
	userName: string,
	content: string,
}