import { configureStore } from '@reduxjs/toolkit';
import { roomSlice } from './mySlice';
import { matchSlice } from './matchSlice';
import { socketSlice } from './socketSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
    reducer: {
        room: roomSlice.reducer,
        match: matchSlice.reducer,
        socket: socketSlice.reducer,
    },
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<
    ReturnType<typeof store.getState>
> = useSelector;

export type RootState = ReturnType<typeof store.getState>;
