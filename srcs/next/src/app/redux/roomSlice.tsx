import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ChatMessage, Member, UserPermission } from '../interface';

export interface RoomList {
  roomNameList: string[];
  roomMemberList: Member[];
  selectedMember: Member | null;
  myPermission: UserPermission;
}

const initialState: RoomList = {
  roomNameList: [],
  roomMemberList: [],
  selectedMember: null,
  myPermission: UserPermission.NONE,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomNameList: (state: RoomList, action: PayloadAction<string[]>) => {
      state.roomNameList = action.payload;
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
  setRoomNameList,
  setMyPermission,
  setRoomMemberList,
  setSelectedMember,
} = roomSlice.actions;
