import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../components/index';

const figmaApi = axios.create({
  baseURL: 'https://api.figma.com/v1',
});

figmaApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('figma_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface FigmaFile {
  key: string;
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
}

const figmaService = {
  async getUserInfo(): Promise<User> {
    const { data } = await figmaApi.get('/me');
    return data;
  },

  async getUserFiles(): Promise<FigmaFile[]> {
    const { data } = await figmaApi.get('/me');
    return data.files || [];
  },

  async getFileDetails(fileKey: string) {
    const { data } = await figmaApi.get(`/files/${fileKey}`);
    return data;
  },

  async getFileVersions(fileKey: string) {
    const { data } = await figmaApi.get(`/files/${fileKey}/versions`);
    return data.versions;
  }
};

export default figmaService;