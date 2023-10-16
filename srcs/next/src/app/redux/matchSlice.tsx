import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PlayerSide, GameJoinMode, GameMode, CustomGameSet } from '../Enums';

export interface MatchState {
  customSet: CustomGameSet;
  isMatched: boolean;
  side: PlayerSide;
  emoji: string;
  leftName: string;
  rightName: string;
}

const initialState: MatchState = {
  customSet: {
    joinMode: GameJoinMode.NONE,
    gameMode: GameMode.NONE,
    opponentName: '',
  },
  isMatched: false,
  side: PlayerSide.NONE,
  emoji: '',
  leftName: '  ???  ',
  rightName: '  ???  ',
};

export const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setCustomSet: (
      state: MatchState,
      action: PayloadAction<{
        joinMode: GameJoinMode;
        gameMode: GameMode;
        opponentName: string | undefined;
      }>,
    ) => {
      state.customSet.joinMode = action.payload.joinMode;
      state.customSet.gameMode = action.payload.gameMode;
      state.customSet.opponentName = action.payload.opponentName;
    },
    setIsMatched: (
      state: MatchState,
      action: PayloadAction<{ isMatched: boolean }>,
    ) => {
      state.isMatched = action.payload.isMatched;
    },
    setSide: (
      state: MatchState,
      action: PayloadAction<{ side: PlayerSide }>,
    ) => {
      state.side = action.payload.side;
    },
    setEmoji: (state: MatchState, action: PayloadAction<{ emoji: string }>) => {
      state.emoji = action.payload.emoji;
    },
    setNames: (
      state: MatchState,
      action: PayloadAction<{ leftName: string; rightName: string }>,
    ) => {
      state.leftName = action.payload.leftName;
      state.rightName = action.payload.rightName;
    },
  },
});

export default matchSlice.reducer;
export const { setIsMatched, setSide, setCustomSet, setEmoji, setNames } =
  matchSlice.actions;
