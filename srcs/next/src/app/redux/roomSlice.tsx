import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ChatMessage } from '../interface';

export interface RoomList {
  roomNameList: string[];
  chatMessages: ChatMessage[];
}

const initialState: RoomList = {
  roomNameList: [],
  chatMessages: [],
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
  },
});

export default roomSlice;
export const { setRoomNameList, setChatMessages } = roomSlice.actions;
