import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Socket, io } from 'socket.io-client';

interface SocketState {
    isChanged: boolean;
}

const initialState: SocketState = {
    isChanged: false,
};

export const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        setIsChanged: (
            state,
            action: PayloadAction<{ isChanged: boolean }>,
        ) => {
            state.isChanged = action.payload.isChanged;
        },
    },
});

export default socketSlice.reducer;
export const { setIsChanged } = socketSlice.actions;
