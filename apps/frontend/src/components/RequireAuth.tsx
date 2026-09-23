import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isPending, isError, data: user } = useCurrentUser();

  if (isPending) {
    return <p className="text-muted-foreground m-auto text-sm">Loading...</p>;
  }

  if (isError || !user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
