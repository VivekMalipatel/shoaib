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
          console.log('No user found, redirecting to /auth');
          // Force a hard redirect for consistent browser behavior
          window.location.href = '/auth';
          return null;
        }

        if (role && user.role !== role) {
          console.log(`User role ${user.role} doesn't match protected route role ${role}`);
          if (user.role === "doctor") {
            console.log('Redirecting doctor to /', user);
            window.location.href = '/';
          } else {
            console.log('Redirecting patient to /patient', user);
            window.location.href = '/patient';
          }
          return null;
        }

        return <Component />;
      }}
    </Route>
  );
}
