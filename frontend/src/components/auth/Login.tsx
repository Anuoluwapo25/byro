

"use client";

import { useEffect } from "react";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Login() {
  const { connect, isConnected, error: connectError } = useWeb3AuthConnect();
  const { token } = useSelector((state: any) => state.auth);
  const router = useRouter();

  // Trigger Web3Auth modal if not yet connected
  useEffect(() => {
    if (!isConnected && !token) {
      connect();
    }
  }, []);

  // Redirect once backend token is set (by Navbar's useEffect)
  useEffect(() => {
    if (token) {
      router.push("/events");
    }
  }, [token, router]);

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