import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  GetChatRoomListJSON,
  Member,
  UserInfoJson,
} from '../interfaces';
import { UserPermission } from '../enums';

export interface RoomList {
  roomList: GetChatRoomListJSON[];
  roomMemberList: Member[];
  banList: UserInfoJson[];
  selectedMember: Member | null;
  myPermission: UserPermission;
}

const initialState: RoomList = {
  roomList: [],
  roomMemberList: [],
  banList: [],
  selectedMember: null,
  myPermission: UserPermission.NONE,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomList: (
      state: RoomList,
      action: PayloadAction<GetChatRoomListJSON[]>,
    ) => {
      state.roomList = action.payload;
    },
    setRoomMemberList: (state: RoomList, action: PayloadAction<Member[]>) => {
      state.roomMemberList = action.payload;
    },
    setBanList: (state: RoomList, action: PayloadAction<UserInfoJson[]>) => {
      state.banList = action.payload;
    },
    setMyPermission: (
      state: RoomList,
      action: PayloadAction<UserPermission>,
    ) => {
      state.myPermission = action.payload;
    },
    setSelectedMember: (
      state: RoomList,
      action: PayloadAction<Member | null>,
    ) => {
      state.selectedMember = action.payload;
    },
  },
});

export default roomSlice;
export const {
  setBanList,
  setRoomList,
  setMyPermission,
  setRoomMemberList,
  setSelectedMember,
} = roomSlice.actions;
