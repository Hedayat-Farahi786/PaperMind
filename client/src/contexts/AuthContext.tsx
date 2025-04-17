import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import jwt from 'jsonwebtoken'; // REMOVE: jsonwebtoken is for server-side signing/verification

// Define a minimal User interface based on what the token payload contains
// This should match the payload structure you use when signing the token on the backend
interface User {
  id: number;
  username: string;
  // Add other non-sensitive fields if included in the token payload (e.g., name, email if present and not sensitive)
  name?: string;
  email?: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null; // Add token to context state
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name?: string, email?: string) => Promise<void>;
  logout: () => void;
  // Helper function to get auth headers for API calls
  getAuthHeaders: () => { Authorization?: string };
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper function to safely decode JWT payload client-side
function decodeJwtPayload(token: string): User | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            // Not a valid JWT structure (header.payload.signature)
            return null;
        }
        const payload = parts[1]; // Get the payload part (middle part)

        // Base64Url decode (replace - with +, _ with /) and pad if necessary
        let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        // Use browser's atob to decode standard base64
        const decodedPayload = atob(base64);

        // Parse the JSON string
        const payloadObj = JSON.parse(decodedPayload);

        // Check if it contains expected user fields
        if (payloadObj && typeof payloadObj.userId === 'number' && typeof payloadObj.username === 'string') {
            // Map payload fields to your User interface
            return {
                id: payloadObj.userId,
                username: payloadObj.username,
                name: payloadObj.name, // Include if you added it to the payload
                email: payloadObj.email, // Include if you added it to the payload
                // ... other fields from payload mapped to User
            };
        }

        return null; // Payload doesn't contain expected user info

    } catch (error) {
        console.error("Failed to decode JWT payload:", error);
        return null; // Decoding or parsing failed
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  // Store token and a minimal user object derived from the initial auth response/token
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Store minimal user info
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // Client-side decode to get user info for UI.
            // **IMPORTANT:** This does NOT verify the token's validity (signature/expiry).
            // Authentication and authorization rely on the backend verifying the token on EACH protected request.
            const userData = decodeJwtPayload(storedToken);

            if (userData) {
                setToken(storedToken);
                setUser(userData); // Set minimal user info from decoded payload
            } else {
                 // If payload is invalid or missing user info, clear the token
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }

        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear token if there's an unexpected error
         localStorage.removeItem('token');
         setToken(null);
         setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Effect to sync state with localStorage changes from other tabs/windows (optional but good practice)
   useEffect(() => {
     const handleStorageChange = () => {
       const storedToken = localStorage.getItem('token');
       if (storedToken !== token) { // Only update if it's actually different
         if (storedToken) {
            const userData = decodeJwtPayload(storedToken);
            setToken(storedToken);
            setUser(userData);
         } else {
            setToken(null);
            setUser(null);
         }
       }
     };

     window.addEventListener('storage', handleStorageChange);

     return () => {
       window.removeEventListener('storage', handleStorageChange);
     };
   }, [token]); // Depend on token state to avoid infinite loops but react to its changes


  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      // Expecting { token: '...', user: { id: ..., username: ... } } from backend
      const { token: receivedToken, user: receivedUser } = await response.json();

      // Validate received data structure
      if (typeof receivedToken !== 'string' || !receivedUser || typeof receivedUser.id !== 'number' || typeof receivedUser.username !== 'string') {
           throw new Error('Invalid response format from server');
      }

      setToken(receivedToken);
      setUser(receivedUser); // Set minimal user info from response
      localStorage.setItem('token', receivedToken); // Store only the token

    } catch (error: any) {
      console.error("Login error:", error);
      // Clear any potentially stale token/user on failed login attempt
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      throw new Error(error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, name?: string, email?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

       // Expecting { token: '...', user: { id: ..., username: ... } } from backend
      const { token: receivedToken, user: receivedUser } = await response.json();

       // Validate received data structure
      if (typeof receivedToken !== 'string' || !receivedUser || typeof receivedUser.id !== 'number' || typeof receivedUser.username !== 'string') {
           throw new Error('Invalid response format from server');
      }

      setToken(receivedToken);
      setUser(receivedUser); // Set minimal user info from response
      localStorage.setItem('token', receivedToken); // Store only the token

    } catch (error: any) {
       console.error("Registration error:", error);
      // Clear any potentially stale token/user on failed registration attempt
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token'); // Remove the token from storage
    // Consider redirecting after logout in components that use useAuth().logout()
  };

  // Helper to get auth headers for API requests
  const getAuthHeaders = () => {
      if (token) { // <-- Use the 'token' state variable directly
          return { Authorization: `Bearer ${token}` };
      }
      return {}; // Return empty object if no token
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Provide token in context
        isAuthenticated: !!token, // Authenticated if token exists
        isLoading,
        login,
        register,
        logout,
        getAuthHeaders // Provide header helper
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}