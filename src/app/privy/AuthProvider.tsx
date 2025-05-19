'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';


export default function AuthProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID
  
  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set in environment variables');
  }

  return (

    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}



