"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export type ActionFeedbackState = {
  error?: string;
  success?: boolean;
};

type UseActionFeedbackOptions = {
  /** Shown when `state.success` becomes true. */
  successMessage?: string;
  onSuccess?: () => void;
  /** When false, toasts are suppressed (e.g. closed dialog). */
  when?: boolean;
};

/**
 * Shows Sonner toasts for server action results from `useActionState`.
 * Pair with existing `onSuccess` flows (close dialog, reset form).
 */
export function useActionFeedback(
  state: ActionFeedbackState,
  options: UseActionFeedbackOptions = {},
) {
  const { successMessage, onSuccess, when = true } = options;
  const handledSuccess = useRef(false);
  const lastError = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!when) return;
    if (state.error && state.error !== lastError.current) {
      lastError.current = state.error;
      toast.error(state.error);
    }
    if (!state.error) {
      lastError.current = undefined;
    }
  }, [state.error, when]);

  useEffect(() => {
    if (!when) return;
    if (state.success && !handledSuccess.current) {
      handledSuccess.current = true;
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.();
    }
    if (!state.success) {
      handledSuccess.current = false;
    }
  }, [state.success, successMessage, onSuccess, when]);
}

/** Imperative toast for `startTransition` / one-off action calls. */
export function notifyActionResult(
  result: ActionFeedbackState,
  messages: { success: string },
): boolean {
  if (result.error) {
    toast.error(result.error);
    return false;
  }
  if (result.success !== false) {
    toast.success(messages.success);
    return true;
  }
  return false;
}
