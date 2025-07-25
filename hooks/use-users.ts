import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types';

export function useUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (searchTerm = '', roleFilter = 'all') => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `http://localhost:3001/api/users?`;
      if (roleFilter !== 'all') {
        url += `role=${roleFilter}&`;
      }
      if (searchTerm) {
        url += `searchTerm=${searchTerm}&`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar usuários');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, fetchUsers]);

  return { users, isLoading, error, fetchUsers };
}
