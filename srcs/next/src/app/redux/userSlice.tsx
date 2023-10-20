import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoomDto, GetInvitationListJson,  } from '../interfaces';
import { JoinStatus } from '../enums';

export interface userState {
  userImg: string | null;
  isAvailable: boolean | null;
  token: string | null;
  chatRoom: ChatRoomDto | null;
  userName: string | null;
  userSlackId: string | null;
  join: JoinStatus;
  notiCount: number;
  invitationList: GetInvitationListJson[];
}

const initialState: userState = {
  userImg: null,
  isAvailable: null,
  token: null,
  chatRoom: null,
  userName: null,
  userSlackId: null,
  join: JoinStatus.NONE,
  notiCount: 0,
  invitationList: [],
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
    setSlackId: (state: userState, action: PayloadAction<string>) => {
      state.userSlackId = action.payload;
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
    setNotiCount: (state: userState, action: PayloadAction<number>) => {
      state.notiCount = action.payload;
    },
    setInvitationList: (
      state: userState,
      action: PayloadAction<GetInvitationListJson[]>,
    ) => {
      state.invitationList = action.payload;
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
  setSlackId,
  setJoin,
  setNotiCount,
  setInvitationList,
} = userSlice.actions;
