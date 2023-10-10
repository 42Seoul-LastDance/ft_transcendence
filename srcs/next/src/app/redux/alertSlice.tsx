import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface alertState {
  showAlert: boolean;
  alertMsg: string;
}

const initialState: alertState = {
  showAlert: false,
  alertMsg: '',
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlertMsg: (state: alertState, action: PayloadAction<string>) => {
      state.alertMsg = action.payload;
    },
    setShowAlert: (state: alertState, action: PayloadAction<boolean>) => {
      state.showAlert = action.payload;
    },
  },
});

export default alertSlice;
export const { setAlertMsg, setShowAlert } = alertSlice.actions;
