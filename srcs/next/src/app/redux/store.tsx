import { configureStore, combineReducers } from '@reduxjs/toolkit';
import mySlice from './mySlice';
import tokenSlice from './tokenSlice';
import userSlice from './userSlice';

// const rootReducer = combineReducers({
//   my: mySlice.reducer,
//   token: tokenSlice.reducer
// });

const store = configureStore({
  reducer: 
  {
    user: userSlice.reducer,
  }
});

export default store;

//export type RootState = ReturnType<typeof rootReducer>;
