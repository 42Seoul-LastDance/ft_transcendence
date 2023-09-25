import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface MatchState {
    isStarted: boolean;
    side: string;
}

const initialState: MatchState = {
    isStarted: false,
    side: '',
};

export const matchSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        start: (state) => {
            state.isStarted = true;
        },
        stop: (state) => {
            state.isStarted = false;
        },
        setSide: (state, action: PayloadAction<{ side: string }>) => {
            state.side = action.payload.side;
        },
    },
});

export default matchSlice.reducer;
export const { start, stop, setSide } = matchSlice.actions;
