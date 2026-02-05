import { toast as sonnerToast } from "sonner"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"
import { createElement } from "react"

type ToastOptions = {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Success toast - Use for successful operations
 * @example toast.success("Profile updated successfully")
 */
function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    icon: createElement(CheckCircle2, { className: "h-5 w-5 text-green-500" }),
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  })
}

/**
 * Error toast - Use for errors and failures
 * @example toast.error("Failed to save changes")
 */
function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    icon: createElement(XCircle, { className: "h-5 w-5 text-destructive" }),
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  })
}

/**
 * Info toast - Use for informational messages
 * @example toast.info("New features available")
 */
function info(message: string, options?: ToastOptions) {
  return sonnerToast(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    icon: createElement(Info, { className: "h-5 w-5 text-primary" }),
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  })
}

/**
 * Warning toast - Use for warnings that need attention
 * @example toast.warning("Your session will expire soon")
 */
function warning(message: string, options?: ToastOptions) {
  return sonnerToast(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    icon: createElement(AlertTriangle, { className: "h-5 w-5 text-yellow-500" }),
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  })
}

/**
 * Promise toast - Use for async operations
 * @example toast.promise(saveData(), { loading: "Saving...", success: "Saved!", error: "Failed to save" })
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: Error) => string)
  }
) {
  return sonnerToast.promise(promise, messages)
}

/**
 * Dismiss a specific toast or all toasts
 * @example toast.dismiss() // dismisses all
 * @example toast.dismiss(toastId) // dismisses specific toast
 */
function dismiss(toastId?: string | number) {
  return sonnerToast.dismiss(toastId)
}

/**
 * Toast utility for showing notifications
 *
 * @example
 * // Success toast
 * toast.success("Profile saved!")
 *
 * // Error toast with description
 * toast.error("Failed to save", { description: "Please try again" })
 *
 * // Info toast with action
 * toast.info("New version available", {
 *   action: { label: "Update", onClick: () => updateApp() }
 * })
 *
 * // Promise toast
 * toast.promise(saveData(), {
 *   loading: "Saving...",
 *   success: "Saved!",
 *   error: "Failed"
 * })
 */
export const toast = {
  success,
  error,
  info,
  warning,
  promise,
  dismiss,
}
