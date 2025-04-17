import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Document from "@/pages/Document";
import Calendar from "@/pages/Calendar";
import Categories from "@/pages/Categories";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";

// ProtectedRoute component to guard routes
const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <svg
          className="animate-spin h-8 w-8 text-primary-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users away from /login
  if (!isLoading && isAuthenticated && window.location.pathname === "/login") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Auth} />

        {/* Protected routes */}
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/upload">
          <ProtectedRoute component={Upload} />
        </Route>
        <Route path="/documents/:id">
          <ProtectedRoute component={Document} />
        </Route>
        <Route path="/documents">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/categories">
          <ProtectedRoute component={Categories} />
        </Route>
        <Route path="/calendar">
          <ProtectedRoute component={Calendar} />
        </Route>
        <Route path="/settings">
          <ProtectedRoute component={Settings} />
        </Route>

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;