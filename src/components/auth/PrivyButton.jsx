import { usePrivy, useIdentityToken, useLogin } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";

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
        const response = await axiosInstance.post(
          "/auth/privy/",
          {
            email: user.email.address,
            id: user.id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("response", response);

        if (response.status == 200) {
          console.log(response.data.user);
          toast.success(response.data.message);
          return;
        } else {
          throw new Error("Failed to send user info to backend");
        }
      } catch (error) {
        console.error("Error sending user email to backend:", error);
      }
    },
  });

  // useEffect(() => {
  //   const handleTokenExchange = async () => {
  //     if (!authenticated || !user) return;

  //     try {
  //       console.log("Starting token exchange...");
  //       setLoading(true);
  //       setError(null);

  //       // Get access token from Privy
  //       console.log("Getting access token from Privy...");
  //       const accessToken = await getAccessToken();

  //       if (!accessToken) {
  //         throw new Error("Failed to get access token from Privy");
  //       }
  //       if (!identityToken) {
  //         throw new Error("Failed to get identity token from Privy");
  //       }
  //       console.log("Got access and identity tokens from Privy", { accessToken, identityToken });

  //       // Send both tokens to backend
  //       const accessTokenResponse = await API.getPrivyToken(accessToken);
  //       const identityTokenResponse = await API.getIdToken(identityToken);

  //       console.log("Backend access token response:", accessTokenResponse);
  //       console.log("Backend identity token response:", identityTokenResponse);

  //       // Use the identity token's backend response for auth
  //       if (identityTokenResponse?.token) {
  //         localStorage.setItem("accessToken", identityTokenResponse.token); // Use identity token's backend response as main token
  //         API.setAuthToken(identityTokenResponse.token);
  //         // Optionally, store the access token response separately if you want
  //         localStorage.setItem("privyAccessToken", accessTokenResponse.token);
  //         console.log("Token exchange successful, redirecting to events...");
  //         router.push("/events");
  //       } else {
  //         throw new Error("Invalid token response from backend");
  //       }
  //     } catch (err) {
  //       console.error("Authentication error:", err);
  //       setError(err.message || "Authentication failed");
  //       // Don't logout on token exchange failure
  //       // Just clean up the local storage
  //       localStorage.removeItem("accessToken");
  //       localStorage.removeItem("identityToken");
  //       API.setAuthToken(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // Only run token exchange if we have a user and are authenticated
  //   if (authenticated && user) {
  //     handleTokenExchange();
  //   }
  // }, [authenticated, user, getAccessToken, router]);

  const handleSignup = async () => {
    if (!ready) {
      console.log("Privy not ready yet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login();
      console.log("Privy login completed");
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
      localStorage.removeItem(user);
      API.setAuthToken(null);
      // Call Privy logout
      await logout();

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
    const token = localStorage.getItem(user);
    if (token) {
      API.setAuthToken(token);
      console.log("User set from localStorage");
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
