"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          title: "group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          closeButton:
            "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted",
          success:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-green-500 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-950/30",
          error:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-destructive group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/30",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-primary group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/30",
          warning:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-yellow-500 group-[.toaster]:bg-yellow-50 dark:group-[.toaster]:bg-yellow-950/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
