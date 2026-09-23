import { useRef } from "react";
import Modal from "./Modal";

function ConfirmDeleteDialog({ title, name, loading, error, onConfirm, onClose, returnFocusRef, fallbackFocusRef }) {
  const cancelRef = useRef(null);
  const buttonStyle = {
    border: "none", borderRadius: 8, padding: "10px 16px", color: "#fff",
    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
  };

  return (
    <Modal title={title} loading={loading} onClose={onClose}
      initialFocusRef={cancelRef} returnFocusRef={returnFocusRef} fallbackFocusRef={fallbackFocusRef}>
      <p style={{ color: "#e6eef8" }}>Удалить «{name}»?</p>
      <p style={{ color: "#9ca3af" }}>Это действие нельзя отменить.</p>
      {error && <p role="alert" style={{ color: "#fecaca" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button type="button" ref={cancelRef} disabled={loading} onClick={onClose}
          style={{ ...buttonStyle, background: "#374151" }}>Отмена</button>
        <button type="button" disabled={loading} onClick={onConfirm}
          style={{ ...buttonStyle, background: "#dc2626" }}>
          {loading ? "Удаление…" : "Удалить"}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteDialog;
