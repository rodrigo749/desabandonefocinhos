"use client";

import React from "react";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ open, title = "Confirmação", message = "Tem certeza?", onCancel, onConfirm, confirmLabel = "Confirmar", cancelLabel = "Cancelar" }) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>{cancelLabel}</button>
          <button className={styles.confirm} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
