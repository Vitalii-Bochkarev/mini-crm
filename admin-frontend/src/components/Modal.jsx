import { useEffect, useId, useRef } from "react";

function Modal({ title, children, loading = false, onClose }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    const firstField = dialogRef.current?.querySelector(
      "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
    );
    const closeButton = dialogRef.current?.querySelector("button[data-modal-close]");
    (firstField || closeButton)?.focus();

    return () => {
      if (previousFocusRef.current instanceof HTMLElement && previousFocusRef.current.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      onMouseDown={handleOverlayMouseDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(2, 6, 23, 0.78)",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: "min(680px, 100%)",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "#111827",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <h2 id={titleId} style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>
            {title}
          </h2>
          <button
            type="button"
            data-modal-close
            aria-label="Закрыть окно"
            onClick={onClose}
            disabled={loading}
            style={{
              border: "none",
              background: "transparent",
              color: "#9ca3af",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 24,
              lineHeight: 1,
              opacity: loading ? 0.6 : 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
