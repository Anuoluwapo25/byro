import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('token') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  // Privy state
  privyUser: null,
  privyUserId: null,
  privyAuthenticated: false,
  // Supabase state
  supabaseUserId: null,
  // Loading states
  isSyncing: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', JSON.stringify(action.payload.token));
      }
    },
    setPrivyAuth: (state, action) => {
      state.privyAuthenticated = action.payload.authenticated;
      state.privyUser = action.payload.user || null;
      state.privyUserId = action.payload.user?.id || null;
      
      // Update isAuthenticated based on Privy state if no backend token
      if (!state.token && action.payload.authenticated) {
        state.isAuthenticated = true;
      }
    },
    setSupabaseUser: (state, action) => {
      state.supabaseUserId = action.payload.supabaseUserId || null;
    },
    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },
    signOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.privyUser = null;
      state.privyUserId = null;
      state.privyAuthenticated = false;
      state.supabaseUserId = null;
      state.isSyncing = false;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
      }
    },
  },
});

export const { authSuccess, signOut, setPrivyAuth, setSupabaseUser, setSyncing } = authSlice.actions;
export default authSlice.reducer;
