import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoomDto, JoinStatus } from '../interface';

export interface userState {
  imageUrl: string | null;
  isAvailable: boolean | null;
  token: string | null;
  chatRoom: ChatRoomDto | null;
  userName: string | null;
  join: JoinStatus;
}

const initialState: userState = {
  imageUrl: null,
  isAvailable: null,
  token: null,
  chatRoom: null,
  userName: null,
  join: JoinStatus.NONE,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state: userState, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setImageUrl: (state: userState, action: PayloadAction<string>) => {
      state.imageUrl = action.payload;
    },
    setAvailable: (state: userState, action: PayloadAction<boolean>) => {
      state.isAvailable = action.payload;
    },
    setName: (state: userState, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setChatRoom: (
      state: userState,
      action: PayloadAction<ChatRoomDto | null>,
    ) => {
      state.chatRoom = action.payload;
    },
    setJoin: (state: userState, action: PayloadAction<number>) => {
      state.join = action.payload;
    },
  },
});

export default userSlice;
export const {
  setToken,
  setImageUrl,
  setAvailable,
  setChatRoom,
  setName,
  setJoin,
} = userSlice.actions;
