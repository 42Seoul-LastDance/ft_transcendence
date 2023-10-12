import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ChatMessage, MemberList } from '../interface';

export interface RoomList {
  roomNameList: string[];
  chatMessages: ChatMessage[];
  roomMemberList: MemberList[];
}

const initialState: RoomList = {
  roomNameList: [],
  chatMessages: [],
  roomMemberList: [],
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomNameList: (state, action: PayloadAction<string[]>) => {
      state.roomNameList = action.payload;
    },

    setChatMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.chatMessages.push(action.payload[0]);
    },

    clearChatMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.chatMessages = action.payload;
    },

    setRoomMemberList: (state, action: PayloadAction<MemberList[]>) => {
      state.roomMemberList = action.payload;
    },
  },
});

export default roomSlice;
export const {
  setRoomNameList,
  setChatMessages,
  clearChatMessages,
  setRoomMemberList,
} = roomSlice.actions;
