import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types';

interface PaginationState {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (
      searchTerm = '',
      roleFilter = 'all',
      page = 1,
      pageSize = 10,
    ) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          searchTerm,
          role: roleFilter,
          page: String(page),
          pageSize: String(pageSize),
        });

        if (roleFilter === 'all') {
          params.delete('role');
        }

        const url = `http://localhost:3001/api/users?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar usuários');
        }
        const data = await response.json();
        setUsers(data.data);
        setPagination({
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  return { users, pagination, isLoading, error, fetchUsers };
}
