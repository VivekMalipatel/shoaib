import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: {
  path: string;
  component: () => React.JSX.Element;
  role?: "patient" | "doctor";
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (role && user.role !== role) {
          return user.role === "doctor" ? (
            <Redirect to="/" />
          ) : (
            <Redirect to="/patient" />
          );
        }

        return <Component />;
      }}
    </Route>
  );
}
