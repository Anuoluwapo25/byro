import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("byro_token") || null,
  user: localStorage.getItem("byro_user")
    ? JSON.parse(localStorage.getItem("byro_user"))
    : null,
  error: null,
  loading: false,
  isLoggedIn: !!localStorage.getItem("byro_token"),
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

      // Save to localStorage
      localStorage.setItem("byro_token", state.token);
      localStorage.setItem("byro_user", JSON.stringify(state.user));
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
