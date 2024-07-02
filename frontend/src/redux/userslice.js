import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  id: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      const { name, email, id, token } = action.payload;
      state.name = name;
      state.email = email;
      state.id = id;
    },
    clearUser(state) {
      state.name = '';
      state.email = '';
      state.id = '';
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
const userReducer = userSlice.reducer;
export { userReducer };
