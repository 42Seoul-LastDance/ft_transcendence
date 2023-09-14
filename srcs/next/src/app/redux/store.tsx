import { configureStore, combineReducers } from '@reduxjs/toolkit';
import mySlice from './mySlice';
import tokenSlice from './tokenSlice';

const rootReducer = combineReducers({
  my: mySlice.reducer,
  token: tokenSlice.reducer
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;

export type RootState = ReturnType<typeof rootReducer>;
