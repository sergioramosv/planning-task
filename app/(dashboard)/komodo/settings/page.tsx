'use client';

import { useEffect, useState, useCallback } from 'react';
import type { KomodoConfig, AgentModel, Project } from '@/lib/komodo/config-types';
import { DEFAULT_CONFIG } from '@/lib/komodo/config-types';
import styles from './page.module.css';

const MODEL_OPTIONS: { value: AgentModel; label: string }[] = [
  { value: 'sonnet', label: 'Sonnet' },
  { value: 'opus', label: 'Opus' },
  { value: 'haiku', label: 'Haiku' },
];

const AGENT_LABELS: Record<string, { name: string; icon: string }> = {
  planner: { name: 'Planner', icon: '✎' },
  coder: { name: 'Coder', icon: '⌨' },
  reviewer: { name: 'Reviewer', icon: '⊘' },
};

export default function KomodoSettingsPage() {
  const [config, setConfig] = useState<KomodoConfig>(DEFAULT_CONFIG);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [configRes, projectsRes] = await Promise.all([
        fetch('/api/komodo/config'),
        fetch('/api/projects'),
      ]);

      const configData: KomodoConfig = await configRes.json();
      setConfig(configData);

      const projectsData = await projectsRes.json();
      if (projectsData.error) {
        setProjectsError(projectsData.error);
      } else {
        setProjects(projectsData.projects ?? []);
      }
    } catch {
      setProjectsError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/komodo/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function updateAgentModel(agent: 'planner' | 'coder' | 'reviewer', model: AgentModel) {
    setConfig((prev) => ({
      ...prev,
      agents: {
        ...prev.agents,
        [agent]: { ...prev.agents[agent], model },
      },
    }));
  }

  function updateAgentMaxTurns(agent: 'planner' | 'coder' | 'reviewer', maxTurns: number) {
    setConfig((prev) => ({
      ...prev,
      agents: {
        ...prev.agents,
        [agent]: { ...prev.agents[agent], maxTurns },
      },
    }));
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.muted}>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <div className={styles.headerRight}>
          {saveStatus === 'saved' && (
            <span className={styles.statusSaved}>Saved successfully</span>
          )}
          {saveStatus === 'error' && (
            <span className={styles.statusError}>Failed to save</span>
          )}
          <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Active Project */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Project</h2>
        {projectsError ? (
          <p className={styles.muted}>{projectsError}</p>
        ) : (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Project</label>
            <select
              value={config.activeProjectId}
              onChange={(e) => setConfig((prev) => ({ ...prev, activeProjectId: e.target.value }))}
              className={styles.select}
            >
              <option value="">— Select a project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Agent Configuration */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Agent Configuration</h2>
        <div className={styles.agentGrid}>
          {(['planner', 'coder', 'reviewer'] as const).map((agent) => (
            <div key={agent} className={styles.agentCard}>
              <h3 className={styles.agentName}>
                <span className={styles.agentIcon}>{AGENT_LABELS[agent].icon}</span>
                {AGENT_LABELS[agent].name}
              </h3>
              <div className={styles.agentFields}>
                <div>
                  <label className={styles.labelSmall}>Model</label>
                  <select
                    value={config.agents[agent].model}
                    onChange={(e) => updateAgentModel(agent, e.target.value as AgentModel)}
                    className={styles.selectSmall}
                  >
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.labelSmall}>Max Turns</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={config.agents[agent].maxTurns}
                    onChange={(e) => updateAgentMaxTurns(agent, parseInt(e.target.value) || 1)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Orchestrator Settings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Orchestrator</h2>
        <div className={styles.orchGrid}>
          {/* Max Review Cycles */}
          <div>
            <label className={styles.label}>Max Review Cycles</label>
            <input
              type="number"
              min={1}
              max={10}
              value={config.maxReviewCycles}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxReviewCycles: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                }))
              }
              className={styles.inputConstrained}
            />
            <p className={styles.hint}>Number of review iterations before stopping (1-10)</p>
          </div>

          {/* Continuous Mode */}
          <div className={styles.orchFullWidth}>
            <div className={styles.toggleRow}>
              <button
                type="button"
                role="switch"
                aria-checked={config.continuousMode}
                onClick={() =>
                  setConfig((prev) => ({ ...prev, continuousMode: !prev.continuousMode }))
                }
                className={`${styles.toggle} ${config.continuousMode ? styles.toggleOn : styles.toggleOff}`}
              >
                <span className={`${styles.toggleThumb} ${config.continuousMode ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
              </button>
              <div>
                <span className={styles.toggleLabel}>Continuous Mode</span>
                <p className={styles.toggleHint}>
                  Automatically pick up the next task after completing one
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
