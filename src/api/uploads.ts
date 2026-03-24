import apiClient from './client';
import axios from 'axios';

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface UploadResult {
  path: string;
  url: string;
  contentType?: string;
  size?: number;
}

const normalizedApiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ''
)
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

const uploadEndpoint = normalizedApiBaseUrl
  ? `${normalizedApiBaseUrl}/api/uploads`
  : null;

export const uploadApi = {
  uploadFile: async (
    file: File,
    options?: { folder?: string }
  ): Promise<UploadResult> => {
    if (!uploadEndpoint) {
      throw new Error(
        'Direct upload endpoint is not configured. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL.'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    try {
      const { data } = await apiClient.post<BackendEnvelope<UploadResult>>(
        uploadEndpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const payload =
        (data as BackendEnvelope<UploadResult>)?.data ||
        (data as unknown as UploadResult);

      if (!payload?.url) {
        throw new Error('Upload response is missing file URL');
      }

      return payload;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 413) {
        throw new Error(
          'Upload request was rejected before reaching backend. This usually happens when the frontend proxy blocks multipart upload.'
        );
      }
      throw error;
    }
  },
};

export default uploadApi;
