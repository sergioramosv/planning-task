import packageJson from '../../package.json';

/**
 * Application version
 * This is automatically updated by semantic-release based on Conventional Commits
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || (packageJson as any).version || '1.5.4'
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || ''
