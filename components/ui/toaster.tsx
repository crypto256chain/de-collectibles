"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="bg-black/90 border-white/20 backdrop-blur-2xl">
          <div className="grid gap-1">
            {title && <ToastTitle className="text-white font-semibold">{title}</ToastTitle>}
            {description && <ToastDescription className="text-white/80">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose className="text-white/60 hover:text-white" />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
