import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface MatchState {
    isCustom: boolean;
    isMatched: boolean;
    side: string;
}

const initialState: MatchState = {
    isCustom: false,
    isMatched: false,
    side: '',
};

export const matchSlice = createSlice({
    name: 'match',
    initialState,
    reducers: {
        setIsCustom: (state, action: PayloadAction<{ isCustom: boolean }>) => {
            state.isCustom = action.payload.isCustom;
        },
        setIsMatched: (
            state,
            action: PayloadAction<{ isMatched: boolean }>,
        ) => {
            state.isMatched = action.payload.isMatched;
        },
        setSide: (state, action: PayloadAction<{ side: string }>) => {
            state.side = action.payload.side;
        },
    },
});

export default matchSlice.reducer;
export const { setIsMatched, setSide, setIsCustom } = matchSlice.actions;
