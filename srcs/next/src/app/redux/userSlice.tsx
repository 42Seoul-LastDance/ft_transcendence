import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoomDto } from '../interface';

export interface userState {
  imageUrl: string | null;
  isAvailable: boolean | null;
  token: string | null;
  chatRoom: ChatRoomDto | null;
}

const initialState: userState = {
  imageUrl: null,
  isAvailable: null,
  token: null,
  chatRoom: null,
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
    setChatRoom: (
      state: userState,
      action: PayloadAction<ChatRoomDto | null>,
    ) => {
      state.chatRoom = action.payload;
    },
    // getToken: (state, action: PayloadAction<string>) => {
    // }
  },
});

export default userSlice;
export const { setImageUrl, setAvailable, setChatRoom } = userSlice.actions;
