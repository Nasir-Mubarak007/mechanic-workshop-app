import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios'; // your axios with baseURL + withCredentials: true
import { useNavigate } from 'react-router-dom';
import { User } from '../types'; // Assuming you have a User type defined
// import { boolean } from 'zod';
import Spinner from '../components/common/Spinner';
// You can replace 'any' with your actual User type if you have one
export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin?: boolean; // Optional, if you have admin routes
  loading?: boolean; // Optional, if you want to handle loading state
  login: (username: string, password: string) => Promise<boolean>;
  // login: (username: string, password: string) => Promise<boolean>;
  // logout: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType| null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate(); // useNavigate hook for navigation
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, optionally check session
  useEffect(() => {
    setLoading(true)
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.status === 200) {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        console.warn('User not Authenticated')
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login'); // Redirect to login if session check fails
      }finally{
        setLoading(false)
      }
    };

    checkSession();
  }, []);
  // admin check
  const isAdmin = user ? user.role === 'admin' : undefined;
  
  // login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { username, password });
      
      if (res.status === 200) {
        const me = await api.get('/auth/me');
        setIsAuthenticated(true);
        setUser(me.data.user ?? me.data);
        navigate('/dashboard');
      }
      return false; // Login failed, e.g., wrong credentials
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        // @ts-ignore
        console.error('Login error:', err.response?.data || err.message);
      } else {
        console.error('Login error:', (err as Error).message);
      }
      return false;
    }
  };
  
  
  // logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err){
      console.error('logout error:', (err as Error).message);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login', { replace: true });
    }
  };
  

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isAdmin, loading }}>
      {loading ? <Spinner/>:  children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};