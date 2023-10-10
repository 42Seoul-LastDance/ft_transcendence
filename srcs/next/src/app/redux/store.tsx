import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { matchSlice } from './matchSlice';
import userSlice from './userSlice';
import roomSlice from './roomSlice';
import alertSlice from './alertSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    room: roomSlice.reducer,
    match: matchSlice.reducer,
    alert: alertSlice.reducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
