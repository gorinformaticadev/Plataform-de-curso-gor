# TODO - Fase 3: Componentes Reutilizáveis

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

## 🔄 Em Progresso
- [ ] **Fase 4**: Integração dos novos componentes
- [ ] Refatorar CourseModulesManager principal
- [x] **Correção de Bug**: Adicionado endpoint `/api/modules/:id/lessons` que estava faltando
- [ ] Testar funcionalidades de CRUD

## 📋 Próximos Passos

### 1. Atualizar Componentes de Módulos
- [ ] Atualizar `CourseModulesManager.tsx` para usar novo hook
- [ ] Atualizar `module-create-form.tsx` para novo schema
- [ ] Atualizar `module-edit-form.tsx` para novo schema

### 2. Atualizar Componentes de Aulas
- [ ] Atualizar `LessonManager.tsx` para usar novo hook
- [ ] Atualizar `lesson-create-form.tsx` para novo schema
- [ ] Atualizar `lesson-edit-form.tsx` para novo schema

### 3. Integração com API
- [ ] Atualizar endpoints de módulos
- [ ] Atualizar endpoints de aulas
- [ ] Implementar tratamento de erros

### 4. Testes e Validação
- [ ] Testar criação de módulos
- [ ] Testar edição de módulos
- [ ] Testar exclusão de módulos
- [ ] Testar criação de aulas
- [ ] Testar edição de aulas
- [ ] Testar exclusão de aulas
- [ ] Testar reordenação

### 5. Documentação
- [ ] Atualizar REFATORACAO_COURSE_MODULES.md
- [ ] Documentar novos hooks
- [ ] Documentar mudanças de API
