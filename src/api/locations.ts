import apiClient from './client';

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ProvinceOption {
  id: number;
  name: string;
  code: string;
  canUpdateCod: boolean;
  status: number | null;
}

export interface DistrictOption {
  id: number;
  provinceId: number;
  name: string;
  code: string;
  type: string;
  supportType: number;
  canUpdateCod: boolean;
  status: number | null;
}

export interface WardOption {
  code: string;
  districtId: number;
  name: string;
  supportType: number;
  canUpdateCod: boolean;
  status: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid locations response.');
  }

  const envelope = payload as BackendEnvelope<T[]>;
  if (Array.isArray(envelope.data)) {
    return envelope.data;
  }

  throw new Error('Invalid locations response shape.');
}

export const locationApi = {
  getProvinces: async (): Promise<ProvinceOption[]> => {
    const response = await apiClient.get('/api/locations/provinces');
    return extractList<ProvinceOption>(response.data);
  },

  getDistricts: async (provinceId: number): Promise<DistrictOption[]> => {
    const response = await apiClient.get('/api/locations/districts', {
      params: { provinceId }
    });
    return extractList<DistrictOption>(response.data);
  },

  getWards: async (districtId: number): Promise<WardOption[]> => {
    const response = await apiClient.get('/api/locations/wards', {
      params: { districtId }
    });
    return extractList<WardOption>(response.data);
  }
};

export default locationApi;
