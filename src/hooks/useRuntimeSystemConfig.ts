'use client';

import { useCallback, useEffect, useState } from 'react';

import systemConfigApi, { type RuntimeSystemConfig } from '@/api/systemConfig';

export function useRuntimeSystemConfig() {
  const [config, setConfig] = useState<RuntimeSystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const nextConfig = await systemConfigApi.getRuntime();
      setConfig(nextConfig);
      return nextConfig;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load runtime system config.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const nextConfig = await systemConfigApi.getRuntime();
        if (!active) return;
        setConfig(nextConfig);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load runtime system config.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return {
    config,
    loading,
    error,
    refresh,
  };
}

export default useRuntimeSystemConfig;
