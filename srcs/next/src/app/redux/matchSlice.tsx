import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PlayerSide } from '../Enums';

export interface MatchState {
    isCustom: boolean;
    isMatched: boolean;
    side: PlayerSide;
    emoji: string;
    leftName: string;
    rightName: string;
}

const initialState: MatchState = {
    isCustom: false,
    isMatched: false,
    side: PlayerSide.NONE,
    emoji: '',
    leftName: '?',
    rightName: '?',
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
        setSide: (state, action: PayloadAction<{ side: PlayerSide }>) => {
            state.side = action.payload.side;
        },
        setEmoji: (state, action: PayloadAction<{ emoji: string }>) => {
            state.emoji = action.payload.emoji;
        },
        setNames: (
            state,
            action: PayloadAction<{ leftName: string; rightName: string }>,
        ) => {
            state.leftName = action.payload.leftName;
            state.rightName = action.payload.rightName;
        },
    },
});

export default matchSlice.reducer;
export const { setIsMatched, setSide, setIsCustom, setEmoji, setNames } =
    matchSlice.actions;
