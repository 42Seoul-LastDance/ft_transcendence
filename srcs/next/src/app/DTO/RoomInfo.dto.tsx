export interface RoomInfoDto {
  roomName: string;
  userName: string;
  password: string | null;
  requirePassword: boolean;
  status: RoomStatus;
}

export enum RoomStatus {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}
