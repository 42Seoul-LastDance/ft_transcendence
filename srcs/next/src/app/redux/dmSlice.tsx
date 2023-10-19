import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DMState {
  //   userName: string | null;
  friendName: string | null;
  friendSlackId: string | null;
}

const initialState: DMState = {
  //   userName: null,
  friendName: null,
  friendSlackId: null,
};

const dmSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // setName: (state: DMState, action: PayloadAction<string>) => {
    //   state.userName = action.payload;
    // },
    setFriend: (state: DMState, action: PayloadAction<string>) => {
      state.friendName = action.payload;
    },
    setFriendSlackId: (state: DMState, action: PayloadAction<string>) => {
      state.friendSlackId = action.payload;
    },
  },
});

export default dmSlice;
export const {
  // setName,
  setFriend,
  setFriendSlackId,
} = dmSlice.actions;
