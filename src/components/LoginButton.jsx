'use client';

import { usePrivy } from '@privy-io/react-auth';
import GetStarted from './GetStarted';

export default function LoginButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) return null;

  return authenticated ? (
    <div>
      <p>Welcome, {user.email?.address || user.wallet?.address}</p>
      <button 
        onClick={logout} 
        className="bg-red-500 text-white text-sm px-4 py-2 rounded-full hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  ) : (
    <GetStarted onClick={login} />
  );
}
