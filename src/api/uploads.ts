import apiClient from './client';

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

export const uploadApi = {
  uploadFile: async (
    file: File,
    options?: { folder?: string }
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    const { data } = await apiClient.post<BackendEnvelope<UploadResult>>(
      '/api/uploads',
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
  },
};

export default uploadApi;
