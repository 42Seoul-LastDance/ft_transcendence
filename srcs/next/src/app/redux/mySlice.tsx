import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface Room {
    id: number;
    name: string;
}

interface RoomState {
    roomState: Room[];
}

const initialState: RoomState = {
    roomState: [],
};

export const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        push: (state, action: PayloadAction<{ name: string }>) => {
            state.roomState.push({
                id: state.roomState.length,
                name: action.payload.name,
            });
        },
    },
});

export default roomSlice.reducer;
export const { push } = roomSlice.actions;
