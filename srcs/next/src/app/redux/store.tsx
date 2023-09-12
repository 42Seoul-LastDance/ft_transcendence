import { configureStore, combineReducers } from '@reduxjs/toolkit';
import mySlice from './mySlice';

const rootReducer = combineReducers({
  my: mySlice.reducer
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;

export type RootState = ReturnType<typeof rootReducer>;
