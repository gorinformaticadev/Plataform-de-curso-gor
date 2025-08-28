// Teste para validar a correção do comportamento de edição de campos
// Este teste verifica se os campos mantêm os valores editados pelo usuário

import { renderHook, act } from '@testing-library/react';

// Mock do contexto de autenticação
const mockAuth = {
  token: 'test-token',
  user: { id: '1', email: 'test@test.com' }
};

// Mock da função fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock do hook de categorias
jest.mock('@/app/admin/categories/categories.service', () => ({
  useCategories: () => ({
    data: [
      { id: 'cat-1', name: 'Categoria 1' },
      { id: 'cat-2', name: 'Categoria 2' }
    ],
    isLoading: false
  })
}));

// Mock do contexto de autenticação
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuth
}));

// Mock do ImageUrlBuilder
jest.mock('@/lib/image-config', () => ({
  ImageUrlBuilder: {
    buildImageUrl: (url: string) => url,
    validateImageUrl: (url: string) => true
  }
}));

import { useCourseForm } from '../app/admin/courses/[id]/hooks/useCourseForm';

describe('useCourseForm - Correção de Edição de Campos', () => {
  const mockCourseData = {
    id: 'course-123',
    title: 'Curso Original',
    description: 'Descrição original',
    price: 99.90,
    status: 'DRAFT',
    level: 'BEGINNER',
    category: { id: 'cat-1', name: 'Categoria 1' },
    thumbnail: 'https://example.com/image.jpg',
    modules: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock da resposta da API
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCourseData)
    });
  });

  it('deve carregar os dados do curso apenas uma vez na inicialização', async () => {
    const { result } = renderHook(() => 
      useCourseForm({ 
        courseId: 'course-123',
        onSuccess: jest.fn(),
        onError: jest.fn()
      })
    );

    // Aguardar carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que fetch foi chamado apenas uma vez
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/course-123'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('deve manter valores editados sem reset automático', async () => {
    const { result } = renderHook(() => 
      useCourseForm({ 
        courseId: 'course-123',
        onSuccess: jest.fn(),
        onError: jest.fn()
      })
    );

    // Aguardar carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Simular edição de campo
    await act(async () => {
      result.current.form.setValue('title', 'Título Editado pelo Usuário');
    });

    // Aguardar para verificar se não há reset
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Verificar que o valor editado foi mantido
    expect(result.current.form.getValues('title')).toBe('Título Editado pelo Usuário');
    
    // Verificar que fetch não foi chamado novamente
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('deve resetar estado de inicialização ao mudar courseId', async () => {
    const { result, rerender } = renderHook(
      ({ courseId }) => useCourseForm({ 
        courseId,
        onSuccess: jest.fn(),
        onError: jest.fn()
      }),
      { initialProps: { courseId: 'course-123' } }
    );

    // Aguardar carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar primeira chamada
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Mudar courseId
    rerender({ courseId: 'course-456' });

    // Aguardar novo carregamento
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que fetch foi chamado novamente para o novo curso
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/courses/course-456'),
      expect.any(Object)
    );
  });

  it('deve inicializar formulário limpo para novos cursos', async () => {
    const { result } = renderHook(() => 
      useCourseForm({ 
        courseId: 'new',
        onSuccess: jest.fn(),
        onError: jest.fn()
      })
    );

    // Aguardar inicialização
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que não houve chamada para API
    expect(mockFetch).not.toHaveBeenCalled();

    // Verificar valores padrão
    const values = result.current.form.getValues();
    expect(values.title).toBe('');
    expect(values.description).toBe('');
    expect(values.price).toBe(0);
    expect(values.published).toBe(false);
  });

  it('deve preservar edições durante múltiplas interações', async () => {
    const { result } = renderHook(() => 
      useCourseForm({ 
        courseId: 'course-123',
        onSuccess: jest.fn(),
        onError: jest.fn()
      })
    );

    // Aguardar carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Simular múltiplas edições
    await act(async () => {
      result.current.form.setValue('title', 'Título 1');
    });

    await act(async () => {
      result.current.form.setValue('description', 'Descrição editada');
    });

    await act(async () => {
      result.current.form.setValue('price', 199.90);
    });

    // Aguardar para verificar estabilidade
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verificar que todos os valores foram mantidos
    const values = result.current.form.getValues();
    expect(values.title).toBe('Título 1');
    expect(values.description).toBe('Descrição editada');
    expect(values.price).toBe(199.90);

    // Verificar que apenas um carregamento ocorreu
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// Teste de performance - verificar que não há loops infinitos
describe('useCourseForm - Performance e Estabilidade', () => {
  it('deve ser estável sem re-renderizações excessivas', async () => {
    let renderCount = 0;
    
    const { result } = renderHook(() => {
      renderCount++;
      return useCourseForm({ 
        courseId: 'course-123',
        onSuccess: jest.fn(),
        onError: jest.fn()
      });
    });

    // Aguardar estabilização
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    const initialRenderCount = renderCount;

    // Simular edição
    await act(async () => {
      result.current.form.setValue('title', 'Novo Título');
    });

    // Aguardar para verificar estabilidade
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Verificar que não houve re-renderizações excessivas
    // Permitir alguma margem para re-renders normais do React Hook Form
    expect(renderCount - initialRenderCount).toBeLessThan(5);
  });
});