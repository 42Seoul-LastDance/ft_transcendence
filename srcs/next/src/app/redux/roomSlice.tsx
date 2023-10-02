import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ChatRoomListDto } from '../DTO/ChatRoom.dto';

export interface RoomList {
  roomList: ChatRoomListDto;
}

const initialState: RoomList = {
  roomList: {},
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    push: (state, action: PayloadAction<ChatRoomListDto>) => {
      // action.payload에 ChatRoom 데이터가 포함되어 있다고 가정
      // 기존 roomList와 합치거나 덮어쓰기를 수행하려면 Object.assign 또는 spread 연산자를 사용할 수 있습니다.
      state.roomList = { ...state.roomList, ...action.payload };
    },
    // 다른 리듀서들을 필요에 따라 추가할 수 있습니다.
  },
});
export default roomSlice;
export const { push } = roomSlice.actions;
