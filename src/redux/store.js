import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import appReducer from "./app/app";
import authReducer from "./auth/authSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const authPersistConfig = {
  key: "auth",
  storage: storage,
  blacklist: ["isLoading", "error"],
};

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
  blacklist: ["auth"],
};

const rootReducer = combineReducers({
  //   app: appReducer,

  auth: persistReducer(authPersistConfig, authReducer),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
