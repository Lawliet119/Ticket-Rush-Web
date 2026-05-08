import { createContext, useContext, useEffect, useState } from 'react'
import { getMeApi } from '../services/auth.api'

const AuthContext = createContext()

/**
 * AuthProvider - Manages authentication state for the entire application
 * @param {Object} props
 * @param {any} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true);
    try {
      // GUARD: Prevent unnecessary API calls to backend:
      // Check if browser has a token. If not, set user = null immediately without calling API!
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return; 
      }

      // Only call backend if token exists
      const res = await getMeApi();
      setUser(res.metadata);
    } catch (error) {
      // If token is expired or invalid (401 error), clear all stored data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('role')
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // On app startup, automatically call fetchUser to check if the user is logged in
  useEffect(() => {
    fetchUser();
  }, []); 

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication context
 * @returns {Object} { user, loading, fetchUser }
 */
export const useAuth = () => useContext(AuthContext)