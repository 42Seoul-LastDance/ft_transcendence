import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { matchSlice } from './matchSlice';
import userSlice from './userSlice';
import roomSlice from './roomSlice';
import alertSlice from './alertSlice';
import dmSlice from './dmSlice';
import friendSlice from './friendSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    room: roomSlice.reducer,
    match: matchSlice.reducer,
    alert: alertSlice.reducer,
    dm: dmSlice.reducer,
    friend: friendSlice.reducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
