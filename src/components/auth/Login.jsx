"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../Navbar";
import { FaGoogle } from "react-icons/fa";
import { SignIcon, Checkmark } from "../../app/assets/index";
import { useLoginWithEmail, usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import API from "@/services/api";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 45; // seconds

export default function Login() {
  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const router = useRouter();

  const [step, setStep] = useState("email"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState("initial");

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // guard to prevent double submits

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const codeRefs = useMemo(
    () => Array.from({ length: CODE_LENGTH }, () => React.createRef()),
    []
  );

  const {
    sendCode: sendCodeEmail,
    loginWithCode: loginWithCodeEmail,
    state: stateEmail,
  } = useLoginWithEmail({
    onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod }) => {
      console.log("User successfully logged in with email", {
        user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
      });

      // Get Privy access token and send to backend
      try {
        const privyAccessToken = await getAccessToken();
        const privy_id = user?.id;
        const userEmail = user?.email?.address || email; 

        if (!privy_id || !privyAccessToken || !userEmail) {
          console.error("Missing authentication data:", {
            privy_id,
            privyAccessToken: !!privyAccessToken,
            userEmail,
          });
          toast.error("Authentication data incomplete. Please try again.", {
            duration: 4000,
          });
          return;
        }

        // Send authentication details to backend
        await API.authenticateWithPrivy({
          privy_id,
          privyAccessToken,
          email: userEmail,
        });

        console.log("Successfully authenticated with backend");
      } catch (error) {
        console.error("Backend authentication error:", error);
        toast.error(
          error?.message || "Failed to complete authentication. Please try again.",
          { duration: 4000 }
        );
        return;
      }

      if (isNewUser) {
        toast.success("Welcome! Your account has been created successfully.", {
          duration: 4000,
        });
        setTimeout(() => router.push("/profile"), 1000);
      } else {
        toast.success("Welcome back! You've successfully logged in.", {
          duration: 3000,
        });
        setTimeout(() => router.push("/events"), 1000);
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error(error?.message || "Login failed. Please try again.", {
        duration: 4000,
      });
    },
  });

  useEffect(() => {
    if (stateEmail.status === "error" && stateEmail.error) {
      toast.error(stateEmail.error.message || "An error occurred", {
        duration: 4000,
      });
    }
  }, [stateEmail]);

  useEffect(() => {
    if (step === "email") {
      nameRef.current?.focus();
    } else {
      codeRefs[0]?.current?.focus();
      setSecondsLeft(RESEND_COOLDOWN);
    }
  }, [step, codeRefs]);

  useEffect(() => {
    if (step !== "verify") return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nextName = form.get("name")?.toString().trim() || "";
    const nextEmail = form.get("email")?.toString().trim() || "";

    if (!nextName || !nextEmail) {
      toast.error("Please fill in all required fields", { duration: 3000 });
      return;
    }

    setName(nextName);
    setEmail(nextEmail);

    try {
      toast.loading("Sending verification code...", { id: "send-code" });
      await sendCodeEmail({ email: nextEmail });
      toast.success("Verification code sent to your email!", {
        id: "send-code",
        duration: 3000,
      });
      setStep("verify");
    } catch (error) {
      toast.error("Failed to send code. Please try again.", {
        id: "send-code",
        duration: 4000,
      });
      console.error("Send code error:", error);
    }
  };

  const verifyCode = async (token) => {
    if (isVerifying || stateEmail.status === "submitting-code") return;
    if (token.length !== CODE_LENGTH) return;

    setIsVerifying(true);
    try {
      toast.loading("Verifying code...", { id: "verify-code" });
      await loginWithCodeEmail({ code: token });
      toast.dismiss("verify-code");
    } catch (error) {
      toast.error("Invalid code. Please check and try again.", {
        id: "verify-code",
        duration: 4000,
      });
      console.error("Verify code error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (idx, value) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 1);

    setCode((prev) => {
      const next = [...prev];
      next[idx] = sanitized;

      const nextToken = next.join("");
      if (nextToken.length === CODE_LENGTH) {
        verifyCode(nextToken);
      }

      return next;
    });

    if (sanitized && idx < CODE_LENGTH - 1) {
      codeRefs[idx + 1]?.current?.focus();
    }
  };

  const handleCodeKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      codeRefs[idx - 1]?.current?.focus();
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    try {
      toast.loading("Resending verification code...", { id: "resend-code" });
      await sendCodeEmail({ email });
      toast.success("Verification code resent!", {
        id: "resend-code",
        duration: 3000,
      });
      setSecondsLeft(RESEND_COOLDOWN);
    } catch (error) {
      toast.error("Failed to resend code. Please try again.", {
        id: "resend-code",
        duration: 4000,
      });
      console.error("Resend code error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = code.join("");
    await verifyCode(token);
  };

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/events");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="bg-white">
      <Navbar />
      <div className="flex items-center justify-center bg-white min-h-screen px-4 sm:px-6 py-4 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {step === "email" ? (
              <>
                <div>
                  <Image
                    src={SignIcon}
                    alt="Signin Icon"
                    className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]"
                    priority
                  />
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1.5 sm:mb-2">
                    Welcome
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Please note the name here will be used as "Host name" when
                    you create an event.
                  </p>
                </div>

                <form className="space-y-3 sm:space-y-4" onSubmit={handleEmailSubmit}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs sm:text-sm font-medium text-blue-600 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      ref={nameRef}
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-medium text-blue-600 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      ref={emailRef}
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 sm:gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={stateEmail.status === "sending-code"}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[#007AFF] text-white rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {stateEmail.status === "sending-code"
                        ? "Sending code..."
                        : "Continue with Email"}
                    </button>

                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition text-gray-700"
                      onClick={() => {
                        toast.info("Google sign-in coming soon!", {
                          duration: 3000,
                        });
                      }}
                    >
                      <FaGoogle className="w-4 h-4" />
                      <span className="font-medium">Sign in with Google</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="space-y-1.5 sm:space-y-2">
                  <Image
                    src={Checkmark}
                    alt="Signin Icon"
                    className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px]"
                    priority
                  />
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    Verify email
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-gray-900 break-all">{email}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="font-mono">
                      {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
                      {String(secondsLeft % 60).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      className="text-blue-600 font-semibold disabled:text-gray-400 hover:underline"
                      disabled={secondsLeft > 0 || isResending}
                      onClick={handleResend}
                    >
                      {isResending ? "Sending..." : "Resend code"}
                    </button>
                  </div>
                </div>

                <form className="space-y-4 sm:space-y-6" onSubmit={handleVerify}>
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={codeRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-black text-base sm:text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      code.join("").length !== CODE_LENGTH ||
                      stateEmail.status === "submitting-code" ||
                      isVerifying
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[#007AFF] text-white rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {stateEmail.status === "submitting-code" || isVerifying
                      ? "Verifying..."
                      : "Continue"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
