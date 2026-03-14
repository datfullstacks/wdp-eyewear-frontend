'use client';

import { useEffect, useRef } from 'react';
import { getSession } from 'next-auth/react';

import {
  buildRealtimeUrl,
  isStatusRealtimeEvent,
  type StatusRealtimeDomain,
  type StatusRealtimeEvent,
} from '@/lib/realtime';

interface UseStatusRealtimeOptions {
  domains?: StatusRealtimeDomain[];
  enabled?: boolean;
  onEvent: (event: StatusRealtimeEvent) => void;
}

interface UseStatusRealtimeReloadOptions {
  domains?: StatusRealtimeDomain[];
  enabled?: boolean;
  delayMs?: number;
  reload: () => void | Promise<void>;
}

const DEFAULT_RECONNECT_DELAY_MS = 2000;

export function useStatusRealtime({
  domains,
  enabled = true,
  onEvent,
}: UseStatusRealtimeOptions) {
  const onEventRef = useRef(onEvent);
  const domainsRef = useRef(domains || []);

  onEventRef.current = onEvent;
  domainsRef.current = domains || [];

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let isDisposed = false;

    const connect = async () => {
      try {
        const session = await getSession();
        const token = String((session as { accessToken?: string } | null)?.accessToken || '');
        const socketUrl = buildRealtimeUrl(token);

        if (!socketUrl || isDisposed) {
          return;
        }

        socket = new WebSocket(socketUrl);

        socket.onmessage = (messageEvent) => {
          try {
            const payload = JSON.parse(String(messageEvent.data || ''));
            if (!isStatusRealtimeEvent(payload)) {
              return;
            }

            const requestedDomains = domainsRef.current;
            if (
              requestedDomains.length > 0 &&
              !requestedDomains.includes(payload.domain as StatusRealtimeDomain)
            ) {
              return;
            }

            onEventRef.current(payload);
          } catch {
            // Ignore malformed realtime payloads.
          }
        };

        socket.onclose = () => {
          if (isDisposed) {
            return;
          }

          reconnectTimer = window.setTimeout(() => {
            void connect();
          }, DEFAULT_RECONNECT_DELAY_MS);
        };
      } catch {
        if (isDisposed) {
          return;
        }

        reconnectTimer = window.setTimeout(() => {
          void connect();
        }, DEFAULT_RECONNECT_DELAY_MS);
      }
    };

    void connect();

    return () => {
      isDisposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [enabled]);
}

export function useStatusRealtimeReload({
  domains,
  enabled = true,
  delayMs = 300,
  reload,
}: UseStatusRealtimeReloadOptions) {
  const reloadRef = useRef(reload);
  const timerRef = useRef<number | null>(null);

  reloadRef.current = reload;

  useStatusRealtime({
    domains,
    enabled,
    onEvent: () => {
      if (timerRef.current !== null) {
        return;
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void reloadRef.current();
      }, delayMs);
    },
  });

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );
}
