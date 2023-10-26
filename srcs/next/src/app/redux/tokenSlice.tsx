import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface tokenState {
    authenticated : boolean;
    accessToken : string | null;
    expireTime : number | null;
}

const initialState: tokenState = {
    authenticated : false,
    accessToken : null,
    expireTime : null,
};

const tokenSlice = createSlice({
  name: 'authToken',
  initialState,
  reducers: {
    // save token
    setToken: (state, action: PayloadAction<string>) => {
        state.authenticated = true; 
        state.accessToken = action.payload;
    },
    // save expire time
    setExpireTime: (state, action: PayloadAction<number>) => {
        state.expireTime = action.payload;
    },
  },
});

// check authenticated
export const isAuthenticated = (state: tokenState) => {
    return state.expireTime !== null && state.expireTime > Date.now();
};

export default tokenSlice;
export const {setToken, setExpireTime} = tokenSlice.actions;
