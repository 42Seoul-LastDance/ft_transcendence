
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { matchSlice } from './matchSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userSlice from './userSlice';
import roomSlice from './roomSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    room: roomSlice.reducer,
    match: matchSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;