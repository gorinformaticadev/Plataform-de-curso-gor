'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useRenderMonitor } from '@/components/RenderMonitor';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, cpf: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Monitor de renders para detectar problemas de performance (silencioso)
  const renderMonitor = useRenderMonitor('AuthProvider', {
    maxRenders: 30,
    timeWindow: 10000,
    onExcessiveRenders: (stats) => {
      // Apenas log interno, sem notificações
      console.error('[AuthProvider] Re-renders excessivos detectados:', stats);
    }
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Memoização da URL da API para evitar re-criação de funções
  const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api', []);
  
  // Ref para controlar se já há uma verificação em andamento
  const isCheckingRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Proteção contra múltiplas verificações simultâneas
    if (isCheckingRef.current) {
      console.log('[AuthContext] Verificação já em andamento, ignorando...');
      return;
    }
    
    isCheckingRef.current = true;
    console.log('[AuthContext] Iniciando verificação de autenticação...');
    
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      // Apenas atualiza token se for diferente do atual
      if (token !== storedToken) {
        setToken(storedToken);
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Erro na verificação de auth:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
      isCheckingRef.current = false;
    }
  }, [API_URL, token]); // Adicionando token como dependência para evitar loops

  // useEffect deve vir APÓS a declaração do checkAuth e executa apenas uma vez na montagem
  useEffect(() => {
    checkAuth();
  }, []); // Array vazio para executar apenas na montagem

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      toast.success(`Bem-vindo de volta, ${data.user.name}!`);

      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
      throw error;
    }
  }, [router, API_URL]);

  const register = useCallback(async (name: string, email: string, cpf: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, cpf, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar conta');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      toast.success(`Bem-vindo, ${data.user.name}!`);

      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
      throw error;
    }
  }, [router, API_URL]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/');
    
    toast.success('Você foi desconectado com sucesso.');
  }, [router]);

  // Versão segura do reloadUser com proteção adicional
  const reloadUser = useCallback(async () => {
    // Múltiplas proteções para evitar execuções desnecessárias
    if (!token || loading || isCheckingRef.current) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Só fazer logout se o token estiver realmente inválido
        if (response.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao recarregar usuário:', error);
      // Não fazer logout em caso de erro de rede
    }
  }, [token, loading, API_URL]); // Removido isCheckingRef das dependências

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    reloadUser,
  }), [user, token, loading, login, register, logout, reloadUser]);

  return (
    <AuthContext.Provider value={value}>
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
