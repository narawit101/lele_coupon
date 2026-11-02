"use client";

import { useEffect } from "react";

let openModalsCount = 0;

/**
 * Hook to handle closing modals with Escape key cleanly and locking background scroll
 * @param isOpen - whether the modal is currently open
 * @param onClose - callback to trigger closing
 * @param disabled - optional flag to disable Esc (e.g. while saving/loading)
 */
export function useModalEscape(
  isOpen: boolean,
  onClose: () => void,
  disabled: boolean = false
) {
  useEffect(() => {
    if (!isOpen) return;

    openModalsCount++;
    document.body.classList.add("modal-open");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      openModalsCount = Math.max(0, openModalsCount - 1);
      if (openModalsCount === 0) {
        document.body.classList.remove("modal-open");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, disabled]);
}
