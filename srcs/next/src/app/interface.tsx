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
  myPermission: Permission;
  myName: string;
}

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

export enum Permission{
  OWNER = 0,
  MEMBER = 1,
  ADMIN = 2,
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