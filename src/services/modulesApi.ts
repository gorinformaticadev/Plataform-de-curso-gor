import axios from 'axios';
import { Module, Lesson } from '../types/courseModules';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ModulesApiService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Métodos para módulos
  async createModule(courseId: string, moduleData: Partial<Module>): Promise<Module> {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/modules`,
      moduleData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    return response.data;
  }

  async updateModule(courseId: string, moduleId: string, moduleData: Partial<Module>): Promise<Module> {
    const response = await axios.put(
      `${API_URL}/courses/${courseId}/modules/${moduleId}`,
      moduleData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    return response.data;
  }

  async deleteModule(courseId: string, moduleId: string): Promise<void> {
    await axios.delete(
      `${API_URL}/courses/${courseId}/modules/${moduleId}`,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
  }

  // Métodos para aulas
  async createLesson(courseId: string, moduleId: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/modules/${moduleId}/lessons`,
      lessonData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    return response.data;
  }

  async updateLesson(courseId: string, moduleId: string, lessonId: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    const response = await axios.put(
      `${API_URL}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      lessonData,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
    return response.data;
  }

  async deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    await axios.delete(
      `${API_URL}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      {
        headers: { Authorization: `Bearer ${this.token}` }
      }
    );
  }

  // Upload de arquivos
  async uploadVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await axios.post(
      `${API_URL}/upload/video`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data.url;
  }

  async uploadThumbnail(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(
      `${API_URL}/upload/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data.url;
  }
}

export default ModulesApiService;
