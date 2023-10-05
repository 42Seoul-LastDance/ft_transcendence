import { IsBoolean, IsString, IsArray, IsEnum } from 'class-validator';
import { RoomStatus } from '../roomStatus.enum';
import { UserPermission } from '../userPermission.enum';

export class ChatRoomDto {
    @IsString()
    roomName: string;

    @IsString()
    ownerName: string;

    @IsEnum(RoomStatus)
    status: RoomStatus;

    @IsString()
    password: string | null;

    @IsBoolean()
    requirePassword: boolean;

    @IsArray()
    operatorList: Array<number> = [];

    @IsArray()
    memberList: Array<number> = []; // TODO: userId -> userName 리스트로 수정 필요

    @IsArray()
    inviteList: Array<number> = [];

    @IsArray()
    banList: Array<number> = [];

    @IsArray()
    muteList: Array<number> = [];
    
    // @IsString()
    // myName: string;

    // @IsEnum(UserPermission)
    // myPermission: UserPermission;
}

// 그럼 name 도 userName? ,,,? 잠시만
// 이거 근데 백에서 ChatRoomDto 객체로 채팅방 관리를 하고 있는데
// Dto는 그대로 놔두고 보내는 정보만 수정하는 방식은 안될까?
// 아예 Dto 하나 더 파서
// {
//     chatRoomInfo: ChatRoomDto,
//     myName: string,
//     myPermission: UserPermission,
// }

// export interface ChatRoomInfo 
//     chatRoom: ChatRoomDto;
//     userName: string | null;
//     userPermission: UserPermission;

// 프론트에서 이중json 까려면 좀 빡센가? Ch no? 아 마 도? 그 냥 저 렇 게 줘 도 될 것 같 아 
// 낼 오 면 같 이 socketio 데 이 터 한  번 정 리 해 야 할 듯 -> ok
// 

// dto 에서 관리 느하느에거에 가추가야해야 할 듯? 
// 권한도 바뀌면 내보내하야하고 
//왜 냐 며하며 저유저이네이이 으처으터부터 ㅇ필ㅇ함  <= 유 저 네 임 쓰 는 데 가 근데 채 ㅁ팅 밖에 ㅇ없 음 
// ChatRoomDto는 따로 수정 안하고, 우리가 이거 보내줄 때마다 소켓id로 name이랑 permission 따서 우
// 왜그러냐면 chatroom service:25 에서 Map으로 관리중
// 아 예 ㄹ분ㄹ키시키면 ㅊ괜ㅊ음  냐그냐 퍼 셔미셔로따로 르이르로따로 ㄹ챗ㄹ ㄸㅏㄸ로  ㅇㅋㅇㅋ
// {
// chatRoominfo : ChatRoomDto 
// permission : permision
// }
// getName 소 켓 이 벤 트 나하나 만 들 면 구되구
// 이건 은정님이랑 얘기좀 해봐야 할 듯? 옥희 

//고 고 
// 이거 요청시마다 요청한 사람의 permission이랑 name을 같이 보내줘야 하는거야??
// correct
// memberList를 string[] 으로 바꿔서 보내는게 아니라?
// ummmm.......   no sang gwuan.... good.....!앗 니아니음
// 대충 이해했는데 그럼 Owner는 OperatorList에도 memberList에도 없는거?
// 아 혹시 멤버 리스트에  원래 오너도 들어가 있음?
// 
// join~Room 함수를 통하면 무조건 memberList에 들어가있음 => 지금 구현은 오너도 들어가 있고, 일반 유저가
// 오퍼레이터로 바뀌어도 멤버리스트에서 안빠짐 -> 이거 고쳐주는게 편한가?
// 아니면 멤버리스트를 일단 다 그리고 오너랑 오퍼레이터한테 아이콘 달아주는건 어떰? 그게 더 복잡한가??
// 아 닝 두 번 그 리 면 됨 별 문 제 없 을 듯 해 보 고 더 러 우 면 빼 고 그 려 도 되 고
// 편한걸로 ㄱㄱㅆ~ thank you