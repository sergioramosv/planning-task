import { render, act } from '@testing-library/react'
import NotificationPush from '@/components/dashboard/NotificationPush'

// Mock useAuth
const mockUseAuth = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useNotifications
const mockMarkAsRead = jest.fn()
const mockUseNotifications = jest.fn()
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: (userId: string | null) => mockUseNotifications(userId),
}))

// Mock react-hot-toast
const mockToastCustom = jest.fn()
const mockToastDismiss = jest.fn()
jest.mock('react-hot-toast', () => {
  const actual = {
    custom: (...args: any[]) => mockToastCustom(...args),
    dismiss: (...args: any[]) => mockToastDismiss(...args),
  }
  return {
    __esModule: true,
    default: actual,
    Toaster: () => <div data-testid="toaster" />,
  }
})

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Bell: () => <svg data-testid="icon-bell" />,
  Info: () => <svg data-testid="icon-info" />,
  AlertTriangle: () => <svg data-testid="icon-alert" />,
  CheckCircle: () => <svg data-testid="icon-check" />,
  XCircle: () => <svg data-testid="icon-x" />,
}))

// Mock CSS module
jest.mock('@/components/dashboard/NotificationPush.module.css', () => ({
  toast: 'toast',
  toastVisible: 'toastVisible',
  toastHidden: 'toastHidden',
  toastIcon: 'toastIcon',
  toastIconinfo: 'toastIconinfo',
  toastIconsuccess: 'toastIconsuccess',
  toastIconwarning: 'toastIconwarning',
  toastIconerror: 'toastIconerror',
  toastContent: 'toastContent',
  toastTitle: 'toastTitle',
  toastMessage: 'toastMessage',
  toastClose: 'toastClose',
  toasterContainer: 'toasterContainer',
}))

describe('NotificationPush Component', () => {
  const mockUser = { uid: 'user-1', displayName: 'Test User' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: mockUser })
    mockUseNotifications.mockReturnValue({
      notifications: [],
      markAsRead: mockMarkAsRead,
    })
  })

  it('should render without crashing', () => {
    const { container } = render(<NotificationPush />)
    expect(container).toBeTruthy()
  })

  it('should render the Toaster component', () => {
    const { getByTestId } = render(<NotificationPush />)
    expect(getByTestId('toaster')).toBeTruthy()
  })

  it('should not show toast on initial load with existing notifications', () => {
    const existingNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Existing notification',
        message: 'This was here before',
        date: Date.now() - 10000,
        read: false,
        type: 'info' as const,
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        title: 'Another existing',
        message: 'Also here before',
        date: Date.now() - 5000,
        read: false,
        type: 'success' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: existingNotifications,
      markAsRead: mockMarkAsRead,
    })

    render(<NotificationPush />)

    // On first load, it should only track existing notifications, not show toasts
    expect(mockToastCustom).not.toHaveBeenCalled()
  })

  it('should not show toast when no user is logged in', () => {
    mockUseAuth.mockReturnValue({ user: null })

    const notifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        title: 'New notification',
        message: 'Should not show',
        date: Date.now(),
        read: false,
        type: 'info' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications,
      markAsRead: mockMarkAsRead,
    })

    render(<NotificationPush />)

    expect(mockToastCustom).not.toHaveBeenCalled()
  })

  it('should show toast when new notifications arrive after initialization', () => {
    const initialNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Existing',
        message: 'Already here',
        date: Date.now() - 10000,
        read: false,
        type: 'info' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: initialNotifications,
      markAsRead: mockMarkAsRead,
    })

    const { rerender } = render(<NotificationPush />)

    // toast.custom should not be called on initial render
    expect(mockToastCustom).not.toHaveBeenCalled()

    // Now simulate a new notification arriving
    const updatedNotifications = [
      ...initialNotifications,
      {
        id: 'notif-new',
        userId: 'user-1',
        title: 'New notification',
        message: 'Just arrived',
        date: Date.now(),
        read: false,
        type: 'success' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: updatedNotifications,
      markAsRead: mockMarkAsRead,
    })

    rerender(<NotificationPush />)

    // Now toast.custom should have been called for the new notification
    expect(mockToastCustom).toHaveBeenCalledTimes(1)
    expect(mockToastCustom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        duration: 6000,
        position: 'top-right',
      })
    )
  })

  it('should show toast for each new notification when multiple arrive', () => {
    const initialNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Existing',
        message: 'Already here',
        date: Date.now() - 10000,
        read: false,
        type: 'info' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: initialNotifications,
      markAsRead: mockMarkAsRead,
    })

    const { rerender } = render(<NotificationPush />)

    // Add two new notifications
    const updatedNotifications = [
      ...initialNotifications,
      {
        id: 'notif-new-1',
        userId: 'user-1',
        title: 'First new',
        message: 'New 1',
        date: Date.now(),
        read: false,
        type: 'info' as const,
      },
      {
        id: 'notif-new-2',
        userId: 'user-1',
        title: 'Second new',
        message: 'New 2',
        date: Date.now(),
        read: false,
        type: 'warning' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: updatedNotifications,
      markAsRead: mockMarkAsRead,
    })

    rerender(<NotificationPush />)

    expect(mockToastCustom).toHaveBeenCalledTimes(2)
  })

  it('should not show toast for already read notifications', () => {
    const initialNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Existing',
        message: 'Already here',
        date: Date.now() - 10000,
        read: false,
        type: 'info' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: initialNotifications,
      markAsRead: mockMarkAsRead,
    })

    const { rerender } = render(<NotificationPush />)

    // Add a new notification that is already read
    const updatedNotifications = [
      ...initialNotifications,
      {
        id: 'notif-read',
        userId: 'user-1',
        title: 'Already read',
        message: 'Was already read',
        date: Date.now(),
        read: true,
        type: 'info' as const,
      },
    ]

    mockUseNotifications.mockReturnValue({
      notifications: updatedNotifications,
      markAsRead: mockMarkAsRead,
    })

    rerender(<NotificationPush />)

    // Should not show toast for already-read notifications
    expect(mockToastCustom).not.toHaveBeenCalled()
  })

  it('should call useNotifications with correct userId', () => {
    render(<NotificationPush />)

    expect(mockUseNotifications).toHaveBeenCalledWith('user-1')
  })

  it('should call useNotifications with null when no user', () => {
    mockUseAuth.mockReturnValue({ user: null })

    render(<NotificationPush />)

    expect(mockUseNotifications).toHaveBeenCalledWith(null)
  })
})
