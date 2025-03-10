"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";
import { useEffect } from "react";

export function Toaster() {
  const { toasts, toast } = useToast();

  useEffect(() => {
    // Check for success or error messages in URL params
    const url = new URL(window.location.href);
    const successMessage = url.searchParams.get("success");
    const errorMessage = url.searchParams.get("error");

    if (successMessage) {
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      });
      // Remove the parameter from URL
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url);
    }

    if (errorMessage) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Remove the parameter from URL
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url);
    }
  }, [toast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
