import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  error: null,
  loading: false,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOut: (state) => {
      state.loading = false;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      localStorage.removeItem("redux-root");
      localStorage.removeItem("persist:user");
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("persist:message");
      window.location.href = "/";
    },

    authStart: (state) => {
      state.loading = true;
    },
    authSuccess: (state, { payload }) => {
      console.log("payload", payload);
      state.isLoggedIn = true;

      state.token = payload?.token?.access;
      state.user = payload?.user;

      state.loading = false;
      state.error = null;
    },
    authFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { signOut, authStart, authSuccess, authFailure } =
  authSlice.actions;

export default authSlice.reducer;
