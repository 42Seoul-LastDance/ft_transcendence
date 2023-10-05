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
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setImageUrl: (state, action: PayloadAction<string>) => {
      state.imageUrl = action.payload;
    },
    setAvailable: (state, action: PayloadAction<boolean>) => {
      state.isAvailable = action.payload;
    },
    setChatRoom: (state, action: PayloadAction<ChatRoomDto>) => {
      state.chatRoom = action.payload;
    },
    // getToken: (state, action: PayloadAction<string>) => {
    // }
  },
});

export default userSlice;
export const { setImageUrl, setAvailable, setChatRoom } =
  userSlice.actions;
