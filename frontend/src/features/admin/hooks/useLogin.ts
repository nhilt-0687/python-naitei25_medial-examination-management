import { useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { login, LoginRequest } from '../services/authService';

interface DecodedToken {
  role: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [role, setRole] = useState<string | null>(
    () => localStorage.getItem('role')
  );

  const handleLogin = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await login(credentials);
      setToken(token);
      localStorage.setItem('token', token);

      const decoded = jwtDecode<DecodedToken>(token);
      setRole(decoded.role);
      localStorage.setItem('role', decoded.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error, token, role };
};
