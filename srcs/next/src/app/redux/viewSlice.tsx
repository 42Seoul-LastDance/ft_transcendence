import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface viewState {
  viewProfile: boolean;
  viewNoti: boolean;
}

const initialState: viewState = {
  viewProfile: false,
  viewNoti: false,
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setViewProfile: (state: viewState, action: PayloadAction<boolean>) => {
      state.viewProfile = action.payload;
    },
    setViewNoti: (state: viewState, action: PayloadAction<boolean>) => {
      state.viewNoti = action.payload;
    },
  },
});

export default viewSlice;
export const { setViewNoti, setViewProfile } = viewSlice.actions;
