import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

// 1. Create the context (like a global storage box)
const AuthContext = createContext();

// 2. AuthProvider wraps your whole app so every page can access user info
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);  // Logged in user object
  const [loading, setLoading] = useState(true);  // True while checking if already logged in

  // On app start: check if a token exists in localStorage
  // If yes, fetch the user data from backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token')) // Token invalid → remove it
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // No token → not logged in
    }
  }, []);

  // Called after login/register — saves token and sets user
  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Called on logout — clears everything
  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook — makes it easy to use auth in any component
// Usage: const { user, loginUser, logoutUser } = useAuth();
export const useAuth = () => useContext(AuthContext);
