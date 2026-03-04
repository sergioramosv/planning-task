'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { database } from '@/lib/firebase/config';
import { ref, onValue, push, update, remove } from 'firebase/database';
import type { KomodoNotification, NotificationType, WsMessage } from '@/lib/komodo/types';

const WS_URL = process.env.NEXT_PUBLIC_KOMODO_WS_URL || 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const DB_PATH = 'komodoNotifications';

export interface KomodoNotificationsState {
  notifications: KomodoNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const defaultState: KomodoNotificationsState = {
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
};

export const KomodoNotificationsContext = createContext<KomodoNotificationsState>(defaultState);

export function useKomodoNotifications(): KomodoNotificationsState {
  return useContext(KomodoNotificationsContext);
}

export function useKomodoNotificationsProvider(): KomodoNotificationsState {
  const [notifications, setNotifications] = useState<KomodoNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen to Firebase for persisted notifications
  useEffect(() => {
    const dbRef = ref(database, DB_PATH);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: KomodoNotification[] = Object.entries(data)
            .map(([key, value]) => ({
              ...(value as Omit<KomodoNotification, 'id'>),
              id: key,
            }))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(list);
        } else {
          setNotifications([]);
        }
      },
      () => {
        // Firebase error — keep current state
      },
    );

    return () => unsubscribe();
  }, []);

  // Add notification: write to Firebase (onValue listener will update local state)
  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string) => {
      const notif: Omit<KomodoNotification, 'id'> = {
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      };
      push(ref(database, DB_PATH), notif).catch(() => {});
    },
    [],
  );

  const markRead = useCallback((id: string) => {
    update(ref(database, `${DB_PATH}/${id}`), { read: true }).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    if (notifications.length === 0) return;
    const updates: Record<string, boolean> = {};
    for (const n of notifications) {
      if (!n.read) {
        updates[`${DB_PATH}/${n.id}/read`] = true;
      }
    }
    if (Object.keys(updates).length > 0) {
      update(ref(database), updates).catch(() => {});
    }
  }, [notifications]);

  const clearAll = useCallback(() => {
    remove(ref(database, DB_PATH)).catch(() => {});
  }, []);

  // WebSocket connection for notification events
  useEffect(() => {
    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          if (msg.type !== 'event') return;

          const evt = msg.data;
          const meta = evt.metadata as Record<string, unknown>;

          switch (evt.type) {
            case 'task:completed':
              addNotification('success', 'Task completed', 'A task has been completed successfully');
              break;

            case 'pr:merged':
              addNotification('success', 'PR merged', 'Pull request has been merged successfully');
              break;

            case 'pr:created': {
              const prNum = meta.prNumber;
              addNotification('info', 'PR created', `Pull request #${prNum ?? ''} has been created`);
              break;
            }

            case 'agent:state-change': {
              const newState = evt.newState;
              if (newState === 'error' || newState === 'failed') {
                addNotification(
                  'error',
                  'Agent error',
                  `${evt.agentName ?? 'Agent'} has encountered an error`,
                );
              }
              break;
            }

            case 'review:cycle:end': {
              const verdict = meta.verdict as string | undefined;
              if (verdict === 'REQUEST_CHANGES') {
                addNotification(
                  'warning',
                  'Changes requested',
                  `Review cycle ${meta.cycle ?? ''} - changes have been requested`,
                );
              }
              break;
            }
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, clearAll };
}
