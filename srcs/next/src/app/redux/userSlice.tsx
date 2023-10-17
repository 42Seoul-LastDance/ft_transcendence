import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoomDto, JoinStatus } from '../interface';

export interface userState {
  userImg: string | null;
  isAvailable: boolean | null;
  token: string | null;
  chatRoom: ChatRoomDto | null;
  userName: string | null;
  join: JoinStatus;
}

const initialState: userState = {
  userImg: null,
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
    setUserImg: (state: userState, action: PayloadAction<string>) => {
      state.userImg = action.payload;
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
  setUserImg,
  setToken,
  setAvailable,
  setChatRoom,
  setName,
  setJoin,
} = userSlice.actions;
