import { Socket } from 'socket.io-client';
import { userState } from './redux/userSlice';

// RoomInfoInnerDto
export interface ChatRoomDto {
  inviteList: string[];
  banList: string[];
  muteList: string[];
  roomName: string;
  ownerName: string;
  status: RoomStatus; // 또는 RoomStatus 타입으로 정의
  requirePassword: boolean;
}

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
  OWNER = 0,
  ADMIN = 1,
  MEMBER = 2,
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

export interface receiveMessage {
  canReceive: boolean;
}

export interface EmitResult {
  result: boolean;
  reason: string | null;
}

export enum TokenType {
  Access = 0,
  Refresh = 1,
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  GAME = 'game',
}

export interface UserProfileProps {
  targetName: string;
}

export interface ChattingPageProps {
  socket: Socket | undefined;
}

export enum FriendStatus {
  FRIEND = 0,
  LAGGING = 1,
  REQUESTED = 2,
  UNKNOWN = 3,
}

export enum JoinStatus {
  NONE,
  CHAT,
  DM,
}

export interface MemberList {
  userName: string;
  permission: UserPermission;
}

export interface SendMessageJson {
  userName: string;
  content: string;
}

export interface EventListeners {
  event: string;
  callback: (data: any) => void;
  once?: boolean;
}
