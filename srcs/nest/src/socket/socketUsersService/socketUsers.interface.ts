import { RoomStatus } from '../chatRoom/roomStatus.enum';
import { InviteType } from './socketUsers.enum';
import { GameMode } from 'src/game/game.enum';

export interface Invitation {
    hostName: string;
    inviteType: InviteType;
    chatRoomName: string | undefined;
    chatRoomType: RoomStatus | undefined;
    gameMode: GameMode | undefined;
}
