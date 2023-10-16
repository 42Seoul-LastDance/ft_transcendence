import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface FriendListType {
  friendList: string[][];
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
      action: PayloadAction<string[][]>,
    ) => {
      state.friendList = action.payload;
    },
  },
});

export default friendSlice;
export const { setFriendList } = friendSlice.actions;
