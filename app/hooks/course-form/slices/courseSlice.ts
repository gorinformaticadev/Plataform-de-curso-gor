// Slice para gerenciar o estado do curso
import { Course, Module, Lesson } from '@/app/types/course';

export interface CourseState {
  course: Course | null;
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  originalCourse: Course | null;
}

export const initialCourseState: CourseState = {
  course: null,
  isLoading: false,
  error: null,
  hasChanges: false,
  originalCourse: null,
};

// Actions
export const courseActions = {
  SET_COURSE: 'SET_COURSE',
  UPDATE_COURSE: 'UPDATE_COURSE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  MARK_CHANGES: 'MARK_CHANGES',
  RESET_CHANGES: 'RESET_CHANGES',
  ADD_MODULE: 'ADD_MODULE',
  UPDATE_MODULE: 'UPDATE_MODULE',
  DELETE_MODULE: 'DELETE_MODULE',
  ADD_LESSON: 'ADD_LESSON',
  UPDATE_LESSON: 'UPDATE_LESSON',
  DELETE_LESSON: 'DELETE_LESSON',
} as const;

// Reducer
export function courseReducer(state: CourseState, action: any): CourseState {
  switch (action.type) {
    case courseActions.SET_COURSE:
      return {
        ...state,
        course: action.payload,
        originalCourse: action.payload,
        hasChanges: false,
        error: null,
      };
      
    case courseActions.UPDATE_COURSE:
      return {
        ...state,
        course: { ...state.course, ...action.payload },
        hasChanges: true,
        error: null,
      };
      
    case courseActions.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case courseActions.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
      
    case courseActions.MARK_CHANGES:
      return { ...state, hasChanges: true };
      
    case courseActions.RESET_CHANGES:
      return {
        ...state,
        course: state.originalCourse,
        hasChanges: false,
        error: null,
      };
      
    case courseActions.ADD_MODULE:
      if (!state.course) return state;
      
      const newModule: Module = {
        id: crypto.randomUUID(),
        title: 'Novo Módulo',
        description: '',
        lessons: [],
        order: state.course.modules.length,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        course: {
          ...state.course,
          modules: [...state.course.modules, newModule],
        },
        hasChanges: true,
      };
      
    case courseActions.UPDATE_MODULE:
      if (!state.course) return state;
      
      return {
        ...state,
        course: {
          ...state.course,
          modules: state.course.modules.map(module =>
            module.id === action.payload.id
              ? { ...module, ...action.payload, updatedAt: new Date() }
              : module
          ),
        },
        hasChanges: true,
      };
      
    case courseActions.DELETE_MODULE:
      if (!state.course) return state;
      
      return {
        ...state,
        course: {
          ...state.course,
          modules: state.course.modules.filter(
            module => module.id !== action.payload
          ),
        },
        hasChanges: true,
      };
      
    case courseActions.ADD_LESSON:
      if (!state.course) return state;
      
      const { moduleId, lesson } = action.payload;
      const newLesson: Lesson = {
        id: crypto.randomUUID(),
        ...lesson,
        order: 0,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        course: {
          ...state.course,
          modules: state.course.modules.map(module =>
            module.id === moduleId
              ? {
                  ...module,
                  lessons: [...module.lessons, newLesson],
                  updatedAt: new Date(),
                }
              : module
          ),
        },
        hasChanges: true,
      };
      
    case courseActions.UPDATE_LESSON:
      if (!state.course) return state;
      
      const { moduleId: modId, lessonId, lessonData } = action.payload;
      
      return {
        ...state,
        course: {
          ...state.course,
          modules: state.course.modules.map(module =>
            module.id === modId
              ? {
                  ...module,
                  lessons: module.lessons.map(lesson =>
                    lesson.id === lessonId
                      ? { ...lesson, ...lessonData, updatedAt: new Date() }
                      : lesson
                  ),
                  updatedAt: new Date(),
                }
              : module
          ),
        },
        hasChanges: true,
      };
      
    case courseActions.DELETE_LESSON:
      if (!state.course) return state;
      
      const { moduleId: modIdDel, lessonId: lessonIdDel } = action.payload;
      
      return {
        ...state,
        course: {
          ...state.course,
          modules: state.course.modules.map(module =>
            module.id === modIdDel
              ? {
                  ...module,
                  lessons: module.lessons.filter(
                    lesson => lesson.id !== lessonIdDel
                  ),
                  updatedAt: new Date(),
                }
              : module
          ),
        },
        hasChanges: true,
      };
      
    default:
      return state;
  }
}
