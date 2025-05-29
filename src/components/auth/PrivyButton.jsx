import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";

export default function AuthButton() {
  const { ready, authenticated, user, login, getAccessToken, logout } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Effect to handle token exchange after authentication
  useEffect(() => {
    const handleTokenExchange = async () => {
      if (!authenticated || !user) return;

      try {
        console.log("Starting token exchange...");
        setLoading(true);
        setError(null);
        
        // Get access token from Privy
        console.log("Getting access token from Privy...");
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Failed to get access token from Privy");
        }
        console.log("Got access token from Privy");

        // send Privy access token to our backend 
       
        const response = await API.getPrivyToken(accessToken);
        console.log("Backend token response:", response);
        
        if (response?.token) {
          // Store the token
          localStorage.setItem("accessToken", response.token);
          // Set auth token for future requests
          API.setAuthToken(response.token);
          console.log("Token exchange successful, redirecting to events...");
          // Redirect to events page after successful authentication
          router.push("/events");
        } else {
          throw new Error("Invalid token response from backend");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err.message || "Authentication failed");
        // Don't logout on token exchange failure
        // Just clean up the local storage
        localStorage.removeItem("accessToken");
        API.setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Only run token exchange if we have a user and are authenticated
    if (authenticated && user) {
      handleTokenExchange();
    }
  }, [authenticated, user, getAccessToken, router]);

  const handleSignup = async () => {
    if (!ready) {
      console.log("Privy not ready yet");
      return;
    }
    
    try {
      console.log("Starting signup process...");
      setLoading(true);
      setError(null);
      
      console.log("Calling Privy login...");
      await login();
      console.log("Privy login completed");
      // The useEffect will handle the token exchange after authentication
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      // Clear local storage and API token
      localStorage.removeItem("accessToken");
      API.setAuthToken(null);
      // Call Privy logout
      await logout();
      // Redirect to home page after logout
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // Check if we already have a token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      API.setAuthToken(token);
      console.log("Token set from localStorage");
    }
  }, []);

  if (authenticated) {
    return (
      <SignupButton
        onClick={handleLogout}
        disabled={loading}
        loading={loading}
        text="Logout"
        className="bg-red-500 hover:bg-red-600"
      />
    );
  }

  return (
    <SignupButton
      onClick={handleSignup}
      disabled={loading || !ready}
      loading={loading}
      text={loading ? "Signing in..." : "Sign In"}
    />
  );
}