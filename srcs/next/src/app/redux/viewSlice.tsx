import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface viewState {
  viewProfile: boolean;
  targetSlackId: string | null | undefined;
  viewNoti: boolean;
}

const initialState: viewState = {
  viewProfile: false,
  targetSlackId: '',
  viewNoti: false,
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setViewProfile: (
      state: viewState,
      action: PayloadAction<{
        viewProfile: boolean;
        targetSlackId: string | null | undefined;
      }>,
    ) => {
      state.targetSlackId = action.payload.targetSlackId;
      state.viewProfile = action.payload.viewProfile;
    },
    setViewNoti: (state: viewState, action: PayloadAction<boolean>) => {
      state.viewNoti = action.payload;
    },
  },
});

export default viewSlice;
export const { setViewNoti, setViewProfile } = viewSlice.actions;
