import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  value: number;
}

const initialState: MyState = {
  value: 0,
};

const mySlice = createSlice({
  name: 'my',
  initialState,
  reducers: {
    up: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export default mySlice;
export const { up } = mySlice.actions;

/*

1. PayloadAction을 가져와서 up reducer의 action 매개변수 타입을 PayloadAction<number>로 명시합니다. 이는 createSlice에서 생성된 액션의 타입을 정확하게 지정하는 데 도움이 됩니다.

2. initialState를 명시적으로 MyState 타입으로 지정합니다. 이렇게 하면 초기 상태의 형식이 제대로 유지됩니다.

3. export default mySlice.reducer;는 슬라이스의 리듀서를 내보냅니다.

4. export const { up } = mySlice.actions;는 up 액션을 내보냅니다.

*/