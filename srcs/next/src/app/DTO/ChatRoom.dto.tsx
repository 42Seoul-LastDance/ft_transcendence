import { RoomStatus } from './RoomInfo.dto';

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
}
