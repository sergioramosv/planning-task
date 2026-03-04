'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { KomodoSnapshot, WsMessage, WsEventMessage, DashboardEvent, AgentLog, TaskDetails } from '@/lib/komodo/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const WS_URL = process.env.NEXT_PUBLIC_KOMODO_WS_URL || 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const MAX_EVENTS = 20;
const MAX_AGENT_LOGS = 200;

/** Derive phase from agent name */
const AGENT_PHASE_MAP: Record<string, KomodoSnapshot['phase']> = {
  PLANNER: 'planning',
  CODER: 'coding',
  REVIEWER: 'reviewing',
};

interface UseKomodoSocketReturn {
  snapshot: KomodoSnapshot | null;
  connected: boolean;
  events: DashboardEvent[];
  agentLogs: Record<string, AgentLog[]>;
  sendCommand: (command: 'pause' | 'stop') => void;
}

let eventCounter = 0;
let logCounter = 0;

export function useKomodoSocket(): UseKomodoSocketReturn {
  const [snapshot, setSnapshot] = useState<KomodoSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useLocalStorage<DashboardEvent[]>('komodo_events', []);
  const [agentLogs, setAgentLogs] = useLocalStorage<Record<string, AgentLog[]>>('komodo_agent_logs', {});
  const [savedTask, setSavedTask] = useLocalStorage<TaskDetails | null>('komodo_current_task', null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);

        if (msg.type === 'snapshot') {
          setSnapshot((prev) => {
            const incoming = msg.data;

            // Always derive phase from working agents if server says idle
            if (incoming.phase === 'idle') {
              const workingAgent = Object.values(incoming.agents).find(
                (a) => a.status === 'working',
              );
              if (workingAgent) {
                incoming.phase = AGENT_PHASE_MAP[workingAgent.name] ?? 'idle';
              }
            }

            // Restore taskDetails from localStorage if server doesn't provide it
            const hasWorkingAgent = Object.values(incoming.agents).some(
              (a) => a.status === 'working',
            );
            if (!incoming.taskDetails && hasWorkingAgent) {
              if (prev?.taskDetails) {
                incoming.taskDetails = prev.taskDetails;
                incoming.currentTask = incoming.currentTask ?? prev.currentTask;
              } else if (savedTask) {
                incoming.taskDetails = savedTask;
                incoming.currentTask = incoming.currentTask ?? savedTask.id;
              }
            }

            // Derive executionState from agents if server says stopped
            if ((!incoming.executionState || incoming.executionState === 'stopped') && hasWorkingAgent) {
              incoming.executionState = 'running';
            }

            // Persist taskDetails for F5 recovery
            if (incoming.taskDetails) {
              setSavedTask(incoming.taskDetails);
            } else if (!hasWorkingAgent) {
              setSavedTask(null);
            }

            return incoming;
          });
        } else if (msg.type === 'event') {
          const eventData = msg.data;

          // Handle agent:output -> accumulate in agent logs
          if (eventData.type === 'agent:output' && eventData.agentName) {
            const meta = eventData.metadata as Record<string, string>;
            const log: AgentLog = {
              id: `log-${++logCounter}`,
              timestamp: eventData.timestamp,
              kind: (meta?.kind as AgentLog['kind']) || 'text',
              content: meta?.tool || meta?.text || '',
              detail: meta?.input,
            };
            const agentName = eventData.agentName;
            setAgentLogs((prev) => {
              const current = prev[agentName] || [];
              return {
                ...prev,
                [agentName]: [...current, log].slice(-MAX_AGENT_LOGS),
              };
            });
            // Don't add agent:output to the main event timeline
            return;
          }

          // Apply incremental updates based on event type
          setSnapshot((prev) => {
            if (!prev) return prev;
            const next = applyEvent(prev, eventData);
            // Persist taskDetails changes to localStorage
            if (next.taskDetails && next.taskDetails !== prev.taskDetails) {
              setSavedTask(next.taskDetails);
            } else if (!next.taskDetails && prev.taskDetails) {
              setSavedTask(null);
            }
            return next;
          });

          // Track event in timeline
          const dashEvent = formatEvent(eventData);
          if (dashEvent) {
            setEvents((prev) => [dashEvent, ...prev].slice(0, MAX_EVENTS));
          }

          // Also feed agent logs from regular events
          const agentLogEntry = formatAgentLog(eventData);
          if (agentLogEntry) {
            const { agent, log } = agentLogEntry;
            setAgentLogs((prev) => {
              const current = prev[agent] || [];
              return {
                ...prev,
                [agent]: [...current, log].slice(-MAX_AGENT_LOGS),
              };
            });
          }
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  const sendCommand = useCallback((command: 'pause' | 'stop') => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'command', command }));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { snapshot, connected, events, agentLogs, sendCommand };
}

function applyEvent(
  prev: KomodoSnapshot,
  event: WsEventMessage['data'],
): KomodoSnapshot {
  const next = { ...prev, agents: { ...prev.agents } };

  // If any event metadata carries an explicit phase, apply it
  const eventMeta = event.metadata as Record<string, unknown> | undefined;
  if (eventMeta && typeof eventMeta.phase === 'string') {
    next.phase = eventMeta.phase as KomodoSnapshot['phase'];
  }

  switch (event.type) {
    case 'agent:state-change': {
      const name = event.agentName as keyof typeof next.agents;
      if (next.agents[name]) {
        const meta = event.metadata as Record<string, unknown>;
        next.agents[name] = {
          ...next.agents[name],
          status: (event.newState as KomodoSnapshot['agents']['PLANNER']['status']) ?? next.agents[name].status,
          ...(typeof meta.currentTask === 'string' && { currentTask: meta.currentTask }),
          ...(typeof meta.startedAt === 'string' && { startedAt: meta.startedAt }),
          ...(typeof meta.totalCost === 'number' && { totalCost: meta.totalCost }),
          ...(typeof meta.totalTurns === 'number' && { totalTurns: meta.totalTurns }),
          ...(typeof meta.completedTasks === 'number' && { completedTasks: meta.completedTasks }),
          ...(typeof meta.browserValidation === 'boolean' && { browserValidation: meta.browserValidation }),
          ...(typeof meta.cli === 'string' && { cli: meta.cli }),
          ...(typeof meta.model === 'string' && { model: meta.model }),
        };
        // Derive phase when an agent starts working
        if (event.newState === 'working' && AGENT_PHASE_MAP[name]) {
          next.phase = AGENT_PHASE_MAP[name];
        }
      }
      break;
    }
    case 'task:started': {
      const meta = event.metadata as Record<string, unknown>;
      next.currentTask = (meta.taskId as string) ?? next.currentTask;
      next.phase = 'planning';
      if (meta.taskDetails) {
        next.taskDetails = meta.taskDetails as KomodoSnapshot['taskDetails'];
      } else if (meta.title) {
        next.taskDetails = {
          id: (meta.taskId as string) ?? '',
          title: meta.title as string,
          userStory: (meta.userStory as string) ?? null,
          sprint: (meta.sprint as string) ?? null,
          devPoints: (meta.devPoints as number) ?? null,
        };
      }
      break;
    }
    case 'task:completed':
      next.tasksCompleted = prev.tasksCompleted + 1;
      // Only go idle if no agents are still working (review/merge pending)
      if (!Object.values(next.agents).some((a) => a.status === 'working')) {
        next.currentTask = null;
        next.taskDetails = null;
        next.phase = 'idle';
      }
      break;
    case 'pr:created':
      next.currentPR = (event.metadata as { prUrl?: string }).prUrl ?? next.currentPR;
      next.phase = 'coding';
      break;
    case 'pr:merged':
      next.currentPR = null;
      next.currentTask = null;
      next.taskDetails = null;
      next.phase = 'idle';
      break;
    case 'cost:updated':
      if (typeof (event.metadata as { totalCost?: number }).totalCost === 'number') {
        next.totalCost = (event.metadata as { totalCost: number }).totalCost;
      }
      break;
    case 'review:cycle:start':
      if (typeof (event.metadata as { cycle?: number }).cycle === 'number') {
        next.reviewCycle = (event.metadata as { cycle: number }).cycle;
      }
      next.phase = 'reviewing';
      break;
    case 'execution:state-change':
      if ((event.metadata as { current?: string }).current) {
        next.executionState = (event.metadata as { current: string }).current as KomodoSnapshot['executionState'];
      }
      break;
    case 'browser:check': {
      const agent = event.agentName as keyof typeof next.agents | null;
      if (agent && next.agents[agent]) {
        next.agents[agent] = {
          ...next.agents[agent],
          browserValidation: (event.metadata as { status?: string }).status === 'start',
        };
      }
      break;
    }
  }

  return next;
}

/** Maps event types to the agent they belong to when agentName is missing */
const EVENT_AGENT_MAP: Record<string, string> = {
  'task:started': 'PLANNER',
  'task:completed': 'PLANNER',
  'pr:created': 'CODER',
  'pr:merged': 'CODER',
  'review:cycle:start': 'REVIEWER',
  'review:cycle:end': 'REVIEWER',
};

function formatAgentLog(event: WsEventMessage['data']): { agent: string; log: AgentLog } | null {
  const agent = event.agentName || EVENT_AGENT_MAP[event.type];
  if (!agent) return null;

  const meta = event.metadata as Record<string, unknown>;
  let content: string;
  let kind: AgentLog['kind'] = 'status';
  let detail: string | undefined;

  switch (event.type) {
    case 'agent:state-change':
      content = `Changed to ${event.newState}`;
      break;
    case 'task:started':
      content = `Selected task: ${(meta.title as string) || (meta.taskId as string) || 'unknown'}`;
      break;
    case 'task:completed':
      content = 'Task completed';
      break;
    case 'pr:created':
      content = `PR #${meta.prNumber ?? ''} created`;
      kind = 'tool';
      detail = meta.prUrl as string | undefined;
      break;
    case 'pr:merged':
      content = 'PR merged successfully';
      break;
    case 'review:cycle:start':
      content = `Review cycle ${meta.cycle ?? ''} started`;
      break;
    case 'review:cycle:end': {
      const verdict = meta.verdict as string | undefined;
      content = `Review cycle ${meta.cycle ?? ''} — ${verdict ?? 'done'}`;
      if (verdict === 'REQUEST_CHANGES') {
        kind = 'text';
        const issues = meta.issues as string[] | undefined;
        if (issues && issues.length > 0) {
          detail = issues.slice(0, 3).join('; ');
        }
      }
      break;
    }
    case 'browser:check': {
      const errors = meta.errors as string[] | undefined;
      if (errors && errors.length > 0) {
        content = `Browser check: ${errors.length} error(s)`;
        detail = errors[0];
      } else {
        content = 'Browser check passed';
      }
      kind = 'tool';
      break;
    }
    default:
      return null;
  }

  return {
    agent,
    log: {
      id: `log-${++logCounter}`,
      timestamp: event.timestamp,
      kind,
      content,
      detail,
    },
  };
}

function formatEvent(event: WsEventMessage['data']): DashboardEvent | null {
  const meta = event.metadata as Record<string, unknown>;
  let message: string;

  switch (event.type) {
    case 'agent:state-change':
      message = `${event.agentName} changed to ${event.newState}`;
      break;
    case 'task:started':
      message = `Task ${meta.taskId ?? ''} started`;
      break;
    case 'task:completed':
      message = `Task completed`;
      break;
    case 'pr:created':
      message = `PR #${meta.prNumber ?? ''} created`;
      break;
    case 'pr:merged':
      message = `PR merged`;
      break;
    case 'cost:updated':
      message = `Cost updated: $${typeof meta.totalCost === 'number' ? meta.totalCost.toFixed(2) : '?'}`;
      break;
    case 'review:cycle:start':
      message = `Review cycle ${meta.cycle ?? ''} started`;
      break;
    case 'review:cycle:end':
      message = `Review cycle ${meta.cycle ?? ''} ended - ${meta.verdict ?? 'done'}`;
      break;
    case 'execution:state-change':
      message = `Execution state changed to ${meta.current ?? 'unknown'}`;
      break;
    case 'browser:check': {
      const url = meta.url as string | undefined;
      const errors = meta.errors as string[] | undefined;
      const status = meta.status as string | undefined;
      if (status === 'start') {
        message = `Browser check started${url ? `: ${url}` : ''}`;
      } else if (errors && errors.length > 0) {
        message = `Browser check found ${errors.length} error${errors.length > 1 ? 's' : ''}${url ? ` on ${url}` : ''}`;
      } else {
        message = `Browser check passed${url ? `: ${url}` : ''}`;
      }
      break;
    }
    default:
      message = event.type;
  }

  return {
    id: `evt-${++eventCounter}`,
    type: event.type,
    timestamp: event.timestamp,
    agentName: event.agentName,
    message,
    metadata: meta,
  };
}
