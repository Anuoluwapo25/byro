

"use client";

import { useEffect } from "react";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function Login() {
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address, connector } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/events");
    } else {
      connect();
    }
  }, [isConnected, connect, router]);

  const loggedInView = (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );

  const unloggedInView = (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {connectError && (
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {connectError.message}</p>
          {/* <button
            onClick={() => connect()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button> */}
        </div>
      )}
    </div>
  );

  return isConnected ? loggedInView : unloggedInView;
}