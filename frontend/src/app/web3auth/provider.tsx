"use client";

import { Web3AuthProvider } from "@web3auth/modal/react";
import { IWeb3AuthState } from "@web3auth/modal";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import web3AuthContextConfig from "./web3authContext";

const queryClient = new QueryClient();

export default function Provider({ children, web3authInitialState }:
  { children: React.ReactNode, web3authInitialState: IWeb3AuthState | undefined }) {
  return (
    <Web3AuthProvider config={{ ...web3AuthContextConfig, web3AuthOptions: { ...web3AuthContextConfig.web3AuthOptions, ssr: true } }} initialState={web3authInitialState}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}