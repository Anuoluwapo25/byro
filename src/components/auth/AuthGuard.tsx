"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login"); // send unauthenticated users to login page
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return <p>Loading...</p>;
  }

  if (!authenticated) {
    return <p>Redirecting to login...</p>;
  }

  return <>{children}</>;
}
