import { useState } from 'react';
import { validateCpf } from '@/lib/cpfValidator';

export type UserFormData = {
  name: string;
  email: string;
  cpf: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  password?: string;
};

const initialFormData: Partial<UserFormData> = {
  name: '',
  email: '',
  cpf: '',
  role: 'STUDENT',
  password: '',
};

export function useUserForm(initialData: Partial<UserFormData> = initialFormData) {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (isCreating: boolean = false) => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "Nome é obrigatório.";
    if (!formData.email?.trim()) {
      errors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido.";
    }
    if (formData.cpf && !validateCpf(formData.cpf)) errors.cpf = "CPF inválido.";
    if (!formData.role) errors.role = "Função é obrigatória.";

    if (isCreating) {
      if (!formData.password) {
        errors.password = "Senha é obrigatória.";
      } else if (formData.password.length < 6) {
        errors.password = "A senha deve ter no mínimo 6 caracteres.";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  }

  return { formData, formErrors, setFormData, handleFormChange, validateForm, resetForm };
}