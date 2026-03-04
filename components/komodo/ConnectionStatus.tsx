import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  connected: boolean;
}

export function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className={styles.wrapper}>
      <span
        className={`${styles.dot} ${connected ? styles.dotConnected : styles.dotDisconnected}`}
      />
      <span className={styles.label}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}
