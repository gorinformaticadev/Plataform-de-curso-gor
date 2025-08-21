# TODO - Refatoração de Course Modules (Atualizado)

## ✅ Concluído
- [x] Análise inicial dos arquivos de refatoração
- [x] Leitura dos hooks de gerenciamento (useModuleManager, useLessonManager)
- [x] Identificação dos componentes que precisam ser atualizados
- [x] **Fase 3 Completa**: Criação dos componentes reutilizáveis
  - [x] ModuleCard.tsx - Card para exibir módulos
  - [x] LessonCard.tsx - Card para exibir aulas
  - [x] ModuleForm.tsx - Formulário de módulos (completo + compacto)
  - [x] LessonForm.tsx - Formulário de aulas (completo + compacto)
  - [x] ContentPreview.tsx - Preview de conteúdos + lista
  - [x] index.ts - Arquivo de exportações
- [x] **Fase 4 Completa**: Integração dos novos componentes
  - [x] CourseModulesManagerRefactored.tsx - Versão refatorada do componente principal
  - [x] Integração com hooks customizados
  - [x] Uso dos novos componentes reutilizáveis
  - [x] Atualização do index.ts com exportações
- [x] **Correção de Bug**: Adicionado endpoint `/api/modules/:id/lessons` que estava faltando
- [x] **Refatoração de Componentes Existentes**:
  - [x] ModuleList.tsx - Atualizado com SVG inline e tratamento de ID
  - [x] ModuleForm.tsx - Refatorado com validações e melhorias

## 🔄 Em Progresso
- [ ] Testar funcionalidades de CRUD
- [ ] Substituir componente original pelo refatorado

## 📋 Próximos Passos

### 1. Testes e Validação
- [ ] Testar criação de módulos
- [ ] Testar edição de módulos
- [ ] Testar exclusão de módulos
- [ ] Testar criação de aulas
- [ ] Testar edição de aulas
- [ ] Testar exclusão de aulas
- [ ] Testar reordenação

### 2. Substituição do Componente Original
- [ ] Backup do componente original
- [ ] Substituir CourseModulesManager.tsx pelo refatorado
- [ ] Atualizar importações nos arquivos que usam o componente
- [ ] Testar integração completa

### 3. Documentação Final
- [ ] Atualizar REFATORACAO_COURSE_MODULES.md
- [ ] Documentar novos hooks
- [ ] Documentar mudanças de API
- [ ] Criar guia de migração

## 🎯 Arquivos Criados/Modificados

### Componentes Criados
- `components/admin/CourseModulesManager/ModuleCard.tsx`
- `components/admin/CourseModulesManager/LessonCard.tsx`
- `components/admin/CourseModulesManager/ModuleForm.tsx`
- `components/admin/CourseModulesManager/LessonForm.tsx`
- `components/admin/CourseModulesManager/ContentPreview.tsx`
- `components/admin/CourseModulesManager/CourseModulesManagerRefactored.tsx`
- `components/admin/CourseModulesManager/index.ts`

### Componentes Atualizados
- `src/components/modules/ModuleList.tsx` - SVG inline + tratamento de ID
- `src/components/modules/ModuleForm.tsx` - Refatorado com validações

### API Modificada
- `api/src/courses/modules.controller.ts` - Adicionado endpoint para buscar aulas
- `api/src/courses/lessons.service.ts` - Adicionado método findByModule

### Hooks Existentes (Fase 2)
- `app/hooks/course-modules/useModuleManager.ts`
- `app/hooks/course-modules/useLessonManager.ts`
- `app/hooks/course-modules/useDragAndDrop.ts`
- `app/hooks/course-modules/useFileUpload.ts`

### Tipos e Schemas (Fase 1)
- `app/types/course.ts`
- `app/schemas/course.ts`
