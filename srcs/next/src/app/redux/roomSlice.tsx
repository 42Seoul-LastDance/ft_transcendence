import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  ChatMessage,
  GetChatRoomListJSON,
  Member,
  UserPermission,
} from '../interface';

export interface RoomList {
  roomList: GetChatRoomListJSON[];
  roomMemberList: Member[];
  selectedMember: Member | null;
  myPermission: UserPermission;
}

const initialState: RoomList = {
  roomList: [],
  roomMemberList: [],
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
  setRoomList,
  setMyPermission,
  setRoomMemberList,
  setSelectedMember,
} = roomSlice.actions;
