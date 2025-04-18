// client/src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// Import Supabase client
import {
  createClient,
  User as SupabaseUser,
  Session,
} from "@supabase/supabase-js";
// Remove old imports:
// import jwt from 'jsonwebtoken';
// import { useLocation } from 'wouter'; // This hook is used in Auth.tsx, not the context

// IMPORTANT: Use environment variables for your Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // vite syntax for env vars

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key environment variables are required."
  );
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define User interface based on Supabase User
// This User object comes directly from Supabase Auth
// It includes the UUID id
interface User {
  id: string; // Supabase user ID is a UUID
  email?: string; // Add other fields from the Supabase User object or user_metadata if needed
  user_metadata: {
    name?: string; // Assuming 'name' might be stored in user_metadata
    [key: string]: any; // Allow other metadata properties
  }; // Add more properties from SupabaseUser if you use them (e.g., created_at, last_sign_in_at)
}

interface AuthContextProps {
  // user is now the SupabaseUser object or null
  user: User | null; // Use our defined User interface
  token: string | null; // Supabase access token
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth state check // login and register now use Supabase Auth methods (typically email/password)
  login: (email: string, password: string) => Promise<void>; // Register might take email, password, and other user data
  register: (
    email: string,
    password: string,
    data?: { name?: string }
  ) => Promise<void>;
  logout: () => Promise<void>; // Logout is async with Supabase // Helper function to get auth headers for API calls using the Supabase session token
  getAuthHeaders: () => { Authorization?: string };
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Remove the custom decodeJwtPayload function

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use Supabase's session object to manage auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null); // Map SupabaseUser to our User interface
  const [isLoading, setIsLoading] = useState(true); // Loading state for the initial session check // Effect to listen for Supabase auth state changes

  useEffect(() => {
    // This subscription handles initial session loading and subsequent state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession); // Map the Supabase User object to our minimal User interface
      setUser(
        currentSession
          ? ({
              id: currentSession.user.id,
              email: currentSession.user.email,
              user_metadata: currentSession.user.user_metadata,
            } as User)
          : null
      ); // Cast to User interface
      setIsLoading(false); // Auth state is determined
    }); // Cleanup subscription on unmount

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Run only once on mount // Login function using Supabase Auth // Supabase typically uses email/password for built-in auth

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false); // setIsLoading should be inside onAuthStateChange or after the await

    if (error) {
      console.error("Supabase Login error:", error.message);
      throw new Error(error.message || "Login failed");
    } // Auth state change is handled by the onAuthStateChange listener
  }; // Register function using Supabase Auth // Supabase typically uses email/password for built-in auth

  const register = async (
    email: string,
    password: string,
    data?: { name?: string }
  ) => {
    setIsLoading(true);
    const {
      data: { user: registeredUser, session: registeredSession },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: data, // Optional: store additional user metadata like name // redirectTo: 'your-redirect-url', // Optional: for email confirmation flow
      },
    });

    setIsLoading(false); // setIsLoading should be inside onAuthStateChange or after the await

    if (error) {
      console.error("Supabase Registration error:", error.message);
      throw new Error(error.message || "Registration failed");
    } // Important: If email confirmation is required, registeredUser/registeredSession might be null initially. // For simplicity here, we assume no confirmation or that confirmation happens out of band. // The onAuthStateChange listener will update the state if session is created immediately. // If you need to immediately insert into your public 'users' table after Supabase Auth signup, // you would do it here using the returned registeredUser.id and potential data.name // However, it's often safer to trigger this from the backend via a Supabase Function or Webhook // on auth.users INSERT event to ensure the user exists in auth before creating the profile record. // For now, we'll assume the backend handles creating the public.users row based on the auth.users row.

    if (registeredUser && registeredSession) {
      console.log("User registered successfully:", registeredUser); // onAuthStateChange listener will update context state
    } else {
      // This case happens if email confirmation is enabled and required before session creation
      throw new Error(
        "Registration successful, please check your email to confirm."
      );
    }
  }; // Logout function using Supabase Auth

  const logout = async () => {
    setIsLoading(true); // Set loading state during logout
    const { error } = await supabase.auth.signOut();
    setIsLoading(false); // Set loading state after logout

    if (error) {
      console.error("Supabase Logout error:", error.message); // Optionally throw or handle error, but usually logout client-side should clear state regardless
    } // onAuthStateChange listener will set session/user to null
  }; // Helper to get auth headers using the current session token

  const getAuthHeaders = () => {
    // Use the session's access_token provided by Supabase
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    return {}; // Return empty object if no active session
  }; // isAuthenticated is true if a session and user exist

  const isAuthenticated = !!session && !!user; // Check for both session and user

  return (
    <AuthContext.Provider
      value={{
        user,
        token: session?.access_token || null, // Provide Supabase access token
        isAuthenticated,
        isLoading, // Still need isLoading for the initial session check
        login,
        register,
        logout,
        getAuthHeaders,
      }}
    >
                  {/* Render children only after the initial loading check */} 
                {!isLoading && children}           {" "}
      {/* You might want a loading spinner here instead */}           {" "}
      {isLoading && <div>Loading authentication state...</div>}       {" "}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
