import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import {
  WEB3AUTH_NETWORK,
  type Web3AuthOptions,
  WALLET_CONNECTORS,
} from "@web3auth/modal";

const web3AuthOptions: Web3AuthOptions = {
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        label: "auth",
        loginMethods: {
          email_passwordless: {
            name: "Email",
            showOnModal: true,
            mainOption: true,
          },
        },
        showOnModal: true,
      },
    },
    hideWalletDiscovery: true,
  },
  sessionTime: 86400 * 7, // 7 days
  storageType: "local",
  enableLogging: process.env.NODE_ENV === "development",
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export default web3AuthContextConfig;
