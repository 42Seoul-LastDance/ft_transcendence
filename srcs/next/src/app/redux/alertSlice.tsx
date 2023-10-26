import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface alertState {
  showAlert: boolean;
  alertMsg: string;
  severity: string;
}

const initialState: alertState = {
  showAlert: false,
  alertMsg: '',
  severity: '',
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
    setSeverity: (state: alertState, action: PayloadAction<string>) => {
      state.severity = action.payload;
    },
  },
});

export default alertSlice;
export const { setSeverity, setAlertMsg, setShowAlert } = alertSlice.actions;
