"use client";

import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { authSuccess, signOut } from "@/redux/auth/authSlice";
import { clearSupabaseSession } from "@/utils/supabaseAuth";

// Decode JWT payload without verifying signature to check expiry client-side
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export default function AuthButton() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { ready, user, logout, getAccessToken } = usePrivy();

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLoginComplete = useCallback(
    async ({ user, isNewUser }) => {
      if (!user?.id) {
        toast.error("Missing user data from Privy");
        return;
      }

      try {
        setLoading(true);

        // Privy's onComplete fires before the SDK stores fresh tokens internally.
        // Wait for the SDK state to settle before calling getAccessToken().
        await new Promise((r) => setTimeout(r, 800));

        let privyAccessToken = await getAccessToken();

        if (!privyAccessToken) {
          toast.error("Failed to get authentication token. Please try again.");
          return;
        }

        // If still expired after the delay, retry once more
        if (isTokenExpired(privyAccessToken)) {
          console.warn("Token still expired after delay, retrying once...");
          await new Promise((r) => setTimeout(r, 1200));
          privyAccessToken = await getAccessToken();

          if (!privyAccessToken || isTokenExpired(privyAccessToken)) {
            await logout();
            toast.error("Your session has expired. Please sign in again.");
            return;
          }
        }

        const response = await axiosInstance.post(
          "/auth/privy/",
          {
            privy_access_token: privyAccessToken,
            token: privyAccessToken,
            email: user?.email?.address,
          },
          {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            timeout: 15000,
          }
        );

        if (response.status === 200 && response.data?.success) {
          const tokens = response.data.tokens;
          const accessToken = tokens?.access || tokens?.access_token || tokens;

          API.setAuthToken(accessToken);
          dispatch(authSuccess({ user: response.data.user, token: tokens }));
          toast.success(response.data.message || "Successfully signed in!");

          setTimeout(() => router.push(isNewUser ? "/profile" : "/events"), 1000);
        }
      } catch (error) {
        console.error("Login error:", error.response?.data || error.message);

        if (error.response?.status === 401) {
          toast.error("Authentication failed. Please try again.");
        } else if (error.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to complete sign in. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch, getAccessToken, logout, router]
  );

  const { login } = useLogin({ onComplete: handleLoginComplete });

  const handleSignup = async () => {
    if (!ready) return;
    try {
      setLoading(true);
      await login();
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await clearSupabaseSession();
      if (user?.id) localStorage.removeItem(user.id);
      API.setAuthToken(null);
      await logout();
      dispatch(signOut());
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Only show Logout when the BACKEND has authenticated the user (Redux state),
  // not just when Privy says authenticated. This prevents access to protected
  // features for users Privy accepted but the backend hasn't verified yet.
  if (isAuthenticated) {
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
