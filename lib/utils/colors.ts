export interface ColorTheme {
  name: string
  bg: string
  text: string
  border: string
  icon: string
}

export const PROJECT_COLORS: ColorTheme[] = [
  {
    name: 'blue',
    bg: '#eff6ff', // blue-50
    text: '#1e3a8a', // blue-900
    border: '#bfdbfe', // blue-200
    icon: '#3b82f6', // blue-500
  },
  {
    name: 'green',
    bg: '#f0fdf4', // green-50
    text: '#14532d', // green-900
    border: '#bbf7d0', // green-200
    icon: '#22c55e', // green-500
  },
  {
    name: 'purple',
    bg: '#faf5ff', // purple-50
    text: '#581c87', // purple-900
    border: '#e9d5ff', // purple-200
    icon: '#a855f7', // purple-500
  },
  {
    name: 'amber',
    bg: '#fffbeb', // amber-50
    text: '#78350f', // amber-900
    border: '#fde68a', // amber-200
    icon: '#f59e0b', // amber-500
  },
  {
    name: 'red',
    bg: '#fef2f2', // red-50
    text: '#7f1d1d', // red-900
    border: '#fecaca', // red-200
    icon: '#ef4444', // red-500
  },
  {
    name: 'indigo',
    bg: '#eef2ff', // indigo-50
    text: '#312e81', // indigo-900
    border: '#c7d2fe', // indigo-200
    icon: '#6366f1', // indigo-500
  },
  {
    name: 'pink',
    bg: '#fdf2f8', // pink-50
    text: '#831843', // pink-900
    border: '#fbcfe8', // pink-200
    icon: '#ec4899', // pink-500
  },
  {
    name: 'teal',
    bg: '#f0fdfa', // teal-50
    text: '#134e4a', // teal-900
    border: '#99f6e4', // teal-200
    icon: '#14b8a6', // teal-500
  },
]

export function getProjectColor(id: string): ColorTheme {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % PROJECT_COLORS.length
  return PROJECT_COLORS[index]
}
