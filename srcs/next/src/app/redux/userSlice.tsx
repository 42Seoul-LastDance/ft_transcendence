import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface userState {
	name : string,
    imageUrl : string | null,	
}

const initialState: userState = {
	name : "none",
    imageUrl : null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // save name
    setName: (state, action: PayloadAction<string>) => {
        state.name = action.payload; 
    },
    // save image url
    setImageUrl: (state, action: PayloadAction<string>) => {
        state.imageUrl = action.payload;
    },
  },
});

export default userSlice;
export const {setName, setImageUrl} = userSlice.actions;
