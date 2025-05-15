import React, { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import GetStarted from "../GetStarted";

const AuthButton = () => {
  const {
    ready,
    authenticated,
    login,
    logout,
    user,
    getAccessToken,
  } = usePrivy();

  // Function to send token to backend once authenticated
  const sendTokenToBackend = async () => {
    if (!ready || !authenticated) return;

    try {
      // ✅ Get the Privy access token
      const accessToken = await getAccessToken();
      console.log("Privy access token:", accessToken);

      // Send the token to your backend
      const response = await fetch("http://127.0.0.1:8000/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),  // You can include other data if needed
      });

      const data = await response.json();
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error sending token to backend:", error);
    }
  };

  useEffect(() => {
  
      const createWalletAfterAuthentication = async () => {
        if (ready && authenticated) {
          // Proceed to create wallet only if authenticated
          try {
            // Trigger wallet creation logic here
            console.log("Creating wallet...");
            // Example code: await createWallet();
          } catch (error) {
            console.error("Error creating wallet:", error);
          }
        } else {
          console.log("User is not authenticated. Cannot create wallet.");
        }
      };
    
      createWalletAfterAuthentication();
    }, [ready, authenticated]); // Ensure it's triggered when user is authenticated
  return (
    <div>
      {authenticated ? (
        <>
          <p>Welcome, {user?.email?.address || user?.wallet?.address}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <GetStarted onClick={login} />
      )}
    </div>
  );
};

export default AuthButton;
