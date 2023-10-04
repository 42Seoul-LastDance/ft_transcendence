import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoomDto } from '../interface';

export interface userState {
  name: string;
  imageUrl: string | null;
  isAvailable: boolean | null;
  token: string;
  curRoom: ChatRoomDto | null;
}

const initialState: userState = {
  name: 'testman',
  imageUrl: null,
  isAvailable: null,
  token: '',
  curRoom: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setImageUrl: (state, action: PayloadAction<string>) => {
      state.imageUrl = action.payload;
    },
    setAvailable: (state, action: PayloadAction<boolean>) => {
      state.isAvailable = action.payload;
    },
    setCurRoom: (state, action: PayloadAction<ChatRoomDto>) => {
      state.curRoom = action.payload;
    },
    // getToken: (state, action: PayloadAction<string>) => {
    // }
  },
});

export default userSlice;
export const { setName, setImageUrl, setAvailable, setCurRoom } =
  userSlice.actions;
