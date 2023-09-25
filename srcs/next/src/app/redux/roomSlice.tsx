import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export enum RoomStatus {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}
export interface Room {
  username: string;
  roomname: string;
  password: string | null;
  requirePassword: boolean;
  status: RoomStatus;
}

export interface RoomArray {
  roomArray: Room[];
}

const initialState: RoomArray = {
  roomArray: [],
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    push: (
      state,
      action: PayloadAction<{
        username: string;
        roomname: string;
        password: string | null;
        requirePassword: boolean;
        status: RoomStatus;
      }>,
    ) => {
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
