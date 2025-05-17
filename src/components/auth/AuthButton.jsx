
import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";

export default function AuthButton() {
  const { ready, authenticated, user, login, getAccessToken, logout } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Effect to handle token generation after authentication
  useEffect(() => {
    if (authenticated) {
      const handleTokenGeneration = async () => {
        try {
          setLoading(true);
          const accessToken = await getAccessToken();
          
          if (!accessToken) {
            throw new Error("Failed to generate access token");
          }

          const response = await fetch("/privy/token/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Signup failed");
          }

          setSuccess(true);
        } catch (err) {
          setError(err.message || "Signup failed");
          // Clean up failed auth attempt
          await logout();
        } finally {
          setLoading(false);
        }
      };

      handleTokenGeneration();
    }
  }, [authenticated, getAccessToken, logout]);

  const handleSignup = async () => {
    if (!ready) return;
    try {
      setLoading(true);
      setError(null);
      await login();
      // The useEffect will handle the rest after authentication
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded">
        Signup successful! Welcome aboard.
      </div>
    );
  }

  return (
    <>
    

      <button
        onClick={handleSignup}
        disabled={loading || !ready}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Sign Up with Email or Wallet"}
      </button>

      {authenticated && !success && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p>Completing your signup...</p>
        </div>
      )}
    </>
  );
}