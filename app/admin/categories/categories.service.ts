"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  coursesCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useCategories() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get<Category[]>(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  
  return useMutation({
    mutationFn: (newCategory: {
      name: string;
      slug: string;
      description: string;
      icon: string;
      isActive: boolean
    }) => {
      return axios.post(`${API_URL}/categories`, newCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  
  return useMutation({
    mutationFn: ({ id, ...updates }: {
      id: string;
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      isActive?: boolean
    }) => {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.groupCollapsed('[Categories] Atualizando categoria');
        console.log('ID:', id);
        console.log('Alterações:', {
          name: updates.name,
          isActive: updates.isActive,
          icon: updates.icon
        });
        console.groupEnd();
      }
      return axios.patch(`${API_URL}/categories/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      return axios.patch(`${API_URL}/categories/${id}`, { isActive: !isActive }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  
  return useMutation({
    mutationFn: (id: string) => {
      return axios.delete(`${API_URL}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
