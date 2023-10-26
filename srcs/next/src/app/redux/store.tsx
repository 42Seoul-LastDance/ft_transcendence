import { configureStore } from '@reduxjs/toolkit';
import { matchSlice } from './matchSlice';
import userSlice from './userSlice';
import roomSlice from './roomSlice';
import alertSlice from './alertSlice';
import dmSlice from './dmSlice';
import friendSlice from './friendSlice';
import viewSlice from './viewSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    room: roomSlice.reducer,
    match: matchSlice.reducer,
    alert: alertSlice.reducer,
    dm: dmSlice.reducer,
    friend: friendSlice.reducer,
    view: viewSlice.reducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
