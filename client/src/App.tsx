import { Switch, Route, Redirect } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DoctorDashboard from "@/pages/doctor-dashboard";
import PatientDashboard from "@/pages/patient-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  // If user is already authenticated, redirect them from auth page to appropriate dashboard
  if (user && location === "/auth") {
    return user.role === "doctor" ? <Redirect to="/" /> : <Redirect to="/patient" />;
  }

  // If user is on wrong dashboard (doctor on patient or vice versa), redirect to correct one
  if (user && user.role === "patient" && location === "/") {
    return <Redirect to="/patient" />;
  }

  if (user && user.role === "doctor" && location === "/patient") {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DoctorDashboard} role="doctor" />
      <ProtectedRoute path="/patient" component={PatientDashboard} role="patient" />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
