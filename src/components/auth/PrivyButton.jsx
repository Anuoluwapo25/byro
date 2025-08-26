import { usePrivy, useIdentityToken, useLogin } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";

export default function AuthButton() {
  const { ready, authenticated, user, getAccessToken, logout, getIdToken } =
    usePrivy();
  const { identityToken } = useIdentityToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      console.log("Logged in user:", user);

      try {
        const response = await fetch("/auth/privy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            id: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send user info to backend");
        }

        const data = await response.json();
        console.log("Backend response:", data);
      } catch (error) {
        console.error("Error sending user email to backend:", error);
      }
    },
  });

  
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
        if (!identityToken) {
          throw new Error("Failed to get identity token from Privy");
        }
        console.log("Got access and identity tokens from Privy");

        // Send both tokens to backend
        const accessTokenResponse = await API.getPrivyToken(accessToken);
        const identityTokenResponse = await API.getIdToken(identityToken);

        console.log("Backend access token response:", accessTokenResponse);
        console.log("Backend identity token response:", identityTokenResponse);

        // Use the identity token's backend response for auth
        if (identityTokenResponse?.token) {
          localStorage.setItem("accessToken", identityTokenResponse.token); // Use identity token's backend response as main token
          API.setAuthToken(identityTokenResponse.token);
          // Optionally, store the access token response separately if you want
          localStorage.setItem("privyAccessToken", accessTokenResponse.token);
          console.log("Token exchange successful, redirecting to events...");
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
        localStorage.removeItem("identityToken");
        API.setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Only run token exchange if we have a user and are authenticated
    if (authenticated && user) {
      handleTokenExchange();
    }
  }, [authenticated, user, getAccessToken]);

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
      localStorage.removeItem("identityToken");
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
        className="!bg-red-600 !text-white hover:!bg-red-700"
        avatarClassName="!w-8 !h-8"
        textClassName="!text-sm !font-medium"
        showAvatar={true}
        showAddress={true}
        showEmail={true}
        truncateAddress={true}
        text={"Logout"}
      />
    );
  }

  return <SignupButton onClick={handleSignup} text={"Sign In"} />;
}
