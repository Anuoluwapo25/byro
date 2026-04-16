"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useAuthSync } from "@/hooks/useAuthSync";

// Component to handle auth sync (must be inside Redux Provider)
function AuthSyncWrapper({ children }) {
  useAuthSync();
  return <>{children}</>;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthSyncWrapper>
          {children}
        </AuthSyncWrapper>
      </PersistGate>
    </Provider>
  );
}
