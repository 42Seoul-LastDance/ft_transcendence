import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { JoinStatus } from '../interface';

export interface DMState {
  userName: string | null;
  friendName: string | null;
  // join: JoinStatus;
}

const initialState: DMState = {
  userName: null,
  friendName: null,
  // join: JoinStatus.NONE,
};

const dmSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setName: (state: DMState, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setFriend: (state: DMState, action: PayloadAction<string>) => {
      state.friendName = action.payload;
    },
    // setJoin: (state: DMState, action: PayloadAction<number>) => {
    //   state.join = action.payload;
    // },
  },
});

export default dmSlice;
export const {
  setName,
  setFriend,
  // setJoin,
} = dmSlice.actions;
