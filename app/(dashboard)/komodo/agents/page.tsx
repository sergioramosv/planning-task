'use client';

import { useState, useRef, useEffect } from 'react';
import { useKomodoSocket } from '@/hooks/komodo/useKomodoSocket';
import { ConnectionStatus } from '@/components/komodo/ConnectionStatus';
import type { AgentName, AgentStatus, AgentLog, Phase } from '@/lib/komodo/types';
import styles from './page.module.css';

/* ── Agent config ── */

const AGENT_NAMES: AgentName[] = ['PLANNER', 'CODER', 'REVIEWER'];

const AGENT_ICON_CHAR: Record<AgentName, string> = {
  PLANNER: '✎',
  CODER: '⌨',
  REVIEWER: '⊘',
};

const PHASE_TO_AGENT: Record<Phase, AgentName | null> = {
  idle: null,
  planning: 'PLANNER',
  coding: 'CODER',
  reviewing: 'REVIEWER',
  merging: null,
};

const AGENT_ICON_STYLE: Record<AgentName, string> = {
  PLANNER: 'iconPlanner',
  CODER: 'iconCoder',
  REVIEWER: 'iconReviewer',
};

const AGENT_SELECTED_STYLE: Record<AgentName, string> = {
  PLANNER: 'selectedPlanner',
  CODER: 'selectedCoder',
  REVIEWER: 'selectedReviewer',
};

const AGENT_ACTIVE_STYLE: Record<AgentName, string> = {
  PLANNER: 'activePlanner',
  CODER: 'activeCoder',
  REVIEWER: 'activeReviewer',
};

const AGENT_NAME_STYLE: Record<AgentName, string> = {
  PLANNER: 'namePlanner',
  CODER: 'nameCoder',
  REVIEWER: 'nameReviewer',
};

const AGENT_DETAIL_STYLE: Record<AgentName, string> = {
  PLANNER: 'detailPlanner',
  CODER: 'detailCoder',
  REVIEWER: 'detailReviewer',
};

const AGENT_TAB_STYLE: Record<AgentName, string> = {
  PLANNER: 'tabActivePlanner',
  CODER: 'tabActiveCoder',
  REVIEWER: 'tabActiveReviewer',
};

const MODEL_BADGE_MAP: Record<string, { label: string; style: string }> = {
  claude: { label: 'Claude', style: 'modelClaude' },
  sonnet: { label: 'Sonnet', style: 'modelSonnet' },
  opus: { label: 'Opus', style: 'modelOpus' },
  haiku: { label: 'Haiku', style: 'modelHaiku' },
  codex: { label: 'Codex', style: 'modelCodex' },
  gemini: { label: 'Gemini', style: 'modelGemini' },
};

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: 'dotIdle',
  walking: 'dotWalking',
  working: 'dotWorking',
  done: 'dotDone',
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: 'labelIdle',
  walking: 'labelWalking',
  working: 'labelWorking',
  done: 'labelDone',
};

const STATUS_BADGE_STYLE: Record<AgentStatus, string> = {
  idle: 'statusBadgeIdle',
  walking: 'statusBadgeWalking',
  working: 'statusBadgeWorking',
  done: 'statusBadgeDone',
};

/* ── Helpers ── */

function getElapsedTime(startedAt: string | null): string {
  if (!startedAt) return '--';
  const elapsed = Date.now() - new Date(startedAt).getTime();
  if (elapsed < 0) return '--';
  const secs = Math.floor(elapsed / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m ${secs % 60}s`;
  return `${secs}s`;
}

function getModelBadge(cli?: string | null, model?: string | null) {
  const key = model || cli || '';
  for (const [pattern, badge] of Object.entries(MODEL_BADGE_MAP)) {
    if (key.toLowerCase().includes(pattern)) return badge;
  }
  if (key) return { label: key, style: 'modelDefault' };
  return null;
}

/* ── Page ── */

export default function KomodoAgentsPage() {
  const { snapshot, connected, events, agentLogs } = useKomodoSocket();
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null);

  const activeAgent = snapshot ? PHASE_TO_AGENT[snapshot.phase] : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Agents</h1>
        <ConnectionStatus connected={connected} />
      </div>

      {!snapshot ? (
        <p className={styles.waiting}>Waiting for orchestrator connection...</p>
      ) : (
        <>
          <div className={styles.cardsGrid}>
            {AGENT_NAMES.map((name) => {
              const agent = snapshot.agents[name];
              const isSelected = selectedAgent === name;
              const isActive = activeAgent === name;
              const badge = getModelBadge(agent.cli, agent.model);
              const logCount = (agentLogs[name] || []).length;

              let cardClass = styles.agentBtn;
              if (isSelected) {
                cardClass += ` ${styles[AGENT_SELECTED_STYLE[name]]}`;
              } else if (isActive) {
                cardClass += ` ${styles[AGENT_ACTIVE_STYLE[name]]}`;
              }

              return (
                <button
                  key={name}
                  onClick={() => setSelectedAgent(isSelected ? null : name)}
                  className={cardClass}
                >
                  <div className={styles.agentHeader}>
                    <span className={`${styles.agentIcon} ${styles[AGENT_ICON_STYLE[name]]}`}>
                      {AGENT_ICON_CHAR[name]}
                    </span>
                    <div className={styles.agentInfo}>
                      <h3 className={`${styles.agentName} ${isSelected ? styles[AGENT_NAME_STYLE[name]] : styles.nameDefault}`}>
                        {name}
                      </h3>
                      <div className={styles.statusRow}>
                        <span className={`${styles.statusDot} ${styles[STATUS_DOT[agent.status]]}`} />
                        <span className={`${styles.statusLabel} ${styles[STATUS_LABEL[agent.status]]}`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    {badge && (
                      <span className={`${styles.modelBadge} ${styles[badge.style]}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {agent.browserValidation && (
                    <div className={styles.browserBadge}>
                      <span>🌐</span>
                      Browser Validation
                    </div>
                  )}

                  {agent.currentTask && (
                    <p className={`${styles.agentTask} ${agent.browserValidation ? styles.agentTaskBrowser : ''}`}>
                      {agent.currentTask}
                    </p>
                  )}

                  <div className={styles.statsRow}>
                    {agent.startedAt && <span>{getElapsedTime(agent.startedAt)}</span>}
                    {(agent.totalCost ?? 0) > 0 && <span>${agent.totalCost?.toFixed(2)}</span>}
                    {(agent.completedTasks ?? 0) > 0 && <span>{agent.completedTasks} tasks</span>}
                    {logCount > 0 && (
                      <span className={styles.logCount}>{logCount} logs</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* KOMODO orchestrator card */}
            <div className={styles.komodoCard}>
              <div className={styles.agentHeader}>
                <span className={styles.komodoIcon}>K</span>
                <div className={styles.agentInfo}>
                  <h3 className={styles.komodoName}>KOMODO</h3>
                  <div className={styles.statusRow}>
                    <span className={snapshot.phase === 'idle' ? styles.komodoDotIdle : styles.komodoDotActive} />
                    <span className={snapshot.phase === 'idle' ? styles.komodoLabelIdle : styles.komodoLabelActive}>
                      {snapshot.phase}
                    </span>
                  </div>
                </div>
                <span className={styles.komodoBadge}>Orchestrator</span>
              </div>

              {snapshot.currentTask && (
                <p className={styles.komodoTask}>
                  {snapshot.taskDetails?.title ?? snapshot.currentTask}
                </p>
              )}

              <div className={styles.komodoStats}>
                <span>${snapshot.totalCost.toFixed(2)}</span>
                <span>{snapshot.tasksCompleted} completed</span>
                {snapshot.reviewCycle > 0 && (
                  <span className={styles.reviewBadge}>Review #{snapshot.reviewCycle}</span>
                )}
              </div>
            </div>
          </div>

          {selectedAgent && (
            <AgentDetail
              agentName={selectedAgent}
              agent={snapshot.agents[selectedAgent]}
              logs={agentLogs[selectedAgent] || []}
              events={events}
              onClose={() => setSelectedAgent(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ── Agent Detail Component ── */

interface AgentDetailProps {
  agentName: AgentName;
  agent: {
    name: AgentName;
    status: AgentStatus;
    currentTask: string | null;
    startedAt: string | null;
    cli?: string | null;
    model?: string | null;
    totalCost?: number;
    totalTurns?: number;
    completedTasks?: number;
    browserValidation?: boolean;
  };
  logs: AgentLog[];
  events: { id: string; type: string; timestamp: string; agentName: string | null; message: string }[];
  onClose: () => void;
}

function AgentDetail({ agentName, agent, logs, events, onClose }: AgentDetailProps) {
  const badge = getModelBadge(agent.cli, agent.model);
  const agentEvents = events.filter((e) => e.agentName === agent.name);
  const [activeTab, setActiveTab] = useState<'logs' | 'history'>('logs');

  return (
    <section className={`${styles.detailSection} ${styles[AGENT_DETAIL_STYLE[agentName]]}`}>
      {/* Detail Header */}
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderLeft}>
          <span className={`${styles.detailIcon} ${styles[AGENT_ICON_STYLE[agentName]]}`}>
            {AGENT_ICON_CHAR[agentName]}
          </span>
          <div>
            <div className={styles.detailNameRow}>
              <h2 className={`${styles.detailName} ${styles[AGENT_NAME_STYLE[agentName]]}`}>
                {agent.name}
              </h2>
              <span className={`${styles.detailStatusBadge} ${styles[STATUS_BADGE_STYLE[agent.status]]}`}>
                <span className={`${styles.detailStatusDot} ${styles[STATUS_DOT[agent.status]]}`} />
                {agent.status}
              </span>
              {badge && (
                <span className={`${styles.modelBadge} ${styles[badge.style]}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {agent.currentTask && (
              <p className={styles.detailTask}>{agent.currentTask}</p>
            )}
          </div>
        </div>
        <button onClick={onClose} className={styles.closeBtn}>✕</button>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <Stat label="Status" value={agent.status} />
        {agent.browserValidation && <Stat label="Mode" value="🌐 Browser" />}
        <Stat label="Active Time" value={getElapsedTime(agent.startedAt)} />
        <Stat label="Cost" value={`$${(agent.totalCost ?? 0).toFixed(2)}`} />
        <Stat label="Turns" value={String(agent.totalTurns ?? 0)} />
        <Stat label="Tasks Done" value={String(agent.completedTasks ?? 0)} />
        {agent.startedAt && (
          <Stat label="Started" value={new Date(agent.startedAt).toLocaleTimeString()} />
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          onClick={() => setActiveTab('logs')}
          className={`${styles.tabBtn} ${activeTab === 'logs' ? styles[AGENT_TAB_STYLE[agentName]] : ''}`}
        >
          Live Log ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles[AGENT_TAB_STYLE[agentName]] : ''}`}
        >
          Event History ({agentEvents.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'logs' ? (
          <LiveLogTerminal logs={logs} agentName={agentName} />
        ) : (
          <EventHistory events={agentEvents} />
        )}
      </div>
    </section>
  );
}

/* ── Stat Component ── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}

/* ── Live Log Terminal ── */

function LiveLogTerminal({ logs, agentName }: { logs: AgentLog[]; agentName: AgentName }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  if (logs.length === 0) {
    return (
      <div className={styles.logEmpty}>
        <div className={styles.logEmptyInner}>
          <p>No logs yet</p>
          <p className={styles.logEmptyHint}>Logs will appear here when the agent starts working</p>
        </div>
      </div>
    );
  }

  const textTagClass = `${styles.logTextTag} ${styles[AGENT_NAME_STYLE[agentName]]}`;

  return (
    <div className={styles.logWrapper}>
      <div ref={scrollRef} onScroll={handleScroll} className={styles.logScroll}>
        {logs.map((log) => (
          <div key={log.id} className={styles.logLine}>
            <span className={styles.logTime}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {log.kind === 'tool' ? (
              <>
                <span className={styles.logToolTag}>[tool]</span>
                <span className={styles.logToolContent}>{log.content}</span>
                {log.detail && (
                  <span className={styles.logToolDetail}>{log.detail}</span>
                )}
              </>
            ) : (
              <>
                <span className={textTagClass}>[text]</span>
                <span className={styles.logTextContent}>{log.content}</span>
              </>
            )}
          </div>
        ))}
      </div>
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
          className={styles.scrollBtn}
        >
          Scroll to bottom
        </button>
      )}
    </div>
  );
}

/* ── Event History ── */

function EventHistory({ events }: { events: { id: string; timestamp: string; message: string }[] }) {
  if (events.length === 0) {
    return (
      <div className={styles.historyEmpty}>
        No events recorded for this agent
      </div>
    );
  }

  return (
    <div className={styles.historyScroll}>
      {events.map((evt) => (
        <div key={evt.id} className={styles.historyRow}>
          <span className={styles.historyTime}>
            {new Date(evt.timestamp).toLocaleTimeString()}
          </span>
          <span className={styles.historyMessage}>{evt.message}</span>
        </div>
      ))}
    </div>
  );
}
