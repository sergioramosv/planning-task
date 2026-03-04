'use client';

import { useKomodoSocket } from '@/hooks/komodo/useKomodoSocket';
import { useAgentStates } from '@/hooks/komodo/useAgentStates';
import { useOfficeFeedback } from '@/hooks/komodo/useOfficeFeedback';
import { ConnectionStatus } from '@/components/komodo/ConnectionStatus';
import { ExecutionControls } from '@/components/komodo/ExecutionControls';
import dynamic from 'next/dynamic';
import type { Phase, DashboardEvent, AgentLog, AgentName } from '@/lib/komodo/types';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { TaskService } from '@/lib/services/task.service';
import { UserService } from '@/lib/services/user.service';
import { Task } from '@/types';

const OfficeScene3D = dynamic(
  () => import('@/components/komodo/OfficeScene3D').then((mod) => mod.OfficeScene3D),
  { ssr: false },
);

/* ── Phase config ── */

const PHASE_CONFIG: Record<Phase, { icon: string; label: string; colorClass: string }> = {
  idle: { icon: '\u25CB', label: 'Idle', colorClass: '' },
  planning: { icon: '\u270E', label: 'Planning', colorClass: 'colorPlanning' },
  coding: { icon: '\u2328', label: 'Coding', colorClass: 'colorCoding' },
  reviewing: { icon: '\u2298', label: 'Reviewing', colorClass: 'colorReviewing' },
  merging: { icon: '\u21E2', label: 'Merging', colorClass: 'colorMerging' },
};

const PHASE_ORDER: Phase[] = ['planning', 'coding', 'reviewing', 'merging'];

/* ── Agent color classes ── */

const AGENT_COLOR: Record<AgentName, string> = {
  PLANNER: 'colorPlanning',
  CODER: 'colorCoding',
  REVIEWER: 'colorReviewing',
};

/* ── Event type color classes ── */

const EVENT_CLASS: Record<string, string> = {
  'agent:state-change': 'evtAgentState',
  'task:started': 'evtTaskStarted',
  'task:completed': 'evtTaskCompleted',
  'pr:created': 'evtPrCreated',
  'pr:merged': 'evtPrMerged',
  'cost:updated': 'evtCostUpdated',
  'review:cycle:start': 'evtReviewStart',
  'review:cycle:end': 'evtReviewEnd',
  'execution:state-change': 'evtExecState',
  'browser:check': 'evtBrowserCheck',
};

const MAX_VISIBLE_LOGS = 5;

/* ── Page ── */

export default function KomodoDashboardPage() {
  const { snapshot, connected, events, agentLogs, sendCommand } = useKomodoSocket();
  const agentStates = useAgentStates(snapshot, connected);
  useOfficeFeedback(events, snapshot);
  const [task, setTask] = useState<Task | null>(null);
  const [developerName, setDeveloperName] = useState<string | null>(null);
  const taskId = snapshot?.taskDetails?.id ?? null;

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      setDeveloperName(null);
      return;
    }
    TaskService.getTaskById(taskId).then((t) => {
      setTask(t);
      if (t?.developer) {
        UserService.getUserById(t.developer)
          .then((u) => setDeveloperName(u.displayName ?? u.email ?? null))
          .catch(() => setDeveloperName(null));
      } else {
        setDeveloperName(null);
      }
    }).catch(() => {
      setTask(null);
      setDeveloperName(null);
    });
  }, [taskId]);
  return (
    <div className={styles.container}>
      {!snapshot ? (
        <p className={styles.waiting}>Waiting for orchestrator connection...</p>
      ) : (
        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            {/* Current Task Card */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Current Task</h2>
              {task ? (
                <div className={styles.taskContent}>
                  <p className={styles.taskName}>{task.title}</p>
                  {task.userStory && (
                    <p className={styles.taskStory}>
                      Como {task.userStory.who}, quiero {task.userStory.what}, para {task.userStory.why}
                    </p>
                  )}
                  <div className={styles.taskMeta}>
                    {developerName && <span className={styles.metaBadge}>{developerName}</span>}
                    {task.devPoints && <span className={styles.metaBadge}>{task.devPoints} dev pts</span>}
                    {task.bizPoints && <span className={styles.metaBadge}>{task.bizPoints} biz pts</span>}
                    {task.status && <span className={styles.metaBadge}>{task.status}</span>}
                    {task.developer && <span className={styles.metaBadge}>{developerName}</span>}
                  </div>
                </div>
              ) : snapshot?.taskDetails?.title ? (
                <div className={styles.taskContent}>
                  <p className={styles.taskName}>{snapshot.taskDetails.title}</p>
                  {snapshot.taskDetails.userStory && (
                    <p className={styles.taskStory}>{snapshot.taskDetails.userStory}</p>
                  )}
                  {snapshot.taskDetails.devPoints && (
                    <div className={styles.taskMeta}>
                      <span className={styles.metaBadge}>{snapshot.taskDetails.devPoints} dev pts</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className={styles.noTask}>No task running</p>
              )}
            </section>

            {/* Execution Controls */}
            <ExecutionControls
              executionState={snapshot.executionState ?? 'stopped'}
              phase={snapshot.phase}
              connected={connected}
              onPause={() => sendCommand('pause')}
              onStop={() => sendCommand('stop')}
            />

            {/* Phase Indicator */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Phase</h2>
              {snapshot.phase === 'idle' ? (
                <div className={styles.phaseIdle}>
                  <span className={styles.phaseIdleIcon}>{'\u25CB'}</span>
                  <span className={styles.phaseIdleText}>Idle — waiting for next task</span>
                </div>
              ) : (
                <div className={styles.phaseSteps}>
                  {PHASE_ORDER.map((phase, i) => {
                    const cfg = PHASE_CONFIG[phase];
                    const isActive = snapshot.phase === phase;
                    const isPast = PHASE_ORDER.indexOf(snapshot.phase as Phase) > i;

                    return (
                      <div key={phase} className={styles.phaseStep}>
                        {i > 0 && (
                          <div
                            className={`${styles.phaseConnector} ${
                              isPast ? styles.phaseConnectorDone : styles.phaseConnectorPending
                            }`}
                          />
                        )}
                        <div
                          className={`${styles.phasePill} ${
                            isActive
                              ? `${styles.phasePillActive} ${styles[cfg.colorClass]}`
                              : isPast
                                ? styles.phasePillDone
                                : styles.phasePillPending
                          }`}
                        >
                          <span className={styles.phaseIcon}>
                            {isActive ? cfg.icon : isPast ? '\u2713' : cfg.icon}
                          </span>
                          {cfg.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Agent Activity Feed */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Agent Activity</h2>
              <div className={styles.agentActivityGrid}>
                {(['PLANNER', 'CODER', 'REVIEWER'] as AgentName[]).map((name) => {
                  const agent = snapshot.agents[name];
                  const logs = agentLogs[name] || [];
                  const recentLogs = logs.slice(-MAX_VISIBLE_LOGS).reverse();
                  const colorClass = AGENT_COLOR[name];

                  const dotClass =
                    agent.status === 'working'
                      ? styles.dotWorking
                      : agent.status === 'walking'
                        ? styles.dotWalking
                        : agent.status === 'done'
                          ? styles.dotDone
                          : styles.dotIdle;

                  const badgeClass =
                    agent.status === 'working'
                      ? styles.statusWorking
                      : agent.status === 'done'
                        ? styles.statusDone
                        : styles.statusDefault;

                  return (
                    <div key={name} className={styles.activityCard}>
                      <div className={styles.agentHeader}>
                        <span className={`${styles.agentDot} ${dotClass}`} />
                        <h3 className={`${styles.agentName} ${styles[colorClass]}`}>{name}</h3>
                        <span className={`${styles.statusBadge} ${badgeClass}`}>
                          {agent.status}
                        </span>
                      </div>

                      {agent.currentTask && (
                        <p className={styles.agentTask}>{agent.currentTask}</p>
                      )}

                      {recentLogs.length > 0 ? (
                        <div className={styles.logList}>
                          {recentLogs.slice(0, 1).map((log) => (
                            <LogEntry key={log.id} log={log} />
                          ))}
                        </div>
                      ) : (
                        <p className={styles.noLogs}>
                          {agent.status === 'idle' ? 'Waiting...' : 'No activity yet'}
                        </p>
                      )}

                      {agent.startedAt && (
                        <p className={styles.agentTime}>
                          Since {new Date(agent.startedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className={styles.sceneColumn}>
            <div className={styles.sceneOverlay}>
              <h2 className={styles.sceneTitle}>Komodo Office Inc.</h2>
              {snapshot.reviewCycle > 0 && (
                <span className={styles.reviewCycleBadge}>
                  Review Cycle {snapshot.reviewCycle}
                </span>
              )}
            </div>
            <OfficeScene3D agents={agentStates.agents} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Log Entry Component ── */

function LogEntry({ log }: { log: AgentLog }) {
  const time = new Date(log.timestamp).toLocaleTimeString();

  if (log.kind === 'tool') {
    return (
      <div className={styles.logEntry}>
        <span className={styles.logTime}>{time}</span>
        <span className={styles.logTool}>{log.content}</span>
        {log.detail && <span className={styles.logDetail}>{log.detail}</span>}
      </div>
    );
  }

  if (log.kind === 'status') {
    return (
      <div className={styles.logEntry}>
        <span className={styles.logTime}>{time}</span>
        <span className={styles.logStatus}>{log.content}</span>
      </div>
    );
  }

  return (
    <div className={styles.logEntry}>
      <span className={styles.logTime}>{time}</span>
      <span className={styles.logText}>{log.content}</span>
    </div>
  );
}

/* ── Event Row Component ── */

function EventRow({ event }: { event: DashboardEvent }) {
  const time = event.timestamp
    ? new Date(event.timestamp).toLocaleTimeString()
    : '--:--:--';

  const colorClass = EVENT_CLASS[event.type] ?? 'evtDefault';
  const isBrowserCheck = event.type === 'browser:check';
  const screenshot = isBrowserCheck ? (event.metadata?.screenshot as string | undefined) : undefined;
  const errors = isBrowserCheck ? (event.metadata?.errors as string[] | undefined) : undefined;

  return (
    <div className={styles.eventRow}>
      <div className={styles.eventMain}>
        <span className={styles.eventTime}>{time}</span>
        {event.agentName && (
          <span className={`${styles.eventAgent} ${styles[colorClass]}`}>{event.agentName}</span>
        )}
        <span className={styles.eventMessage}>{event.message}</span>
      </div>
      {errors && errors.length > 0 && (
        <div className={styles.browserErrors}>
          {errors.slice(0, 5).map((err, i) => (
            <p key={i} className={styles.browserError}>{err}</p>
          ))}
          {errors.length > 5 && (
            <p className={styles.browserMore}>+{errors.length - 5} more</p>
          )}
        </div>
      )}
      {screenshot && (
        <a
          href={screenshot}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.browserScreenshot}
        >
          <img src={screenshot} alt="Browser screenshot" className={styles.screenshotImg} />
        </a>
      )}
    </div>
  );
}
