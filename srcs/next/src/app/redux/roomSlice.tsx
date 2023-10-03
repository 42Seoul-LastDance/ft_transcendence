import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface RoomList {
  roomNameList: string[];
  isJoined: boolean;
}

const initialState: RoomList = {
  roomNameList: [],
  isJoined: false,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomNameList: (state, action: PayloadAction<string[]>) => {
      state.roomNameList = action.payload;
    },
    setIsJoined: (state, action: PayloadAction<boolean>) => {
      state.isJoined = action.payload;
    },
  },
});

export default roomSlice;
export const { setRoomNameList, setIsJoined } = roomSlice.actions;
