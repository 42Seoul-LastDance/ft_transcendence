import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RoomInfoDto } from '../DTO/RoomInfo.dto';

export interface RoomArray {
  roomArray: RoomInfoDto[];
}

const initialState: RoomArray = {
  roomArray: [],
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    push: (state, action: PayloadAction<RoomInfoDto>) => {
      state.roomArray.push({
        username: action.payload.username,
        roomname: action.payload.roomname,
        password: action.payload.password,
        requirePassword: action.payload.requirePassword,
        status: action.payload.status,
      });
    },
  },
});

export default roomSlice;
export const { push } = roomSlice.actions;
