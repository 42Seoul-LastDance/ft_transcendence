import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { FriendListJson } from '../interface';

export interface FriendListType {
  friendList: FriendListJson[];
}

const initialState: FriendListType = {
  friendList: [],
};

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {
    setFriendList: (
      state: FriendListType,
      action: PayloadAction<FriendListJson[]>,
    ) => {
      state.friendList = action.payload;
    },
  },
});

export default friendSlice;
export const { setFriendList } = friendSlice.actions;
